#!/bin/bash
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "   🚀 TITANE∞ v16.1 — BUILD TAURI COMPLET"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Vérification des dépendances système
echo "🔍 Vérification des dépendances système..."
DEPS_OK=true

if ! command -v pkg-config &> /dev/null; then
    echo "❌ pkg-config non trouvé"
    DEPS_OK=false
fi

if ! pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
  if ! pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    echo "❌ webkit2gtk-4.1 ou 4.0 non trouvé"
    echo "💡 Exécutez: sudo apt-get install libwebkit2gtk-4.1-dev"
    DEPS_OK=false
  else
    echo "⚠️  webkit2gtk-4.0 trouvé (version 4.1 recommandée)"
  fi
fi

if ! pkg-config --exists javascriptcoregtk-4.1 2>/dev/null; then
  if ! pkg-config --exists javascriptcoregtk-4.0 2>/dev/null; then
    echo "❌ javascriptcoregtk-4.1 ou 4.0 non trouvé"
    echo "💡 Exécutez: sudo apt-get install libjavascriptcoregtk-4.1-dev"
    DEPS_OK=false
  fi
fi

if [ "$DEPS_OK" = false ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "   ❌ DÉPENDANCES SYSTÈME MANQUANTES"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "Pour installer les dépendances sur Pop!_OS / Ubuntu :"
  echo ""
  echo "  sudo apt-get update"
  echo "  sudo apt-get install -y \\"
  echo "    libwebkit2gtk-4.1-dev \\"
  echo "    libjavascriptcoregtk-4.1-dev \\"
  echo "    libgtk-3-dev \\"
  echo "    libayatana-appindicator3-dev \\"
  echo "    librsvg2-dev \\"
  echo "    patchelf"
  echo ""
  echo "OU utilisez le déploiement web (déjà prêt) :"
  echo ""
  echo "  cd deploy_v16.1_prod"
  echo "  python3 -m http.server 8080"
  echo "  # → http://localhost:8080"
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi

echo "✅ Toutes les dépendances système présentes"
echo ""

# Clean des builds précédents (optionnel)
read -p "🧹 Nettoyer les builds précédents? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🧹 Nettoyage..."
  rm -rf dist/ src-tauri/target/release/bundle/
  echo "✅ Nettoyage terminé"
fi
echo ""

# Build frontend
echo "📦 Build frontend..."
npm run build || {
  echo "❌ Build frontend échoué"
  exit 1
}
echo "✅ Build frontend réussi"
echo ""

# Build Tauri
echo "🦀 Build Tauri (cela peut prendre 10-30 minutes)..."
echo "⏳ Compilation en cours..."
npm run tauri build || {
  echo "❌ Build Tauri échoué"
  exit 1
}
echo ""

# Affichage des résultats
echo "═══════════════════════════════════════════════════════════════"
echo "   ✅ BUILD TAURI COMPLET RÉUSSI"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📦 Binaires générés :"
echo ""

BINARY_PATH="src-tauri/target/release/titane-infinity"
if [ -f "$BINARY_PATH" ]; then
  BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
  echo "   ✅ Binaire Linux : $BINARY_SIZE"
  echo "      → $BINARY_PATH"
  echo ""
else
  echo "   ❌ Binaire non trouvé"
fi

DEB_PATH=$(find src-tauri/target/release/bundle/deb/ -name "*.deb" 2>/dev/null | head -1)
if [ -n "$DEB_PATH" ] && [ -f "$DEB_PATH" ]; then
  DEB_SIZE=$(du -h "$DEB_PATH" | cut -f1)
  echo "   ✅ Package Debian : $DEB_SIZE"
  echo "      → $DEB_PATH"
  echo ""
fi

APPIMAGE_PATH=$(find src-tauri/target/release/bundle/appimage/ -name "*.AppImage" 2>/dev/null | head -1)
if [ -n "$APPIMAGE_PATH" ] && [ -f "$APPIMAGE_PATH" ]; then
  APPIMAGE_SIZE=$(du -h "$APPIMAGE_PATH" | cut -f1)
  echo "   ✅ AppImage : $APPIMAGE_SIZE"
  echo "      → $APPIMAGE_PATH"
  echo ""
fi

RPM_PATH=$(find src-tauri/target/release/bundle/rpm/ -name "*.rpm" 2>/dev/null | head -1)
if [ -n "$RPM_PATH" ] && [ -f "$RPM_PATH" ]; then
  RPM_SIZE=$(du -h "$RPM_PATH" | cut -f1)
  echo "   ✅ Package RPM : $RPM_SIZE"
  echo "      → $RPM_PATH"
  echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo "   🚀 COMMANDES D'EXÉCUTION"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Binaire direct :"
echo "  ./$BINARY_PATH"
echo ""
if [ -n "$DEB_PATH" ]; then
  echo "Installer le package Debian :"
  echo "  sudo dpkg -i $DEB_PATH"
  echo ""
fi
if [ -n "$APPIMAGE_PATH" ]; then
  echo "Exécuter l'AppImage :"
  echo "  chmod +x $APPIMAGE_PATH"
  echo "  ./$APPIMAGE_PATH"
  echo ""
fi
echo "═══════════════════════════════════════════════════════════════"
