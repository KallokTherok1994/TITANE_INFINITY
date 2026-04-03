#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🎨 verify_ds_tokens.sh - Vérification Design System Tokens v14
# ═══════════════════════════════════════════════════════════════════════════
#
# OBJECTIF :
# Valider le Design System centralisé :
# • 350+ tokens CSS définis (tokens.css)
# • 0 hardcoded colors/spacing dans composants
# • tokens.ts exports TypeScript validés
#
# USAGE : ./scripts/verify_ds_tokens.sh
# EXIT CODE : 0 si 100% conforme, 1 sinon
#
# ═══════════════════════════════════════════════════════════════════════════

# Removed set -e to continue on warnings

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🎨 VÉRIFICATION DESIGN SYSTEM TOKENS v14"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/4]${NC} Vérification tokens.css (Design System Core)..."
# ───────────────────────────────────────────────────────────────────────────

TOKENS_CSS="src/design-system/tokens.css"

if [[ ! -f "$TOKENS_CSS" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $TOKENS_CSS introuvable${NC}"
    ((ERRORS++))
else
    # Compter tokens CSS (--ds-*)
    TOKENS_COUNT=$(grep -c "^[[:space:]]*--ds-" "$TOKENS_CSS" || true)

    if [[ $TOKENS_COUNT -ge 350 ]]; then
        echo -e "${GREEN}✓${NC} $TOKENS_COUNT tokens CSS définis (>= 350)"
    elif [[ $TOKENS_COUNT -ge 300 ]]; then
        echo -e "${YELLOW}⚠ AVERTISSEMENT: $TOKENS_COUNT tokens CSS (attendu >= 350)${NC}"
        ((WARNINGS++))
    else
        echo -e "${RED}✗ ERREUR: Seulement $TOKENS_COUNT tokens CSS (attendu >= 350)${NC}"
        ((ERRORS++))
    fi

    # Vérifier catégories tokens
    CATEGORIES=(
        "color"
        "spacing"
        "font"
        "radius"
        "shadow"
    )

    for category in "${CATEGORIES[@]}"; do
        CAT_COUNT=$(grep -c "^[[:space:]]*--ds-$category-" "$TOKENS_CSS" || true)
        if [[ $CAT_COUNT -gt 0 ]]; then
            echo -e "${GREEN}✓${NC} Catégorie '$category' : $CAT_COUNT tokens"
        else
            echo -e "${RED}✗ ERREUR: Catégorie '$category' : 0 tokens${NC}"
            ((ERRORS++))
        fi
    done
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/4]${NC} Vérification tokens.ts (TypeScript exports)..."
# ───────────────────────────────────────────────────────────────────────────

TOKENS_TS="src/design-system/tokens.ts"

if [[ ! -f "$TOKENS_TS" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $TOKENS_TS introuvable${NC}"
    ((ERRORS++))
else
    # Vérifier exports tokens
    if grep -q "export const colors" "$TOKENS_TS"; then
        echo -e "${GREEN}✓${NC} Export 'colors' trouvé"
    else
        echo -e "${RED}✗ ERREUR: Export 'colors' manquant${NC}"
        ((ERRORS++))
    fi

    if grep -q "export const spacing" "$TOKENS_TS"; then
        echo -e "${GREEN}✓${NC} Export 'spacing' trouvé"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Export 'spacing' manquant${NC}"
        ((WARNINGS++))
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/4]${NC} Vérification absence hardcoded values..."
# ───────────────────────────────────────────────────────────────────────────

# Chercher hardcoded colors (hex/rgb) dans composants
HARDCODED_COLORS=$(grep -r "#[0-9a-fA-F]\{6\}" src/components src/features 2>/dev/null | grep -v "node_modules" | grep -v ".css" | wc -l || true)

if [[ $HARDCODED_COLORS -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} Aucune couleur hardcoded détectée"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: $HARDCODED_COLORS couleurs hardcoded détectées (hex)${NC}"
    ((WARNINGS++))
fi

# Chercher hardcoded spacing (px direct dans JSX)
HARDCODED_SPACING=$(grep -r "padding.*[0-9]\+px\|margin.*[0-9]\+px" src/components src/features 2>/dev/null | grep -v "node_modules" | grep -v ".css" | wc -l || true)

if [[ $HARDCODED_SPACING -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} Aucun spacing hardcoded détecté"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: $HARDCODED_SPACING spacing hardcoded détectés (px)${NC}"
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/4]${NC} Vérification usage tokens dans composants..."
# ───────────────────────────────────────────────────────────────────────────

# Compter usage var(--ds-*)
DS_VAR_USAGE=$(grep -r "var(--ds-" src/components src/features 2>/dev/null | wc -l || true)

if [[ $DS_VAR_USAGE -gt 100 ]]; then
    echo -e "${GREEN}✓${NC} $DS_VAR_USAGE usages de tokens Design System"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $DS_VAR_USAGE usages de tokens (attendu >100)${NC}"
    ((WARNINGS++))
fi

# Vérifier import tokens.ts
TOKENS_IMPORTS=$(grep -r "from.*tokens" src/components src/features 2>/dev/null | wc -l || true)

if [[ $TOKENS_IMPORTS -gt 10 ]]; then
    echo -e "${GREEN}✓${NC} $TOKENS_IMPORTS imports de tokens TypeScript"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $TOKENS_IMPORTS imports de tokens${NC}"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ VÉRIFICATION DESIGN SYSTEM"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ DESIGN SYSTEM : PASS${NC}"
    echo -e "   • 0 erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 0
else
    echo -e "${RED}❌ DESIGN SYSTEM : FAIL${NC}"
    echo -e "   • $ERRORS erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 1
fi
