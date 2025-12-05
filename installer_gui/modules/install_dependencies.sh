#!/bin/bash
# TITANE∞ OS - Installation des dépendances

echo "📦 Installation des dépendances système..."

# Rust
if ! command -v cargo &> /dev/null; then
    echo "⚙️  Installation de Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "✅ Rust installé"
fi

# Node.js et PNPM
if ! command -v pnpm &> /dev/null; then
    echo "⚙️  Installation de PNPM..."
    npm install -g pnpm
    echo "✅ PNPM installé"
fi

# WebKitGTK
if ! dpkg -l 2>/dev/null | grep -q "libwebkit2gtk-4.1"; then
    echo "⚙️  Installation de WebKitGTK 4.1..."
    sudo apt-get update
    sudo apt-get install -y \
        libwebkit2gtk-4.1-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        patchelf \
        build-essential
    echo "✅ WebKitGTK installé"
fi

echo "✅ Toutes les dépendances sont installées"
