#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v∞ - Logo to App Icon Generator
# Convertit le SVG reactor en icône d'application Tauri
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

SVG_SOURCE="src/assets/titane-reactor-awen.svg"
PNG_OUTPUT="titane-app-icon.png"
PNG_SIZE=1024

echo "════════════════════════════════════════════════════════════"
echo "  TITANE∞ Logo → App Icon Generator"
echo "════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────
# ÉTAPE 1: Vérifier que le SVG source existe
# ─────────────────────────────────────────────────────────────
if [ ! -f "$SVG_SOURCE" ]; then
    echo "❌ ERREUR: Fichier SVG introuvable: $SVG_SOURCE"
    exit 1
fi
echo "✅ Fichier SVG trouvé: $SVG_SOURCE"

# ─────────────────────────────────────────────────────────────
# ÉTAPE 2: Détecter l'outil de conversion disponible
# ─────────────────────────────────────────────────────────────
CONVERTER=""

if command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
    echo "✅ Inkscape détecté (méthode recommandée)"
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
    echo "✅ ImageMagick détecté"
else
    echo "❌ ERREUR: Aucun outil de conversion trouvé"
    echo ""
    echo "Veuillez installer l'un de ces outils:"
    echo ""
    echo "  • Inkscape (recommandé):"
    echo "    - Debian/Ubuntu: sudo apt install inkscape"
    echo "    - macOS:         brew install inkscape"
    echo "    - Arch:          sudo pacman -S inkscape"
    echo ""
    echo "  • ImageMagick:"
    echo "    - Debian/Ubuntu: sudo apt install imagemagick"
    echo "    - macOS:         brew install imagemagick"
    echo "    - Arch:          sudo pacman -S imagemagick"
    echo ""
    exit 1
fi

# ─────────────────────────────────────────────────────────────
# ÉTAPE 3: Convertir SVG → PNG 1024x1024
# ─────────────────────────────────────────────────────────────
echo ""
echo "🔄 Conversion SVG → PNG ($PNG_SIZE×$PNG_SIZE)..."

if [ "$CONVERTER" = "inkscape" ]; then
    inkscape \
        --export-type=png \
        --export-filename="$PNG_OUTPUT" \
        --export-width=$PNG_SIZE \
        --export-height=$PNG_SIZE \
        --export-background-opacity=0 \
        "$SVG_SOURCE"
elif [ "$CONVERTER" = "imagemagick" ]; then
    convert \
        -background none \
        -density 300 \
        -resize ${PNG_SIZE}x${PNG_SIZE} \
        "$SVG_SOURCE" \
        "$PNG_OUTPUT"
fi

# Vérifier que le PNG a été créé
if [ ! -f "$PNG_OUTPUT" ]; then
    echo "❌ ERREUR: La conversion a échoué"
    exit 1
fi

echo "✅ PNG généré: $PNG_OUTPUT"

# Afficher les informations du fichier
FILE_SIZE=$(du -h "$PNG_OUTPUT" | cut -f1)
echo "   Taille: $FILE_SIZE"

# ─────────────────────────────────────────────────────────────
# ÉTAPE 4: Générer les icônes Tauri multi-résolutions
# ─────────────────────────────────────────────────────────────
echo ""
echo "🔄 Génération des icônes Tauri (multi-résolutions)..."

if ! command -v cargo &> /dev/null; then
    echo "❌ ERREUR: Cargo (Rust) n'est pas installé"
    echo "   Installation: https://rustup.rs"
    exit 1
fi

cargo tauri icon "$PNG_OUTPUT"

echo "✅ Icônes Tauri générées dans src-tauri/icons/"

# ─────────────────────────────────────────────────────────────
# ÉTAPE 5: Lister les icônes générées
# ─────────────────────────────────────────────────────────────
echo ""
echo "📦 Fichiers générés:"
echo "────────────────────────────────────────────────────────────"
ls -lh src-tauri/icons/ | grep -E "\.png$|\.ico$|\.icns$" | awk '{print "   " $9 " (" $5 ")"}'
echo ""

# ─────────────────────────────────────────────────────────────
# ÉTAPE 6: Nettoyage optionnel
# ─────────────────────────────────────────────────────────────
read -p "🗑️  Supprimer le PNG temporaire ($PNG_OUTPUT) ? [o/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[OoYy]$ ]]; then
    rm "$PNG_OUTPUT"
    echo "✅ PNG temporaire supprimé"
else
    echo "ℹ️  PNG conservé: $PNG_OUTPUT"
fi

# ─────────────────────────────────────────────────────────────
# SUCCÈS
# ─────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ SUCCÈS - Icônes TITANE∞ générées"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo ""
echo "  1. Tester en mode dev:"
echo "     npm run tauri:dev"
echo ""
echo "  2. Build production:"
echo "     npm run tauri:build"
echo ""
echo "  3. Vérifier l'icône sur l'app compilée:"
echo "     • macOS:   src-tauri/target/release/bundle/macos/"
echo "     • Windows: src-tauri/target/release/bundle/msi/"
echo "     • Linux:   src-tauri/target/release/bundle/appimage/"
echo ""
