#!/bin/bash
# Installation Rust pour TITANE∞
# Date: 18 novembre 2025

echo "═══════════════════════════════════════════════════════════"
echo "  INSTALLATION RUST/CARGO — TITANE∞ v8.1.1"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Ce script va installer Rust et Cargo pour compiler"
echo "les nouveaux modules #71-74 (Directional & Identity Layer)"
echo ""
echo "⚠️  Installation requise pour:"
echo "   • Compiler les 24 fichiers Rust (3,880 lignes)"
echo "   • Exécuter les tests unitaires (80+)"
echo "   • Valider l'intégration système"
echo ""

read -p "Continuer l'installation? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Installation annulée"
    exit 1
fi

echo ""
echo "📥 Téléchargement de rustup..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -o /tmp/rustup-init.sh

if [ $? -ne 0 ]; then
    echo "❌ Échec du téléchargement"
    exit 1
fi

echo "🔧 Lancement de l'installation..."
sh /tmp/rustup-init.sh -y

if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation"
    exit 1
fi

echo ""
echo "🔄 Configuration de l'environnement..."
source "$HOME/.cargo/env"

echo ""
echo "✅ Installation réussie!"
echo ""
rustc --version
cargo --version

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  PROCHAINES ÉTAPES"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Recharger le terminal:"
echo "   source \$HOME/.cargo/env"
echo ""
echo "2. Compiler TITANE∞:"
echo "   cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo "   cargo check --all"
echo ""
echo "3. Exécuter les tests:"
echo "   cargo test"
echo ""
echo "4. Build optimisé:"
echo "   cargo build --release"
echo ""
