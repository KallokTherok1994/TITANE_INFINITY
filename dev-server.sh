#!/bin/bash
# TITANE∞ v15.5 - Dev Server Launcher (non-blocking)
# Démarre Vite en arrière-plan pour Tauri

echo "🚀 Démarrage Vite dev server..."

# Tuer les anciens processus Vite
pkill -9 -f "vite" 2>/dev/null || true

# Démarrer Vite en arrière-plan
nohup npm run dev > /dev/null 2>&1 &

# Attendre que le serveur soit prêt (max 15s)
for i in {1..30}; do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Vite prêt sur http://localhost:5173"
    exit 0
  fi
  sleep 0.5
done

echo "⚠️  Timeout: Vite n'a pas démarré dans les 15s"
exit 1
