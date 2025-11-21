#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🚀 TITANE INFINITY v16.1 - QUICK START GUIDE
# ═══════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 TITANE INFINITY v16.1 - QUICK START"
echo "   Mode: OFFLINE FIRST + TAURI-ONLY"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Variables
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 1 : Vérification Environnement
# ═══════════════════════════════════════════════════════════════════════════

echo "1️⃣  Vérification de l'environnement..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "   ${GREEN}✅${NC} Node.js: $NODE_VERSION"
else
    echo -e "   ${RED}❌ Node.js non trouvé${NC}"
    echo "      Installation: https://nodejs.org/"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "   ${GREEN}✅${NC} npm: v$NPM_VERSION"
else
    echo -e "   ${RED}❌ npm non trouvé${NC}"
    exit 1
fi

# Cargo (Rust)
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo -V | cut -d ' ' -f 2)
    echo -e "   ${GREEN}✅${NC} Cargo: v$CARGO_VERSION"
else
    echo -e "   ${YELLOW}⚠️  Cargo non trouvé (optionnel pour build Tauri)${NC}"
    echo "      Installation: https://rustup.rs/"
fi

# Ollama (Optionnel)
if command -v ollama &> /dev/null; then
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo -e "   ${GREEN}✅${NC} Ollama: Actif (http://localhost:11434)"
    else
        echo -e "   ${YELLOW}⚠️  Ollama installé mais non démarré${NC}"
        echo "      Démarrage: ollama serve"
    fi
else
    echo -e "   ${YELLOW}⚠️  Ollama non trouvé (optionnel - AI local)${NC}"
    echo "      Installation: https://ollama.ai/"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 : Installation Dépendances
# ═══════════════════════════════════════════════════════════════════════════

echo "2️⃣  Installation des dépendances..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "   📦 Installation des packages npm..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Dépendances installées${NC}"
    else
        echo -e "   ${RED}❌ Échec installation dépendances${NC}"
        exit 1
    fi
else
    echo -e "   ${GREEN}✅ Dépendances déjà installées${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 3 : Build Frontend
# ═══════════════════════════════════════════════════════════════════════════

echo "3️⃣  Build du frontend..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo ""
    echo -e "   ${GREEN}✅ Build réussi${NC}"
    echo "      Taille bundle: $BUNDLE_SIZE"
else
    echo -e "   ${RED}❌ Échec du build${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 4 : Validation Configuration
# ═══════════════════════════════════════════════════════════════════════════

echo "4️⃣  Validation de la configuration..."
echo ""

# Vérifier scripts npm
DEV_SCRIPT=$(cat package.json | grep -o '"dev": "[^"]*"' | cut -d '"' -f 4)
if [ "$DEV_SCRIPT" = "tauri dev" ]; then
    echo -e "   ${GREEN}✅${NC} Scripts npm: tauri dev"
else
    echo -e "   ${YELLOW}⚠️  Scripts npm: $DEV_SCRIPT (attendu: tauri dev)${NC}"
fi

# Vérifier ports libres
PORTS_USED=$(lsof -ti :5173,8080,4173 2>/dev/null | wc -l)
if [ "$PORTS_USED" -eq 0 ]; then
    echo -e "   ${GREEN}✅${NC} Ports libres: 5173, 8080, 4173"
else
    echo -e "   ${YELLOW}⚠️  $PORTS_USED port(s) occupé(s)${NC}"
fi

# Vérifier dist/
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "   ${GREEN}✅${NC} Build dist/ présent"
else
    echo -e "   ${RED}❌ Build dist/ absent${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 5 : Options de Démarrage
# ═══════════════════════════════════════════════════════════════════════════

echo "5️⃣  Prêt à démarrer!"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "   📋 OPTIONS DE DÉMARRAGE:"
echo ""
echo "   ${BLUE}A)${NC} Mode Tauri (Recommandé - Application native)"
echo "      ${GREEN}npm run dev${NC}"
echo ""
echo "   ${BLUE}B)${NC} Mode Web (Debug uniquement)"
echo "      ${GREEN}cd dist && python3 -m http.server 8080${NC}"
echo "      Puis ouvrir: http://localhost:8080"
echo ""
echo "   ${BLUE}C)${NC} Build Tauri natif (Nécessite Rust + dépendances système)"
echo "      ${GREEN}npm run tauri build${NC}"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "   📚 DOCUMENTATION:"
echo ""
echo "   • Architecture:        ARCHITECTURE_OFFLINE_FIRST_v16.1.md"
echo "   • Guide de test:       TEST_TAURI_MODE.md"
echo "   • Changelog:           CHANGELOG_v16.1.0.md"
echo "   • Validation:          ./scripts/validate-tauri-only.sh"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "   🎯 MODE ACTUEL: OFFLINE FIRST + TAURI-ONLY"
echo ""
echo "   ✅ Fonctionnement 100% hors ligne"
echo "   ✅ APIs cloud uniquement sur demande"
echo "   ✅ Confirmation utilisateur obligatoire"
echo "   ✅ Données locales (localStorage)"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Demander choix utilisateur
read -p "   Démarrer maintenant ? (A/B/C/N) [N]: " choice
choice=${choice:-N}

case "$choice" in
    A|a)
        echo ""
        echo "   🚀 Démarrage Tauri..."
        echo ""
        npm run dev
        ;;
    B|b)
        echo ""
        echo "   🌐 Démarrage serveur web local..."
        echo ""
        cd dist
        python3 -m http.server 8080
        ;;
    C|c)
        echo ""
        echo "   🔨 Build Tauri natif..."
        echo ""
        npm run tauri build
        ;;
    N|n|*)
        echo ""
        echo "   ✅ Configuration terminée."
        echo "      Utilisez les commandes ci-dessus pour démarrer."
        echo ""
        ;;
esac
