#!/bin/bash
# quick_check_docker.sh - Vérification rapide compilation dans Docker

set -e

echo "🔮 TITANE∞ - Vérification compilation Docker (Ubuntu 24.04)"
echo ""

docker run --rm -v "$(pwd)":/app -w /app ubuntu:24.04 bash << 'DOCKEREOF'
set -e

echo "📦 Installation dépendances..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    curl \
    build-essential \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    pkg-config \
    libssl-dev

echo ""
echo "🦀 Installation Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y -q
source $HOME/.cargo/env

echo ""
echo "🔍 Vérification GLIBC..."
ldd --version | head -1

echo ""
echo "📊 Rust version:"
rustc --version
cargo --version

echo ""
echo "🏗️  Cargo check..."
cd /app/src-tauri
cargo check --message-format=short 2>&1 | tail -50

echo ""
echo "✅ Vérification terminée"
DOCKEREOF

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Si cargo check réussit ci-dessus, le projet compile dans Docker !"
echo "Prochaine étape: ./build_docker.sh pour build complet"
echo "════════════════════════════════════════════════════════════"
