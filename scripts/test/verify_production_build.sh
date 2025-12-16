#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v19.2Ω — Post-Build Verification Script
# Vérifie l'intégrité et la configuration après build production
# ═══════════════════════════════════════════════════════════════

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  TITANE∞ v19.2Ω — Post-Build Verification                   ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# ═══════════════════════════════════════════════════════════════
# 1. Vérifier la configuration sécurité
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[1/8]${NC} Vérification configuration sécurité..."

if [ ! -f ".env" ]; then
    echo -e "  ${RED}✗ Fichier .env manquant${NC}"
    ((ERRORS++))
else
    # Vérifier permissions .env
    PERMS=$(stat -c %a .env)
    if [ "$PERMS" = "600" ]; then
        echo -e "  ${GREEN}✓ Permissions .env correctes (600)${NC}"
    else
        echo -e "  ${YELLOW}⚠ Permissions .env: $PERMS (recommandé: 600)${NC}"
        ((WARNINGS++))
    fi

    # Vérifier passphrases
    if grep -q "change_me_before_release" .env; then
        echo -e "  ${RED}✗ Passphrase par défaut détectée dans .env${NC}"
        ((ERRORS++))
    else
        echo -e "  ${GREEN}✓ Passphrases production configurées${NC}"
    fi

    # Vérifier backup
    if [ -f ".env.gpg" ]; then
        echo -e "  ${GREEN}✓ Backup chiffré .env.gpg présent${NC}"
    else
        echo -e "  ${YELLOW}⚠ Backup .env.gpg manquant${NC}"
        ((WARNINGS++))
    fi
fi

# ═══════════════════════════════════════════════════════════════
# 2. Vérifier .gitignore
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[2/8]${NC} Vérification .gitignore..."

if grep -q "^\.env$" .gitignore; then
    echo -e "  ${GREEN}✓ .env dans .gitignore${NC}"
else
    echo -e "  ${RED}✗ .env absent de .gitignore${NC}"
    ((ERRORS++))
fi

# ═══════════════════════════════════════════════════════════════
# 3. Vérifier bundles Tauri
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[3/8]${NC} Vérification bundles Tauri..."

BUNDLE_DIR="src-tauri/target/release/bundle"

if [ -d "$BUNDLE_DIR/appimage" ]; then
    APPIMAGE=$(find "$BUNDLE_DIR/appimage" -name "*.AppImage" | head -1)
    if [ -n "$APPIMAGE" ]; then
        SIZE=$(du -h "$APPIMAGE" | cut -f1)
        echo -e "  ${GREEN}✓ AppImage trouvé: $SIZE${NC}"
    else
        echo -e "  ${RED}✗ AppImage manquant${NC}"
        ((ERRORS++))
    fi
else
    echo -e "  ${RED}✗ Répertoire AppImage manquant${NC}"
    ((ERRORS++))
fi

if [ -d "$BUNDLE_DIR/deb" ]; then
    DEB=$(find "$BUNDLE_DIR/deb" -name "*.deb" | head -1)
    if [ -n "$DEB" ]; then
        SIZE=$(du -h "$DEB" | cut -f1)
        echo -e "  ${GREEN}✓ Package .deb trouvé: $SIZE${NC}"
    else
        echo -e "  ${RED}✗ Package .deb manquant${NC}"
        ((ERRORS++))
    fi
else
    echo -e "  ${RED}✗ Répertoire deb manquant${NC}"
    ((ERRORS++))
fi

# ═══════════════════════════════════════════════════════════════
# 4. Vérifier checksums
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[4/8]${NC} Vérification checksums SHA256..."

if [ -f "CHECKSUMS_SHA256.txt" ]; then
    echo -e "  ${GREEN}✓ Fichier checksums présent${NC}"
else
    echo -e "  ${YELLOW}⚠ Fichier checksums manquant${NC}"
    ((WARNINGS++))
fi

# ═══════════════════════════════════════════════════════════════
# 5. Vérifier build frontend
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[5/8]${NC} Vérification build frontend..."

