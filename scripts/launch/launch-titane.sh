#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ — Launcher Script
# Exécutez ce script depuis un terminal graphique
# ═══════════════════════════════════════════════════════════════

cd /home/titane/Documents/TITANE_INFINITY

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 TITANE∞ LAUNCHER                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Détecter et configurer l'affichage graphique
if [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
    echo "⚠️  Aucun affichage graphique détecté"

    # Essayer de détecter Wayland d'abord (Pop!_OS Cosmic utilise wayland-1)
    if [ -e "$XDG_RUNTIME_DIR/wayland-1" ]; then
        export WAYLAND_DISPLAY=wayland-1
        export GDK_BACKEND=wayland
        echo "✅ Wayland détecté (wayland-1)"
    elif [ -e "$XDG_RUNTIME_DIR/wayland-0" ]; then
        export WAYLAND_DISPLAY=wayland-0
        export GDK_BACKEND=wayland
        echo "✅ Wayland détecté (wayland-0)"
    # Essayer X11 (X1 pour l'utilisateur, X0 pour greeter)
    elif [ -e "/tmp/.X11-unix/X1" ]; then
        export DISPLAY=:1
        echo "✅ X11 détecté, DISPLAY=:1"
    elif [ -e "/tmp/.X11-unix/X0" ]; then
        export DISPLAY=:0
        echo "✅ X11 détecté, DISPLAY=:0"
    else
        echo "❌ ERREUR: Aucun serveur graphique trouvé!"
        echo ""
        echo "Solutions possibles:"
        echo "  1. Lancez ce script depuis un terminal graphique (GNOME Terminal, Konsole, etc.)"
        echo "  2. Connectez-vous à une session graphique (pas SSH sans X forwarding)"
        echo "  3. Si vous êtes en SSH, utilisez: ssh -X user@host"
        echo ""
        exit 1
    fi
fi

# Pour GTK/WebKit sur Wayland
if [ -n "$WAYLAND_DISPLAY" ]; then
    export GDK_BACKEND=wayland,x11
fi

# Vérifier GTK
if ! command -v gtk-launch &> /dev/null; then
    echo "⚠️  GTK non trouvé, installation recommandée:"
    echo "    sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev"
fi

echo "📊 Environment:"
echo "   DISPLAY=$DISPLAY"
echo "   WAYLAND_DISPLAY=$WAYLAND_DISPLAY"
echo "   XDG_SESSION_TYPE=$XDG_SESSION_TYPE"
echo "   GDK_BACKEND=${GDK_BACKEND:-auto}"
echo "   PWD=$PWD"

echo ""
echo "🚀 Lancement de TITANE∞..."
pnpm run tauri:dev
