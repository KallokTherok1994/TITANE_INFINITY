#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v17 — Design System Cleanup Script
# © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
# ═══════════════════════════════════════════════════════════════════════════
#
# Supprime les fichiers Design System obsolètes après migration vers titane-fusion.css
# Usage: ./scripts/cleanup_ds_legacy.sh [--dry-run]
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}⚠️  MODE DRY-RUN : Aucun fichier ne sera supprimé${NC}"
fi

print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

delete_file() {
    local file=$1
    if [ -f "$file" ]; then
        if [ "$DRY_RUN" = true ]; then
            print_warning "Would delete: $file"
        else
            rm "$file"
            print_success "Deleted: $file"
        fi
    else
        print_info "Already gone: $file"
    fi
}

print_header "NETTOYAGE DESIGN SYSTEM LEGACY"

# ═══════════════════════════════════════════════════════════════════════════
# FICHIERS À SUPPRIMER (Obsolètes après fusion)
# ═══════════════════════════════════════════════════════════════════════════

OBSOLETE_FILES=(
    "src/design-system/titane-v12.css"
    "src/design-system/titane-v14.css"
    "src/design-system/titane-v20.css"
    "src/design-system/tokens.css"
    "src/styles/design-system.css"
    "src/styles/titane-design-system.css"
    "src/styles/titane-design-system-v24.css"
    "src/styles/titane-theme-metal.css"
    "src/styles/variables.css"
)

echo ""
print_info "Fichiers DS obsolètes à supprimer : ${#OBSOLETE_FILES[@]}"
echo ""

DELETED_COUNT=0
for file in "${OBSOLETE_FILES[@]}"; do
    if [ -f "$file" ]; then
        delete_file "$file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

# ═══════════════════════════════════════════════════════════════════════════
# FICHIERS À CONSERVER
# ═══════════════════════════════════════════════════════════════════════════

print_header "FICHIERS CONSERVÉS"

KEPT_FILES=(
    "src/design-system/titane-fusion.css"
    "src/design-system/titane-v∞.css"
    "src/styles/experience.css"
    "src/styles/exp-fusion.css"
    "src/styles/chat-messages.css"
    "src/styles/SingularityPanel.css"
)

for file in "${KEPT_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Kept: $file"
    else
        print_warning "Missing: $file (should exist)"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════════════════

echo ""
print_header "RÉSUMÉ"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Mode DRY-RUN : Aucune suppression effectuée${NC}"
    echo -e "${BLUE}Fichiers qui seraient supprimés : $DELETED_COUNT${NC}"
else
    echo -e "${GREEN}Fichiers supprimés : $DELETED_COUNT${NC}"
    echo -e "${GREEN}Gain d'espace : ~3500 lignes CSS${NC}"
fi

echo ""
print_info "Design System actif : titane-fusion.css"
print_info "Import dans main.tsx : './design-system/titane-fusion.css'"

echo ""
if [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║       🎉 NETTOYAGE DESIGN SYSTEM TERMINÉ — TITANE∞ v17       ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║  Design System unifié : titane-fusion.css ✅                  ║${NC}"
    echo -e "${GREEN}║  Fichiers obsolètes supprimés : $DELETED_COUNT/9 ✅                       ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""

exit 0
