#!/bin/bash
# scripts/docs/validate-structure.sh
# Validation Structure Documentation TITANE∞
# Author: Kevin Thibault / TITANE Team
# Date: 18 décembre 2025

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TITANE∞ Documentation Structure Validator   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# 1. VÉRIFICATION RACINE (max 10 fichiers .md)
echo -e "${BLUE}📂 Validation fichiers racine...${NC}"
ROOT_MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)

if [ $ROOT_MD_COUNT -le 10 ]; then
    echo -e "   ${GREEN}✅ Fichiers racine: $ROOT_MD_COUNT ≤ 10${NC}"
else
    echo -e "   ${RED}❌ ERREUR: $ROOT_MD_COUNT fichiers .md à la racine (max 10 autorisés)${NC}"
    echo -e "   ${YELLOW}   → Déplacer vers docs/ selon catégorie${NC}"
    ((ERRORS++))
fi

# Fichiers essentiels requis
REQUIRED_FILES=("README.md" "CHANGELOG.md" "LICENSE.md" "CONTRIBUTING.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "   ${GREEN}✅ $file présent${NC}"
    else
        echo -e "   ${RED}❌ ERREUR: $file manquant${NC}"
        ((ERRORS++))
    fi
done

# 2. VÉRIFICATION VERSIONS OBSOLÈTES
echo ""
echo -e "${BLUE}🔍 Vérification versions obsolètes...${NC}"

# Vérifier v24/v25 dans docs/current
INVALID_V24=$(find docs/current -name "*v24*.md" 2>/dev/null | wc -l)
INVALID_V25=$(find docs/current -name "*v25*.md" 2>/dev/null | wc -l)

if [ $INVALID_V24 -eq 0 ] && [ $INVALID_V25 -eq 0 ]; then
    echo -e "   ${GREEN}✅ Pas de versions obsolètes dans docs/current/${NC}"
else
    echo -e "   ${RED}❌ ERREUR: Versions obsolètes détectées:${NC}"
    [ $INVALID_V24 -gt 0 ] && echo -e "   ${RED}   • v24: $INVALID_V24 fichiers${NC}"
    [ $INVALID_V25 -gt 0 ] && echo -e "   ${RED}   • v25: $INVALID_V25 fichiers${NC}"
    echo -e "   ${YELLOW}   → Déplacer vers docs/archive/vXX/${NC}"
    ((ERRORS++))
fi

# 3. VÉRIFICATION DOUBLONS
echo ""
echo -e "${BLUE}🔄 Détection doublons...${NC}"

DUPLICATES=$(find docs/current -name "*.md" 2>/dev/null | \
  sed 's/_v[0-9][0-9]\.[0-9]\.md/.md/' | \
  sed 's/_v[0-9][0-9]\.md/.md/' | \
  sort | uniq -d)

if [ -z "$DUPLICATES" ]; then
    echo -e "   ${GREEN}✅ Pas de doublons détectés${NC}"
else
    echo -e "   ${YELLOW}⚠️  WARNING: Fichiers potentiellement dupliqués:${NC}"
    echo "$DUPLICATES" | sed 's/^/      /'
    ((WARNINGS++))
fi

# 4. VÉRIFICATION LIENS MORTS (basique)
echo ""
echo -e "${BLUE}🔗 Vérification liens (sample)...${NC}"

BROKEN_LINKS=0
# Vérifier quelques fichiers clés
for file in README.md docs/current/INDEX.md; do
    if [[ -f "$file" ]]; then
        # Extraire liens markdown [texte](chemin.md)
        LINKS=$(grep -oP '\]\(\K[^)]+\.md(?=\))' "$file" 2>/dev/null || true)
        for link in $LINKS; do
            # Résoudre chemin relatif
            DIR=$(dirname "$file")
            FULL_PATH="$DIR/$link"
            if [[ ! -f "$FULL_PATH" ]]; then
                echo -e "   ${YELLOW}⚠️  Lien mort dans $file: $link${NC}"
                ((WARNINGS++))
                ((BROKEN_LINKS++))
            fi
        done
    fi
done

if [ $BROKEN_LINKS -eq 0 ]; then
    echo -e "   ${GREEN}✅ Liens vérifiés OK (sample)${NC}"
fi

# 5. VÉRIFICATION STRUCTURE DOCS/
echo ""
echo -e "${BLUE}📁 Vérification structure docs/...${NC}"

REQUIRED_DIRS=(
    "docs/current/audits"
    "docs/current/phases"
    "docs/current/guides"
    "docs/current/architecture"
    "docs/archive/v24"
    "docs/archive/v25"
    "docs/archive/sessions"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        COUNT=$(find "$dir" -name "*.md" -type f | wc -l)
        echo -e "   ${GREEN}✅ $dir ($COUNT fichiers)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $dir manquant${NC}"
        ((WARNINGS++))
    fi
done

# 6. VÉRIFICATION INDEX.md
echo ""
echo -e "${BLUE}📋 Vérification fichiers INDEX...${NC}"

INDEX_FILES=(
    "docs/current/INDEX.md"
    "docs/archive/v24/INDEX.md"
    "docs/archive/v25/INDEX.md"
    "docs/archive/sessions/INDEX.md"
)

for index in "${INDEX_FILES[@]}"; do
    if [[ -f "$index" ]]; then
        echo -e "   ${GREEN}✅ $index présent${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $index manquant${NC}"
        ((WARNINGS++))
    fi
done

# 7. STATS GLOBALES
echo ""
echo -e "${BLUE}📊 Statistiques Globales${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROOT_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
DOCS_CURRENT=$(find docs/current -name "*.md" -type f 2>/dev/null | wc -l)
DOCS_ARCHIVE=$(find docs/archive -name "*.md" -type f 2>/dev/null | wc -l)
TOTAL_DOCS=$((ROOT_COUNT + DOCS_CURRENT + DOCS_ARCHIVE))

echo -e "   Fichiers racine:       ${GREEN}$ROOT_COUNT${NC}"
echo -e "   Documentation active:  ${GREEN}$DOCS_CURRENT${NC}"
echo -e "   Archives:              ${YELLOW}$DOCS_ARCHIVE${NC}"
echo -e "   ${BLUE}Total:                  $TOTAL_DOCS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 8. RÉSUMÉ
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}║          VALIDATION RÉUSSIE ✅                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) détecté(s)${NC}"
    fi
    
    exit 0
else
    echo -e "${RED}║          VALIDATION ÉCHOUÉE ❌                 ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}❌ $ERRORS erreur(s) critique(s)${NC}"
    [ $WARNINGS -gt 0 ] && echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    
    exit 1
fi
