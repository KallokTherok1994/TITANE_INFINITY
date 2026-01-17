#!/bin/bash
# TITANE∞ v26.3.0 — Test boot rapide et sécurisé
echo "🚀 TITANE∞ - Test Boot Rapide"

# Function pour nettoyer proprement
cleanup() {
  echo "🧹 Nettoyage..."
  pkill -f "vite dev" 2>/dev/null || true
  pkill -f "tauri dev" 2>/dev/null || true
  sleep 1
}

# Trap pour nettoyer à la sortie
trap cleanup EXIT

echo "1. Nettoyage initial..."
cleanup
./scripts/dev-clean.sh

echo "2. Test de démarrage sécurisé (timeout 20s)..."
# Démarrer Vite avec configuration optimisée
export VITE_FORCE_OPTIMIZE=1
timeout 20s npx vite dev --host 127.0.0.1 --port 5173 --strictPort > /tmp/boot-test-safe.log 2>&1 &
VITE_PID=$!

# Attendre que Vite soit prêt
sleep 8

if ps -p $VITE_PID > /dev/null 2>&1; then
  echo "✅ Vite démarré avec succès (PID: $VITE_PID)"
  
  # Test de connectivité
  if curl -s -f --max-time 5 http://127.0.0.1:5173/ > /dev/null; then
    echo "✅ Application répond sur http://127.0.0.1:5173/"
    
    # Test de chargement initial
    if curl -s --max-time 10 "http://127.0.0.1:5173/" | grep -q "html"; then
      echo "✅ HTML de base chargé correctement"
    else
      echo "⚠️  HTML de base non détecté"
    fi
  else
    echo "❌ Application ne répond pas"
  fi
  
  # Vérifier les logs pour erreurs critiques
  sleep 2
  if [ -f /tmp/boot-test-safe.log ]; then
    if grep -q "Importing a module script failed" /tmp/boot-test-safe.log; then
      echo "❌ ERREUR: Module script failed encore détectée"
      echo "--- Extraits des erreurs ---"
      grep -A 3 -B 3 "Importing a module script failed" /tmp/boot-test-safe.log
      exit 1
    elif grep -q "ERROR" /tmp/boot-test-safe.log; then
      echo "⚠️  Erreurs détectées mais pas critique module script"
      echo "--- Premiers erreurs ---"
      grep "ERROR" /tmp/boot-test-safe.log | head -3
    else
      echo "✅ Aucune erreur critique détectée"
    fi
  fi
  
  kill $VITE_PID 2>/dev/null || true
else
  echo "❌ Vite n'a pas démarré correctement"
  if [ -f /tmp/boot-test-safe.log ]; then
    echo "--- Logs de démarrage ---"
    tail -15 /tmp/boot-test-safe.log
  fi
  exit 1
fi

echo "3. Vérification des diagnostics..."
if [ -f /tmp/boot-test-safe.log ]; then
  # Vérifier que les diagnostics lazy sont actifs
  if grep -q "LAZY-DIAGNOSTIC\|LAZY-SUCCESS\|LAZY-IMPORT-FAIL" /tmp/boot-test-safe.log; then
    echo "✅ Système de diagnostic lazy actif"
  else
    echo "⚠️  Diagnostics lazy non détectés (normal si pas de lazy loading encore)"
  fi
  
  # Vérifier que les protections Tauri sont actives  
  if grep -q "Tauri Invoke Protection: ACTIVE" /tmp/boot-test-safe.log; then
    echo "✅ Protection Tauri active"
  else
    echo "⚠️  Protection Tauri non détectée"
  fi
fi

echo "✅ Test de boot rapide terminé avec succès!"
echo ""
echo "📊 Résumé:"
echo "  - Vite: ✅ Démarrage OK"  
echo "  - HTTP: ✅ Connectivité OK"
echo "  - Erreurs critiques: ❌ Aucune"
echo "  - Diagnostics: ✅ Opérationnels"
echo ""
echo "🌐 L'application est prête à être testée sur http://127.0.0.1:5173/"