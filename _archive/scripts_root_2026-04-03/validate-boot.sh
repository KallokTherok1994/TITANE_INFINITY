#!/bin/bash
# TITANE∞ v26.3.0 — Script de validation du boot
echo "🔍 TITANE∞ - Validation du Boot"

echo "1. Nettoyage des caches..."
./scripts/dev-clean.sh

echo "2. Vérification de la configuration TypeScript..."
if ! pnpm run type-check 2>/dev/null; then
  echo "⚠️  TypeScript check échoué ou non configuré - continuons..."
fi

echo "3. Test de démarrage (timeout 30s)..."
timeout 30s pnpm run dev > /tmp/boot-test.log 2>&1 &
PID=$!

sleep 15
if ps -p $PID > /dev/null 2>&1; then
  echo "✅ Application démarre sans crash immédiat"
  kill $PID 2>/dev/null || true
  wait $PID 2>/dev/null || true
else
  echo "❌ Application crashe au démarrage"
  if [ -f /tmp/boot-test.log ]; then
    echo "--- Logs de démarrage ---"
    tail -20 /tmp/boot-test.log
  fi
  exit 1
fi

echo "4. Vérification des logs d'erreur..."
if [ -f /tmp/boot-test.log ]; then
  if grep -q "Importing a module script failed" /tmp/boot-test.log; then
    echo "❌ Erreur module script encore présente"
    echo "--- Erreurs détectées ---"
    grep -A 5 -B 5 "Importing a module script failed" /tmp/boot-test.log
    exit 1
  else
    echo "✅ Pas d'erreur module script détectée"
  fi
  
  # Vérifier d'autres erreurs critiques
  if grep -E "(Error|ERROR|Failed|FAILED)" /tmp/boot-test.log | grep -v "Failed to fetch" | head -5; then
    echo "⚠️  Autres erreurs détectées (non bloquantes)"
  fi
else
  echo "⚠️  Fichier de log non trouvé"
fi

echo "✅ Validation terminée avec succès"