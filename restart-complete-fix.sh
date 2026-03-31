#!/usr/bin/env bash
# Script de redémarrage COMPLET avec diagnostic final

echo "🔥 REDÉMARRAGE COMPLET TITANE∞"
echo "════════════════════════════════════════════════"
echo ""

# 1. Nettoyer COMPLÈTEMENT
echo "1️⃣ Nettoyage complet..."
pkill -9 -f "titane-infinity" 2>/dev/null
pkill -9 -f "tauri" 2>/dev/null
pkill -9 -f "pnpm run dev" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
sleep 2
echo "   ✅ Processus nettoyés"

# 2. Nettoyer le cache
echo "2️⃣ Nettoyage cache..."
rm -rf src-tauri/target/debug/.fingerprint 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
echo "   ✅ Cache nettoyé"

# 3. Vérifier les prérequis
echo "3️⃣ Vérification prérequis..."

if ! command -v pnpm >/dev/null 2>&1; then
    echo "   ❌ pnpm non trouvé"
    exit 1
fi
echo "   ✅ pnpm OK"

if ! curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "   ⚠️  Ollama non actif - démarrage..."
    ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    if ! curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
        echo "   ❌ Ollama n'a pas démarré"
        exit 1
    fi
fi
echo "   ✅ Ollama OK"

# 4. Relancer l'application
echo ""
echo "4️⃣ Lancement TITANE∞..."
echo "   Attendez que la fenêtre native s'ouvre (NE PAS ouvrir le navigateur)..."
echo ""

cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
exec pnpm run dev:tauri
