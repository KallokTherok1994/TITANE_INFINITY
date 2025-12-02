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
        echo "🚀 Mode: Development (Hot Reload)"
        echo ""
        echo "📊 URLs d'accès:"
        echo "   Local:   http://localhost:5173"
        echo "   Réseau:  http://$LOCAL_IP:5173"
        echo ""
        echo "🖥️  Application Tauri accessible sur cette machine"
        echo ""

        # Lancer en mode dev avec Tauri
        npm run tauri:dev
        ;;

    "web")
        echo "🌐 Mode: Web Only (sans Tauri)"
        echo ""
        echo "📊 URLs d'accès:"
        echo "   Local:   http://localhost:5173"
        echo "   Réseau:  http://$LOCAL_IP:5173"
        echo ""
        echo "⚠️  Mode web uniquement - certaines fonctions Tauri désactivées"
        echo ""

        # Lancer uniquement Vite
        npm run vite:dev
        ;;

    "preview")
        echo "📦 Mode: Production Preview"
        echo ""

        # Build production
        echo "🔨 Building production assets..."
        npm run build

        echo ""
        echo "📊 URLs d'accès:"
        echo "   Local:   http://localhost:4173"
        echo "   Réseau:  http://$LOCAL_IP:4173"
        echo ""

        # Lancer le serveur de preview
        npm run preview -- --host
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
