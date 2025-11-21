#!/bin/bash
# TITANE∞ v15.5 - Installation Automatique Post-Migration Pop!_OS 24.04
# Configure complètement le système pour Tauri v2 + TITANE∞

set -e  # Arrêt si erreur

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🚀 INSTALLATION COMPLÈTE POP!_OS 24.04                      ║"
echo "║                                                               ║"
echo "║  Configuration optimale pour TITANE∞ + Tauri v2             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est bien sur Pop!_OS 24.04
if ! grep -q "24.04" /etc/os-release; then
    echo "⚠️  ATTENTION : Ce script est conçu pour Pop!_OS 24.04"
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📊 Système détecté :"
cat /etc/os-release | grep PRETTY_NAME
ldd --version | head -1
echo ""

# 1. Mise à jour système
echo "🔄 1/7 Mise à jour système..."
sudo apt update
sudo apt upgrade -y
echo "  ✅ Système à jour"
echo ""

# 2. Dépendances Tauri v2 complètes
echo "📦 2/7 Installation dépendances Tauri v2..."
sudo apt install -y \
  curl wget git build-essential cmake pkg-config libssl-dev \
  libgtk-4-dev libgtk-3-dev \
  libwebkit2gtk-4.1-dev libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev libglib2.0-dev \
  libayatana-appindicator3-dev libxdo-dev \
  libgdk-pixbuf-2.0-dev libpango1.0-dev \
  libxcb-shape0-dev libxcb-xfixes0-dev \
  libxkbcommon-dev libdbus-1-dev \
  librsvg2-dev patchelf \
  libatk1.0-dev libcairo2-dev \
  libjavascriptcoregtk-4.1-dev

echo "  ✅ Dépendances Tauri installées"
echo ""

# Vérifier WebKitGTK
echo "🌐 Vérification WebKitGTK 4.1..."
if pkg-config --exists webkit2gtk-4.1; then
    echo "  ✅ WebKitGTK 4.1 : $(pkg-config --modversion webkit2gtk-4.1)"
else
    echo "  ❌ WebKitGTK 4.1 non détecté"
    exit 1
fi

if pkg-config --exists javascriptcoregtk-4.1; then
    echo "  ✅ JavaScriptCore 4.1 : $(pkg-config --modversion javascriptcoregtk-4.1)"
else
    echo "  ❌ JavaScriptCore 4.1 non détecté"
    exit 1
fi
echo ""

# 3. Installation Rust
echo "🦀 3/7 Installation Rust stable..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    rustup default stable
    echo "  ✅ Rust installé : $(rustc --version)"
else
    echo "  ✅ Rust déjà installé : $(rustc --version)"
    rustup update stable
fi
echo ""

# 4. Installation Node.js 22 LTS
echo "🟢 4/7 Installation Node.js 22 LTS..."
if ! command -v node &> /dev/null || ! node --version | grep -q "v22"; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "  ✅ Node.js installé : $(node --version)"
else
    echo "  ✅ Node.js déjà installé : $(node --version)"
fi
echo "  ✅ NPM : $(npm --version)"
echo ""

# 5. Installation Tauri CLI
echo "⚙️  5/7 Installation Tauri CLI 2.x..."
if ! command -v cargo-tauri &> /dev/null; then
    cargo install tauri-cli --locked
    echo "  ✅ Tauri CLI installé"
else
    echo "  ✅ Tauri CLI déjà installé"
fi
echo ""

# 6. Outils développement supplémentaires
echo "🛠️  6/7 Installation outils dev..."
sudo apt install -y \
  vim neovim \
  htop btop \
  tree \
  jq \
  ripgrep fd-find \
  tmux \
  net-tools
echo "  ✅ Outils dev installés"
echo ""

# 7. Configuration file watchers
echo "📁 7/7 Configuration file watchers (fs.inotify)..."
if ! grep -q "fs.inotify.max_user_watches=524288" /etc/sysctl.conf; then
    echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "  ✅ File watchers : 524288"
else
    echo "  ✅ File watchers déjà configurés"
fi
echo ""

# Résumé final
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  ✅ INSTALLATION TERMINÉE !                                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Versions installées :"
echo "  GLIBC : $(ldd --version | head -1)"
echo "  Node : $(node --version)"
echo "  NPM : $(npm --version)"
echo "  Rust : $(rustc --version)"
echo "  Cargo : $(cargo --version)"
echo "  WebKitGTK : $(pkg-config --modversion webkit2gtk-4.1)"
echo "  JavaScriptCore : $(pkg-config --modversion javascriptcoregtk-4.1)"
echo ""
echo "🎯 Prochaines étapes :"
echo "  1. Restaurer backup : ./restore-after-migration.sh"
echo "  2. Ou réinstaller TITANE∞ : ./reinstall-titane.sh"
echo ""
echo "💡 Note : Rechargez votre terminal pour appliquer Rust :"
echo "  source ~/.cargo/env"
