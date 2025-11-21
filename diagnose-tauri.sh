#!/usr/bin/env bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}🔧 FIX TAURI BEFOREDEVCOMMAND — DIAGNOSTIC${NC}          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}📊 ANALYSE SYSTÈME${NC}"
echo "────────────────────────────────────────────────────────"
echo ""

# Test 1 : Configuration Tauri
echo -e "${BLUE}[1/5] Configuration tauri.conf.json...${NC}"
if [ -f "src-tauri/tauri.conf.json" ]; then
    if grep -q '"beforeDevCommand": "npm run dev"' src-tauri/tauri.conf.json; then
        echo -e "      ${GREEN}✓${NC} beforeDevCommand : npm run dev"
    fi
    if grep -q '"devUrl": "http://localhost:5173"' src-tauri/tauri.conf.json; then
        echo -e "      ${GREEN}✓${NC} devUrl : http://localhost:5173"
    fi
    if grep -q '"frontendDist": "../dist"' src-tauri/tauri.conf.json; then
        echo -e "      ${GREEN}✓${NC} frontendDist : ../dist"
    fi
    echo -e "      ${GREEN}✓${NC} Configuration Tauri v2 CORRECTE"
else
    echo -e "      ${RED}✗${NC} tauri.conf.json introuvable"
fi
echo ""

# Test 2 : Scripts npm
echo -e "${BLUE}[2/5] Scripts package.json...${NC}"
if npm run 2>&1 | grep -q "^\s\sdev$"; then
    echo -e "      ${GREEN}✓${NC} npm run dev : OK"
else
    echo -e "      ${RED}✗${NC} npm run dev : MANQUANT"
fi

if npm run 2>&1 | grep -q "^\s\stauri:dev$"; then
    echo -e "      ${GREEN}✓${NC} npm run tauri:dev : OK"
else
    echo -e "      ${RED}✗${NC} npm run tauri:dev : MANQUANT"
fi
echo ""

# Test 3 : Frontend Vite
echo -e "${BLUE}[3/5] Test frontend (Vite)...${NC}"
timeout 2 npm run dev &>/dev/null &
VITE_PID=$!
sleep 1.5

if curl -s http://localhost:5173 &>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Vite démarre correctement (port 5173)"
    kill $VITE_PID 2>/dev/null
else
    echo -e "      ${YELLOW}⚠${NC} Vite n'a pas démarré (test timeout)"
    kill $VITE_PID 2>/dev/null
fi

# Nettoyer le port
lsof -Pi :5173 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9 &>/dev/null
echo ""

# Test 4 : WebKitGTK (cause réelle du problème)
echo -e "${BLUE}[4/5] Dépendances système (WebKitGTK)...${NC}"
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo -e "      ${GREEN}✓${NC} WebKitGTK 4.1 : $VERSION installé"
    WEBKIT_OK=true
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo -e "      ${YELLOW}⚠${NC} WebKitGTK 4.0 : $VERSION (4.1 recommandé)"
    WEBKIT_OK=false
else
    echo -e "      ${RED}✗${NC} WebKitGTK NON INSTALLÉ"
    echo -e "      ${RED}✗${NC} C'EST LA CAUSE DE L'ERREUR !"
    WEBKIT_OK=false
fi
echo ""

# Test 5 : Compilation Rust
echo -e "${BLUE}[5/5] Test compilation Tauri...${NC}"
if [ "$WEBKIT_OK" = true ]; then
    echo -e "      ${GREEN}✓${NC} WebKitGTK présent, compilation possible"
else
    echo -e "      ${RED}✗${NC} WebKitGTK manquant, compilation impossible"
    echo -e "      ${RED}✗${NC} Erreur attendue : 'unable to find library -lwebkit2gtk-4.1'"
fi
echo ""

echo "────────────────────────────────────────────────────────"
echo ""

# Diagnostic final
echo -e "${BOLD}🎯 DIAGNOSTIC${NC}"
echo "────────────────────────────────────────────────────────"
echo ""

if [ "$WEBKIT_OK" = true ]; then
    echo -e "${GREEN}✅ Système configuré correctement${NC}"
    echo ""
    echo "Tous les composants nécessaires sont présents."
    echo "L'application devrait démarrer avec : npm run tauri:dev"
else
    echo -e "${RED}❌ Erreur identifiée : WebKitGTK manquant${NC}"
    echo ""
    echo "L'erreur 'beforeDevCommand terminated with non-zero status'"
    echo "est causée par l'absence de WebKitGTK 4.1."
    echo ""
    echo -e "${BOLD}beforeDevCommand fonctionne correctement !${NC}"
    echo "C'est la compilation Rust/Tauri qui échoue ensuite."
fi

echo ""
echo "────────────────────────────────────────────────────────"
echo ""

# Instructions d'installation
if [ "$WEBKIT_OK" = false ]; then
    echo -e "${BOLD}🔧 SOLUTION${NC}"
    echo "────────────────────────────────────────────────────────"
    echo ""
    echo -e "${YELLOW}⚠️  Ouvrez un VRAI TERMINAL (pas VSCode Flatpak)${NC}"
    echo ""
    echo "Exécutez cette commande :"
    echo ""
    echo -e "${CYAN}sudo apt update && sudo apt install -y \\${NC}"
    echo -e "${CYAN}    libwebkit2gtk-4.1-dev \\${NC}"
    echo -e "${CYAN}    libgtk-3-dev \\${NC}"
    echo -e "${CYAN}    libayatana-appindicator3-dev \\${NC}"
    echo -e "${CYAN}    librsvg2-dev \\${NC}"
    echo -e "${CYAN}    patchelf${NC}"
    echo ""
    echo "Puis relancer : npm run tauri:dev"
    echo ""
fi

echo "────────────────────────────────────────────────────────"
echo ""

echo -e "${BOLD}📚 DOCUMENTATION${NC}"
echo "────────────────────────────────────────────────────────"
echo ""
echo "  FIX_BEFOREDEVCOMMAND.md  → Guide complet"
echo "  install-tauri-deps.sh    → Script d'installation"
echo ""

if [ "$WEBKIT_OK" = true ]; then
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}✅ Prêt à lancer : npm run tauri:dev${NC}                   ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${YELLOW}⚠️  Installez WebKitGTK puis relancez npm run tauri:dev${NC}  ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
