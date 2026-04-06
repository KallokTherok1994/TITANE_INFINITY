#!/usr/bin/env bash
# TITANE∞ - Script wrapper amélioré pour dev:tauri
# Automatise le nettoyage et la validation avant lancement

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Fonction d'aide
show_help() {
    cat << 'EOF'
🚀 TITANE∞ Dev:Tauri - Wrapper amélioré

USAGE:
    pnpm run dev:tauri [OPTIONS]

OPTIONS:
    --help, -h      Affiche cette aide
    --clean         Force le nettoyage avant démarrage
    --smoke N       Mode test (arrêt après N secondes)
    --no-ollama     Démarre sans Ollama
    --polling       Active le polling fichiers (Docker/VM)
    --force         Force le démarrage même si des processus existent

COMMANDES DISPONIBLES:
    pnpm run dev:tauri              # Démarrage normal
    pnpm run dev:tauri:clean        # Nettoyage puis démarrage
    pnpm run dev:cleanup            # Nettoyage seul
    pnpm run dev:tauri --smoke 10   # Test 10 secondes
    pnpm run dev:tauri --no-ollama  # Sans Ollama

RÉSOLUTION DE PROBLÈMES:
    🔧 Port 5173 occupé          → pnpm run dev:cleanup
    🔧 Processus zombies         → pnpm run dev:cleanup
    🔧 Erreurs de monitoring     → rm -rf runtime/dev/logs/*
    🔧 Problèmes audio           → ./scripts/fix-audio.sh
    🔧 Limite inotify           → sudo sysctl fs.inotify.max_user_watches=524288

LOGS:
    📂 Monitoring: runtime/dev/logs/tauri-dev-monitor.log
    📂 Vite:       runtime/dev/logs/vite.log
    📂 Status:     runtime/dev/logs/*status*.json
EOF
}

# Traiter les arguments
FORCE_CLEAN=false
FORCE_START=false
ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      show_help
      exit 0
      ;;
    --clean)
      FORCE_CLEAN=true
      shift
      ;;
    --force)
      FORCE_START=true
      shift
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

# Nettoyage automatique si demandé
if [[ "$FORCE_CLEAN" = true ]]; then
    echo "🧹 Nettoyage forcé de l'environnement dev..."
    bash scripts/dev/cleanup-dev-env.sh
    echo ""
fi

# Vérification de l'environnement
echo "🔍 Vérification de l'environnement dev..."

# Vérifier les processus conflictuels
TITANE_PROCS=$(pgrep -f "titane.*infinity" || true)
VITE_PROCS=$(pgrep -f "vite.*dev" || true)

if [[ -n "$TITANE_PROCS" || -n "$VITE_PROCS" ]] && [[ "$FORCE_START" != true ]]; then
    echo "⚠️  Processus dev détectés:"
    [[ -n "$TITANE_PROCS" ]] && echo "   TITANE: $TITANE_PROCS"
    [[ -n "$VITE_PROCS" ]] && echo "   Vite: $VITE_PROCS"
    echo ""
    echo "💡 Solutions:"
    echo "   1. Nettoyage automatique: pnpm run dev:tauri --clean"
    echo "   2. Force le démarrage:    pnpm run dev:tauri --force"
    echo "   3. Nettoyage manuel:      pnpm run dev:cleanup"
    exit 1
fi

# Vérification des ports
BUSY_PORTS=""
for PORT in 5173 1420; do
    if ss -tln | grep -q ":$PORT "; then
        BUSY_PORTS="$BUSY_PORTS $PORT"
    fi
done

if [[ -n "$BUSY_PORTS" ]] && [[ "$FORCE_START" != true ]]; then
    echo "❌ Ports occupés:$BUSY_PORTS"
    echo "💡 Solution: pnpm run dev:cleanup"
    exit 1
fi

# Vérification de la configuration runtime
if [[ ! -f "runtime/dev/tauri.conf.json" ]]; then
    echo "❌ Configuration dev manquante: runtime/dev/tauri.conf.json"
    echo "💡 Vérifiez l'intégrité du repository"
    exit 1
fi

# Créer les dossiers de logs
mkdir -p runtime/dev/logs

echo "✅ Environnement dev prêt"
echo ""

# Démarrer le monitoring dev
echo "🚀 Démarrage TITANE∞ Dev avec monitoring..."
exec node scripts/launch/dev_tauri_monitor.mjs "${ARGS[@]}"