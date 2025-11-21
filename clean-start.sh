#!/usr/bin/env bash
set -e

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — Clean Start (tue processus + démarre)
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🧹 TITANE∞ — Clean Start"
echo "════════════════════════════════════════════════════════"
echo ""

# Fonction pour tuer un processus sur un port
kill_port() {
    local port=$1
    echo -e "${BLUE}🔍 Vérification du port $port...${NC}"
    
    # Utiliser fuser au lieu de lsof (compatible Flatpak)
    if command -v fuser >/dev/null 2>&1; then
        if fuser ${port}/tcp >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠ Processus détecté sur le port $port${NC}"
            echo -e "${BLUE}   → Arrêt du processus...${NC}"
            fuser -k ${port}/tcp >/dev/null 2>&1 || true
            sleep 1
            echo -e "${GREEN}   ✓ Processus arrêté${NC}"
        else
            echo -e "${GREEN}✓ Port $port libre${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ fuser non disponible${NC}"
        echo -e "${YELLOW}→ Utilisez : pkill -f vite || pkill -f tauri${NC}"
    fi
}

# Tuer les processus sur les ports Vite/Tauri
kill_port 5173  # Vite dev server
kill_port 1420  # Tauri dev server

echo ""
echo -e "${BLUE}🧹 Nettoyage des caches...${NC}"
rm -rf .vite 2>/dev/null || true
echo -e "${GREEN}✓ Caches supprimés${NC}"

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ SYSTÈME NETTOYÉ${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🚀 Choisissez le mode de lancement :"
echo ""
echo -e "  ${BLUE}1${NC} - Frontend uniquement (Vite dev - port 5173)"
echo -e "  ${BLUE}2${NC} - Application complète (Tauri + Frontend)"
echo -e "  ${BLUE}3${NC} - Build production"
echo -e "  ${BLUE}4${NC} - Type-check seulement"
echo -e "  ${BLUE}5${NC} - Preview du build"
echo ""

read -p "Votre choix [1-5] : " choice

echo ""
case $choice in
    1)
        echo -e "${GREEN}✓ Lancement du frontend...${NC}"
        echo ""
        npm run dev
        ;;
    2)
        echo -e "${GREEN}✓ Lancement de l'application Tauri...${NC}"
        echo -e "${BLUE}   (Compilation Rust peut prendre 1-2 minutes la première fois)${NC}"
        echo ""
        npm run tauri:dev
        ;;
    3)
        echo -e "${GREEN}✓ Build production...${NC}"
        echo ""
        npm run build
        ;;
    4)
        echo -e "${GREEN}✓ Type-check...${NC}"
        echo ""
        npm run type-check
        ;;
    5)
        echo -e "${GREEN}✓ Preview du build...${NC}"
        echo ""
        npm run preview
        ;;
    *)
        echo -e "${YELLOW}✗ Choix invalide${NC}"
        exit 1
        ;;
esac
