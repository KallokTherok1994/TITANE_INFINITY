#!/usr/bin/env bash
set -e

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — Lancement Tauri avec vérifications
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🚀 TITANE∞ — Lancement Application Tauri${NC}"
echo ""

# Vérifier WebKitGTK
echo -e "${BLUE}[1/3] Vérification WebKitGTK...${NC}"
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo -e "      ${GREEN}✓${NC} WebKitGTK 4.1 : $VERSION"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo -e "      ${YELLOW}⚠${NC} WebKitGTK 4.0 : $VERSION (4.1 recommandé)"
else
    echo -e "      ${RED}✗${NC} WebKitGTK manquant"
    echo ""
    echo -e "${RED}ERREUR : WebKitGTK requis pour Tauri${NC}"
    echo ""
    echo "Installez-le avec (terminal système avec sudo) :"
    echo ""
    echo -e "${YELLOW}sudo apt install -y libwebkit2gtk-4.1-dev libgtk-3-dev${NC}"
    echo ""
    exit 1
fi
echo ""

# Nettoyer les ports
echo -e "${BLUE}[2/3] Nettoyage des ports...${NC}"

# Utiliser fuser (disponible dans Flatpak) au lieu de lsof
if command -v fuser >/dev/null 2>&1; then
    # Port 5173 (Vite)
    if fuser 5173/tcp >/dev/null 2>&1; then
        echo -e "      ${YELLOW}⚠${NC} Port 5173 occupé, nettoyage..."
        fuser -k 5173/tcp >/dev/null 2>&1 || true
        sleep 0.5
        echo -e "      ${GREEN}✓${NC} Port 5173 libéré"
    else
        echo -e "      ${GREEN}✓${NC} Port 5173 libre"
    fi
    
    # Port 1420 (Tauri)
    if fuser 1420/tcp >/dev/null 2>&1; then
        echo -e "      ${YELLOW}⚠${NC} Port 1420 occupé, nettoyage..."
        fuser -k 1420/tcp >/dev/null 2>&1 || true
        sleep 0.5
        echo -e "      ${GREEN}✓${NC} Port 1420 libéré"
    else
        echo -e "      ${GREEN}✓${NC} Port 1420 libre"
    fi
else
    echo -e "      ${YELLOW}⚠${NC} fuser non disponible, nettoyage manuel requis"
    echo -e "      ${YELLOW}→${NC} Exécutez : pkill -f vite || pkill -f tauri"
fi
echo ""

# Nettoyer cache Vite
echo -e "${BLUE}[3/3] Nettoyage cache...${NC}"
rm -rf .vite 2>/dev/null || true
echo -e "      ${GREEN}✓${NC} Cache Vite nettoyé"
echo ""

echo -e "${GREEN}✓ Système prêt${NC}"
echo ""
echo -e "${BLUE}Lancement de Tauri...${NC}"
echo -e "${YELLOW}(Compilation Rust peut prendre 1-2 minutes la première fois)${NC}"
echo ""

# Lancer Tauri
npm run tauri:dev
