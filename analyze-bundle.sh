#!/bin/bash
# analyze-bundle.sh - Analyse du bundle Vite et performances

set -e

echo "📦 TITANE∞ Bundle Analysis"
echo "=========================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Vérifier si dist/ existe
if [ ! -d "dist" ]; then
  warn "Répertoire dist/ introuvable"
  info "Exécution de 'pnpm run build' pour générer le bundle..."
  pnpm run build
  echo ""
fi

# Analyse taille dist/
echo "📊 Analyse du bundle:"
echo ""

TOTAL_SIZE=$(du -sh dist/ 2>/dev/null | awk '{print $1}')
echo "  Total dist/: $TOTAL_SIZE"
echo ""

# Fichiers JS
echo "📦 Fichiers JavaScript:"
find dist/assets -name "*.js" -type f -exec du -h {} \; 2>/dev/null | sort -hr | head -10 | while read size file; do
  echo "  • $size - $(basename $file)"
done
echo ""

# Fichiers CSS
echo "🎨 Fichiers CSS:"
find dist/assets -name "*.css" -type f -exec du -h {} \; 2>/dev/null | sort -hr | head -5 | while read size file; do
  echo "  • $size - $(basename $file)"
done
echo ""

# Images/assets
echo "🖼️  Assets (images, fonts):"
find dist/assets -type f ! -name "*.js" ! -name "*.css" -exec du -h {} \; 2>/dev/null | sort -hr | head -5 | while read size file; do
  echo "  • $size - $(basename $file)"
done
echo ""

# Analyse des chunks
echo "📦 Chunks principaux:"
JS_FILES=$(find dist/assets -name "*.js" -type f | wc -l)
CSS_FILES=$(find dist/assets -name "*.css" -type f | wc -l)
TOTAL_JS_SIZE=$(find dist/assets -name "*.js" -type f -exec du -b {} \; | awk '{sum+=$1} END {printf "%.2f MB", sum/1024/1024}')
TOTAL_CSS_SIZE=$(find dist/assets -name "*.css" -type f -exec du -b {} \; | awk '{sum+=$1} END {printf "%.2f MB", sum/1024/1024}')

echo "  • Fichiers JS:  $JS_FILES ($TOTAL_JS_SIZE)"
echo "  • Fichiers CSS: $CSS_FILES ($TOTAL_CSS_SIZE)"
echo ""

# Recommandations
echo "💡 Recommandations d'optimisation:"
echo ""

# Vérifier chunk trop gros
BIGGEST_JS=$(find dist/assets -name "*.js" -type f -exec du -b {} \; | sort -rn | head -1 | awk '{print $1}')
BIGGEST_JS_MB=$(echo "scale=2; $BIGGEST_JS/1024/1024" | bc)

if (( $(echo "$BIGGEST_JS_MB > 1.0" | bc -l) )); then
  warn "Chunk JS trop volumineux: ${BIGGEST_JS_MB}MB"
  echo "     → Activer code splitting avec dynamic imports"
  echo "     → Exemple: const Module = lazy(() => import('./Module'))"
else
  success "Chunks JS dans la norme (< 1MB)"
fi

echo ""

# Vérifier gzip
if command -v gzip >/dev/null 2>&1; then
  info "Simulation compression gzip..."
  ORIGINAL_SIZE=$(find dist/assets -name "*.js" -type f -exec du -b {} \; | awk '{sum+=$1} END {print sum}')
  GZIPPED_SIZE=0
  
  for file in $(find dist/assets -name "*.js" -type f); do
    SIZE=$(gzip -c "$file" 2>/dev/null | wc -c)
    GZIPPED_SIZE=$((GZIPPED_SIZE + SIZE))
  done
  
  RATIO=$(echo "scale=1; ($ORIGINAL_SIZE - $GZIPPED_SIZE) * 100 / $ORIGINAL_SIZE" | bc)
  GZIPPED_MB=$(echo "scale=2; $GZIPPED_SIZE/1024/1024" | bc)
  
  success "Compression gzip: -${RATIO}% (${GZIPPED_MB}MB après compression)"
fi

echo ""

# Analyse des imports
echo "🔍 Analyse des dépendances:"
if [ -f "dist/assets/index-*.js" ]; then
  MAIN_JS=$(find dist/assets -name "index-*.js" | head -1)
  
  # Compter les imports React
  REACT_COUNT=$(grep -o "react" "$MAIN_JS" 2>/dev/null | wc -l)
  echo "  • Références React: $REACT_COUNT"
  
  # Vérifier des libs volumineuses
  if grep -q "moment" "$MAIN_JS" 2>/dev/null; then
    warn "moment.js détecté (considérer date-fns ou dayjs)"
  fi
  
  if grep -q "lodash" "$MAIN_JS" 2>/dev/null; then
    warn "lodash détecté (importer uniquement les fonctions nécessaires)"
  fi
fi

echo ""

# Résumé final
echo "======================================"
echo "📊 Résumé:"
echo "  • Bundle total: $TOTAL_SIZE"
echo "  • JS:  $TOTAL_JS_SIZE ($JS_FILES fichiers)"
echo "  • CSS: $TOTAL_CSS_SIZE ($CSS_FILES fichiers)"
echo ""

# Seuils recommandés
if (( $(echo "$BIGGEST_JS_MB < 0.5" | bc -l) )); then
  success "Performance: EXCELLENTE (chunks < 500KB)"
elif (( $(echo "$BIGGEST_JS_MB < 1.0" | bc -l) )); then
  success "Performance: BONNE (chunks < 1MB)"
elif (( $(echo "$BIGGEST_JS_MB < 2.0" | bc -l) )); then
  warn "Performance: CORRECTE (chunks < 2MB, optimisation recommandée)"
else
  error "Performance: MÉDIOCRE (chunks > 2MB, optimisation nécessaire)"
fi

echo ""
echo "💡 Commandes utiles:"
echo "  pnpm run build --mode production  # Build optimisé"
echo "  pnpm exec vite-bundle-visualizer  # Visualiser le bundle"
echo "  bash optimize-workspace.sh        # Nettoyer workspace"
