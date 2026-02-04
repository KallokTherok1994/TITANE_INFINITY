#!/bin/bash

# TITANE∞ - Installation et lancement Cloudflare Tunnel
# Alternative au tunnel VS Code qui pose problème avec Vite

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        TITANE∞ - Cloudflare Tunnel Setup                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si cloudflared est installé
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared déjà installé"
    cloudflared --version
else
    echo "📦 Installation de cloudflared..."
    
    # Détecter l'OS
    if [ -f /etc/debian_version ]; then
        echo "🐧 Debian/Ubuntu détecté"
        sudo apt update
        sudo apt install cloudflared -y
    elif [ -f /etc/arch-release ]; then
        echo "🐧 Arch Linux détecté"
        sudo pacman -S cloudflared --noconfirm
    else
        echo "⚠️  OS non reconnu, installation manuelle requise:"
        echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "🚀 LANCEMENT DU TUNNEL CLOUDFLARE"
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "📡 Connexion au serveur local: http://localhost:5173"
echo "🌐 Un tunnel public sera créé automatiquement"
echo ""
echo "⏳ Lancement..."
echo ""

# Lancer le tunnel
cloudflared tunnel --url http://localhost:5173

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "ℹ️  Le tunnel s'est arrêté"
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "Pour relancer: bash ./setup-cloudflare-tunnel.sh"
echo ""
