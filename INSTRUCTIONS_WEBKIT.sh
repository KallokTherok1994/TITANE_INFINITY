#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🚀 TITANE∞ v16.1 — INSTRUCTIONS INSTALLATION WEBKIT (SYSTÈME HÔTE)
# ═══════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   🔧 INSTALLATION WEBKIT SYSTÈME HÔTE REQUISE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  VS Code détecté en Flatpak - Installation manuelle requise"
echo ""
echo "📋 ÉTAPES À SUIVRE:"
echo ""
echo "1️⃣  Ouvrir un terminal SYSTÈME (hors Flatpak)"
echo "   → Applications > Terminal"
echo "   → Ou: Ctrl+Alt+T"
echo ""
echo "2️⃣  Naviguer vers le projet:"
echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo ""
echo "3️⃣  Installer les dépendances WebKit:"
echo ""
echo "   sudo apt update"
echo "   sudo apt install -y \\"
echo "     libwebkit2gtk-4.1-dev \\"
echo "     libgtk-3-dev \\"
echo "     libayatana-appindicator3-dev \\"
echo "     librsvg2-dev \\"
echo "     patchelf \\"
echo "     libjavascriptcoregtk-4.1-dev \\"
echo "     libsoup-3.0-dev"
echo ""
echo "4️⃣  Vérifier l'installation:"
echo "   pkg-config --exists webkit2gtk-4.1 && echo '✅ WebKit OK'"
echo ""
echo "5️⃣  Compiler le backend Tauri:"
echo "   cd src-tauri"
echo "   cargo clean"
echo "   cargo check"
echo "   cargo build --release"
echo ""
echo "6️⃣  Tester l'application:"
echo "   cd .."
echo "   npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   📝 ALTERNATIVE: MODE FRONTEND STANDALONE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Si vous ne pouvez pas installer WebKit maintenant,"
echo "le frontend est déjà 100% fonctionnel en mode standalone:"
echo ""
echo "   cd dist"
echo "   python3 -m http.server 8080"
echo ""
echo "Puis ouvrir: http://localhost:8080"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Créer un script d'installation simplifié
cat > install-webkit-host.sh << 'EOF'
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
EOF

chmod +x install-webkit-host.sh

echo "✅ Script d'installation créé: install-webkit-host.sh"
echo ""
echo "Exécutez-le dans un terminal système (hors Flatpak):"
echo "   ./install-webkit-host.sh"
echo ""
