#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ — Network Deployment Script
# Déploie l'application sur le réseau local
# ═══════════════════════════════════════════════════════════════

set -e

cd /home/titane/Documents/TITANE_INFINITY

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🌐 TITANE∞ NETWORK DEPLOYMENT                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Récupérer l'IP du réseau local
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "📡 Adresse IP locale: $LOCAL_IP"
echo ""

# Configurer l'environnement graphique
if [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
    if [ -e "$XDG_RUNTIME_DIR/wayland-1" ]; then
        export WAYLAND_DISPLAY=wayland-1
        export GDK_BACKEND=wayland
    elif [ -e "/tmp/.X11-unix/X1" ]; then
        export DISPLAY=:1
    elif [ -e "/tmp/.X11-unix/X0" ]; then
        export DISPLAY=:0
    fi
fi

# Mode de déploiement
MODE=${1:-"dev"}

case $MODE in
    "dev")
        echo "🚀 Mode: Development (TAURI-ONLY)"
        echo ""
        echo "🖥️  L'application s'ouvre dans la fenêtre Tauri (aucun serveur HTTP)"
        echo ""

        # Lancer en mode dev avec Tauri
        npm run tauri:dev
        ;;

    "web")
        echo "❌ Mode web-only désactivé (TAURI-ONLY)"
        exit 1
        ;;

    "preview")
        echo "❌ Mode preview HTTP désactivé (TAURI-ONLY)"
        exit 1
        ;;

    "build")
        echo "🔨 Mode: Build Only"
        echo ""

        # Build Tauri pour distribution
        npm run tauri:build

        echo ""
        echo "✅ Build terminé!"
        echo "📦 Packages disponibles dans: src-tauri/target/release/bundle/"
        ;;

    *)
        echo "Usage: $0 [dev|web|preview|build]"
        echo ""
        echo "Modes:"
        echo "  dev     - Développement avec Tauri + Hot Reload (défaut)"
        echo "  web     - Serveur web uniquement (sans Tauri)"
        echo "  preview - Preview build de production"
        echo "  build   - Build complet pour distribution"
        exit 1
        ;;
esac
