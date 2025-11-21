#!/bin/bash
# TITANE∞ v15.5 - Build via Docker Ubuntu 24.04

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🐳 BUILD TAURI VIA DOCKER (Ubuntu 24.04 + GLIBC 2.39)      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo ""
    echo "Installation Docker :"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo "  sudo usermod -aG docker $USER"
    echo "  newgrp docker"
    exit 1
fi

echo "✅ Docker détecté : $(docker --version)"
echo ""

# Build image
echo "🔨 1. Construction de l'image Docker..."
docker build -t titane-builder:ubuntu24 . || {
    echo "❌ Échec build image Docker"
    exit 1
}
echo "✅ Image construite : titane-builder:ubuntu24"
echo ""

# Build Tauri
echo "🚀 2. Compilation Tauri dans container..."
echo ""

docker run --rm -v "$(pwd):/app" titane-builder:ubuntu24 bash -c "
    echo '📦 Installation dépendances npm...'
    npm install || exit 1
    echo ''
    echo '🔧 Build frontend...'
    npm run build || exit 1
    echo ''
    echo '🦀 Compilation Rust (cela peut prendre 5-10 minutes)...'
    cargo build --release --manifest-path=src-tauri/Cargo.toml || exit 1
    echo ''
    echo '✅ Build terminé !'
    echo ''
    echo 'Binaire : src-tauri/target/release/titane-infinity'
    ls -lh src-tauri/target/release/titane-infinity
" || {
    echo "❌ Échec build Tauri"
    exit 1
}

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  ✅ BUILD DOCKER RÉUSSI !                                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Binaire généré :"
echo "  src-tauri/target/release/titane-infinity"
echo ""
echo "Tester l'application :"
echo "  ./src-tauri/target/release/titane-infinity"
echo ""
echo "Info binaire :"
ldd src-tauri/target/release/titane-infinity | grep libc
file src-tauri/target/release/titane-infinity
