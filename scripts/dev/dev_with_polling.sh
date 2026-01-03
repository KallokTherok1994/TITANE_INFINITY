#!/bin/bash
# TITANE∞ v24.2.0 - Lancement Dev avec Polling
# Contournement ENOSPC en mode conteneur

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 TITANE∞ Dev - Mode Polling (Conteneur Safe)             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚙️  Configuration: Utilisation du polling au lieu d'inotify"
echo "📊 Impact: CPU légèrement plus élevé, mais évite ENOSPC"
echo ""

# Exporter la variable pour forcer le polling
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=300

echo "✅ Variables d'environnement:"
echo "   CHOKIDAR_USEPOLLING=true"
echo "   CHOKIDAR_INTERVAL=300ms"
echo ""

cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

echo "🚀 Lancement de pnpm run tauri dev..."
echo ""
exec pnpm run tauri dev
