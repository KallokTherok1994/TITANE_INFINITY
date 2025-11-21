#!/bin/bash
# TITANE∞ v15.5 - Test Build Natif (hors Flatpak)
# Vérifie si build Tauri fonctionne sur système hôte

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🧪 TEST BUILD NATIF - VÉRIFICATION GLIBC                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Vérifier GLIBC système
echo "📊 1. Version GLIBC système :"
ldd --version | head -1
echo ""

# 2. Vérifier OS
echo "🐧 2. Système d'exploitation :"
cat /etc/os-release | grep PRETTY_NAME
echo ""

# 3. Vérifier WebKitGTK 4.1
echo "🌐 3. WebKitGTK 4.1 :"
if pkg-config --exists webkit2gtk-4.1; then
  echo "  ✅ webkit2gtk-4.1 : $(pkg-config --modversion webkit2gtk-4.1)"
else
  echo "  ❌ webkit2gtk-4.1 : NON INSTALLÉ"
  echo ""
  echo "  Installation requise :"
  echo "    sudo apt install libwebkit2gtk-4.1-dev"
  exit 1
fi
echo ""

# 4. Vérifier JavaScriptCore
echo "📜 4. JavaScriptCore GTK 4.1 :"
if pkg-config --exists javascriptcoregtk-4.1; then
  echo "  ✅ javascriptcoregtk-4.1 : $(pkg-config --modversion javascriptcoregtk-4.1)"
else
  echo "  ❌ javascriptcoregtk-4.1 : NON INSTALLÉ"
  echo ""
  echo "  Installation requise :"
  echo "    sudo apt install libjavascriptcoregtk-4.1-dev"
  exit 1
fi
echo ""

# 5. Vérifier Rust/Cargo
echo "🦀 5. Rust/Cargo :"
if command -v cargo &> /dev/null; then
  echo "  ✅ Cargo : $(cargo --version)"
  echo "  ✅ Rustc : $(rustc --version)"
else
  echo "  ❌ Rust non installé"
  echo ""
  echo "  Installation requise :"
  echo "    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  exit 1
fi
echo ""

# 6. Test compilation simple
echo "🔧 6. Test compilation Rust :"
cd "$(dirname "$0")"

echo "  Nettoyage cache Cargo..."
cargo clean --manifest-path=src-tauri/Cargo.toml &>/dev/null

echo "  Compilation test (cela peut prendre 2-5 minutes)..."
echo ""

if cargo build --manifest-path=src-tauri/Cargo.toml 2>&1 | tee /tmp/tauri_build.log | grep -E "Finished|error"; then
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║  ✅ BUILD NATIF RÉUSSI !                                     ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Binaire généré :"
    echo "  src-tauri/target/debug/titane-infinity"
    echo ""
    echo "Pour build production :"
    echo "  cargo build --release --manifest-path=src-tauri/Cargo.toml"
    echo ""
    echo "Ou via npm :"
    echo "  npm run tauri:build"
    exit 0
  fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  ❌ BUILD NATIF ÉCHOUÉ                                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Log d'erreur : /tmp/tauri_build.log"
echo ""
echo "Vérifier :"
tail -30 /tmp/tauri_build.log
echo ""
echo "Solutions :"
echo "  1. Lire : FIX_GLIBC_INCOMPATIBILITY.txt"
echo "  2. Migration Pop!_OS 24.04"
echo "  3. Build via Docker"
exit 1
