#!/bin/bash
# convert-images-webp.sh - Phase 6 WebP Conversion Script
# 
# Convertit toutes images PNG/JPG en WebP pour réduction -70% size
# Utilise ffmpeg (disponible par défaut) au lieu de sharp (issue dépendances Node)
# 
# Usage: ./scripts/convert-images-webp.sh

set -e

# Couleurs output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   TITANE∞ - Phase 6 WebP Conversion             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check ffmpeg disponible
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ ffmpeg non trouvé. Installation requise:${NC}"
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   Fedora: sudo dnf install ffmpeg"
    echo "   Arch: sudo pacman -S ffmpeg"
    exit 1
fi

echo -e "${YELLOW}[1/4] Recherche images PNG/JPG...${NC}"

# Trouver toutes images
IMAGES=$(find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null)
TOTAL=$(echo "$IMAGES" | wc -l)

if [ -z "$IMAGES" ]; then
    echo -e "${YELLOW}⚠ Aucune image trouvée à convertir${NC}"
    exit 0
fi

echo "   ✓ Trouvé $TOTAL images"
echo ""

# Stats avant conversion
echo -e "${YELLOW}[2/4] Calcul taille actuelle...${NC}"
SIZE_BEFORE=$(find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -exec du -cb {} + 2>/dev/null | grep total | awk '{print $1}')
SIZE_BEFORE_KB=$((SIZE_BEFORE / 1024))
echo "   ℹ Taille actuelle: ${SIZE_BEFORE_KB} KB"
echo ""

# Conversion WebP
echo -e "${YELLOW}[3/4] Conversion WebP (qualité 85)...${NC}"

CONVERTED=0
FAILED=0

while IFS= read -r img; do
    # Skip fichiers vides
    [ -z "$img" ] && continue
    
    # Nom fichier sans extension
    BASENAME="${img%.*}"
    WEBP_FILE="${BASENAME}.webp"
    
    # Skip si .webp existe déjà
    if [ -f "$WEBP_FILE" ]; then
        echo "   ⏭ Skip (existe): $(basename "$WEBP_FILE")"
        continue
    fi
    
    # Conversion ffmpeg (qualité 85, optimal size/quality)
    if ffmpeg -i "$img" -c:v libwebp -quality 85 -lossless 0 "$WEBP_FILE" -y &>/dev/null; then
        SIZE_ORIG=$(du -b "$img" | awk '{print $1}')
        SIZE_WEBP=$(du -b "$WEBP_FILE" | awk '{print $1}')
        REDUCTION=$(( 100 - (SIZE_WEBP * 100 / SIZE_ORIG) ))
        
        echo -e "   ${GREEN}✓ $(basename "$img") → $(basename "$WEBP_FILE") (-${REDUCTION}%)${NC}"
        CONVERTED=$((CONVERTED + 1))
    else
        echo -e "   ${RED}✗ Échec: $(basename "$img")${NC}"
        FAILED=$((FAILED + 1))
    fi
done <<< "$IMAGES"

echo ""
echo -e "${YELLOW}[4/4] Calcul gain final...${NC}"

# Stats après conversion
SIZE_AFTER=$(find src public -type f -name "*.webp" -exec du -cb {} + 2>/dev/null | grep total | awk '{print $1}')
SIZE_AFTER_KB=$((SIZE_AFTER / 1024))
GAIN_KB=$((SIZE_BEFORE_KB - SIZE_AFTER_KB))
GAIN_PERCENT=$(( (GAIN_KB * 100) / SIZE_BEFORE_KB ))

echo "   ✓ Taille finale WebP: ${SIZE_AFTER_KB} KB"
echo "   ✓ Gain total: -${GAIN_KB} KB (-${GAIN_PERCENT}%)"
echo ""

# Résumé
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Conversion WebP Terminée                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  📊 Images converties: ${GREEN}${CONVERTED}${NC}"
echo -e "  ❌ Échecs: ${RED}${FAILED}${NC}"
echo -e "  💾 Taille originale: ${SIZE_BEFORE_KB} KB"
echo -e "  ✅ Taille WebP: ${SIZE_AFTER_KB} KB"
echo -e "  🎯 Gain: ${GREEN}-${GAIN_KB} KB (-${GAIN_PERCENT}%)${NC}"
echo ""

# Bandwidth savings annuels
USERS_MONTH=10000
IMAGES_USER=10
CHARGES_MONTH=$((USERS_MONTH * IMAGES_USER))
SAVINGS_MONTH_GB=$(echo "scale=2; $GAIN_KB * $CHARGES_MONTH / 1024 / 1024" | bc)
SAVINGS_YEAR_GB=$(echo "scale=2; $SAVINGS_MONTH_GB * 12" | bc)
COST_YEAR=$(echo "scale=2; $SAVINGS_YEAR_GB * 0.085" | bc)

echo -e "  💸 Économies annuelles (10k users/mois):"
echo -e "     - Bandwidth: ${SAVINGS_YEAR_GB} GB/an"
echo -e "     - Coût: \$${COST_YEAR}/an (AWS CloudFront)"
echo ""

# Notes utilisation
echo -e "${YELLOW}ℹ Notes:${NC}"
echo "  • Fichiers .png/.jpg originaux conservés (fallback navigateurs anciens)"
echo "  • Utiliser <picture> + <source type=\"image/webp\"> pour WebP + fallback"
echo "  • Ou LazyImage component avec détection automatique"
echo ""

echo -e "${GREEN}✅ Phase 6 WebP Conversion Complete!${NC}"