if [ -d "dist" ]; then
    if [ -f "dist/index.html" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "  ${GREEN}✓ Build Vite présent: $DIST_SIZE${NC}"
    else
        echo -e "  ${RED}✗ dist/index.html manquant${NC}"
        ((ERRORS++))
    fi
else
    echo -e "  ${RED}✗ Répertoire dist manquant${NC}"
    ((ERRORS++))
fi

# ═══════════════════════════════════════════════════════════════
# 6. Vérifier build backend
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[6/8]${NC} Vérification build backend..."

BINARY="src-tauri/target/release/titane-infinity"
if [ -f "$BINARY" ]; then
    SIZE=$(du -h "$BINARY" | cut -f1)
    echo -e "  ${GREEN}✓ Binaire Rust trouvé: $SIZE${NC}"

    # Vérifier si stripped
    if file "$BINARY" | grep -q "not stripped"; then
        echo -e "  ${GREEN}✓ Binaire non stripped (requis pour Tauri)${NC}"
    fi
else
    echo -e "  ${RED}✗ Binaire Rust manquant${NC}"
    ((ERRORS++))
fi

# ═══════════════════════════════════════════════════════════════
# 7. Vérifier documentation
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[7/8]${NC} Vérification documentation..."

DOCS=(
    "AUDIT_FINAL_COMPLET_v19.2_OMEGA.md"
    "SECURITY_CONFIG_PRODUCTION.md"
    "DEPLOYMENT_FINAL_v19.2_OMEGA.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ${GREEN}✓ $doc${NC}"
    else
        echo -e "  ${YELLOW}⚠ $doc manquant${NC}"
        ((WARNINGS++))
    fi
done

# ═══════════════════════════════════════════════════════════════
# 8. Vérifier configuration Tauri
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[8/8]${NC} Vérification configuration Tauri..."

TAURI_CONF="src-tauri/tauri.conf.json"
if [ -f "$TAURI_CONF" ]; then
    echo -e "  ${GREEN}✓ tauri.conf.json présent${NC}"

    # Vérifier version
    VERSION=$(grep '"version"' "$TAURI_CONF" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    if [ "$VERSION" = "19.2.0" ]; then
        echo -e "  ${GREEN}✓ Version correcte: $VERSION${NC}"
    else
        echo -e "  ${YELLOW}⚠ Version: $VERSION (attendu: 19.2.0)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "  ${RED}✗ tauri.conf.json manquant${NC}"
    ((ERRORS++))
fi

# ═══════════════════════════════════════════════════════════════
# Rapport final
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  RAPPORT FINAL                                               ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════╣${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${BOLD}║  Status: ${GREEN}✅ PARFAIT${NC}                                         ${BOLD}║${NC}"
    echo -e "${BOLD}║  Erreurs: ${GREEN}0${NC}                                                 ${BOLD}║${NC}"
    echo -e "${BOLD}║  Warnings: ${GREEN}0${NC}                                                ${BOLD}║${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${BOLD}║  Status: ${YELLOW}⚠ WARNINGS DÉTECTÉS${NC}                              ${BOLD}║${NC}"
    echo -e "${BOLD}║  Erreurs: ${GREEN}0${NC}                                                 ${BOLD}║${NC}"
    echo -e "${BOLD}║  Warnings: ${YELLOW}$WARNINGS${NC}                                                ${BOLD}║${NC}"
else
    echo -e "${BOLD}║  Status: ${RED}❌ ERREURS DÉTECTÉES${NC}                               ${BOLD}║${NC}"
    echo -e "${BOLD}║  Erreurs: ${RED}$ERRORS${NC}                                                 ${BOLD}║${NC}"
    echo -e "${BOLD}║  Warnings: ${YELLOW}$WARNINGS${NC}                                                ${BOLD}║${NC}"
fi

echo -e "${BOLD}╠══════════════════════════════════════════════════════════════╣${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${BOLD}║  ${GREEN}✅ TITANE∞ v19.2Ω PRÊT POUR DISTRIBUTION${NC}                 ${BOLD}║${NC}"
else
    echo -e "${BOLD}║  ${RED}❌ CORRIGER LES ERREURS AVANT DISTRIBUTION${NC}                ${BOLD}║${NC}"
fi

echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Exit code
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
