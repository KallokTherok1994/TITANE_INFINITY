#!/bin/bash

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — QUICK START SCRIPT
#   Lance le frontend ou l'application complète
# ═══════════════════════════════════════════════════════════

set -e

echo ""
echo "🚀 TITANE∞ v15.5.0 — Quick Start"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules non trouvé. Installation des dépendances...${NC}"
    npm install
    echo ""
fi

# Si argument fourni, l'utiliser
if [ $# -eq 1 ]; then
    choice=$1
else
    # Menu de sélection
    echo "Choisissez le mode de lancement :"
    echo ""
    echo "  ${BLUE}1${NC} - Frontend uniquement (Vite dev server - port 5173)"
    echo "  ${BLUE}2${NC} - Application complète (Tauri + Frontend)"
    echo "  ${BLUE}3${NC} - Build production (compile tout)"
    echo "  ${BLUE}4${NC} - Vérification TypeScript uniquement"
    echo "  ${BLUE}5${NC} - Preview du build (après npm run build)"
    echo ""
    read -p "Votre choix [1-5] : " choice
fi

case $choice in
    1)
        echo ""
        echo -e "${GREEN}✓${NC} Lancement du frontend en mode développement..."
        echo -e "${BLUE}→${NC} URL : http://localhost:5173"
        echo -e "${BLUE}→${NC} Appuyez sur Ctrl+C pour arrêter"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⚠ Vérification de WebKitGTK...${NC}"
        if ! pkg-config --exists webkit2gtk-4.1; then
            echo -e "${RED}✗ WebKitGTK 4.1 non installé !${NC}"
            echo ""
            echo "Installation requise :"
            echo "  sudo ./install_system_deps.sh"
            echo ""
            echo "Ou manuellement (Pop!_OS/Ubuntu) :"
            echo "  sudo apt install libwebkit2gtk-4.1-dev"
            echo ""
            exit 1
        fi
        
        echo -e "${GREEN}✓${NC} WebKitGTK détecté"
        echo -e "${GREEN}✓${NC} Lancement de l'application complète..."
        echo ""
        npm run tauri:dev
        ;;
    3)
        echo ""
        echo -e "${GREEN}✓${NC} Build production..."
        echo -e "${BLUE}→${NC} TypeScript check..."
        npm run type-check
        echo ""
        echo -e "${BLUE}→${NC} Frontend build..."
        npm run build
        echo ""
        echo -e "${GREEN}✓${NC} Build terminé ! Fichiers dans ./dist/"
        echo ""
        echo "Pour compiler le backend Tauri :"
        echo "  npm run tauri:build"
        ;;
    4)
        echo ""
        echo -e "${GREEN}✓${NC} Vérification TypeScript..."
        npm run type-check
        echo ""
        echo -e "${GREEN}✓${NC} Aucune erreur TypeScript !"
        ;;
    5)
        echo ""
        if [ ! -d "dist" ]; then
            echo -e "${RED}✗ Dossier dist/ non trouvé !${NC}"
            echo ""
            echo "Lancez d'abord :"
            echo "  npm run build"
            exit 1
        fi
        
        echo -e "${GREEN}✓${NC} Lancement du preview..."
        echo -e "${BLUE}→${NC} URL : http://localhost:4173"
        echo ""
        npm run preview
        ;;
    *)
        echo ""
        echo -e "${RED}✗ Choix invalide${NC}"
        exit 1
        ;;
esac
