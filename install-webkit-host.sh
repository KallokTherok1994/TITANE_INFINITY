#!/bin/bash
echo "🔧 Installation WebKit sur Pop!_OS 22.04..."
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev

echo ""
echo "✅ Installation terminée!"
echo ""
echo "Vérification:"
pkg-config --exists webkit2gtk-4.1 && echo "✅ webkit2gtk-4.1 OK" || echo "❌ webkit2gtk-4.1 manquant"
pkg-config --exists javascriptcoregtk-4.1 && echo "✅ javascriptcoregtk-4.1 OK" || echo "❌ javascriptcoregtk-4.1 manquant"
