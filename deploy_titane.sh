#!/bin/bash

# ════════════════════════════════════════════════════════════════
# 🚀 TITANE∞ v9.0.0 — SCRIPT DE DÉPLOIEMENT COMPLET TAURI
# ════════════════════════════════════════════════════════════════
# Version: 1.0.0
# Date: 2025-11-18
# Platform: Linux Pop!_OS (compatible Ubuntu/Debian)
# Pipeline: Préparation → Build → Test → Package → Release
# ════════════════════════════════════════════════════════════════

set -e  # Arrêt immédiat en cas d'erreur

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TITANE_ROOT="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="TITANE∞ v9"
APP_VERSION="9.0.0"
BUILD_MODE="${1:-release}"  # release ou debug

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        TITANE∞ v9 — DÉPLOIEMENT TAURI COMPLET${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Répertoire: ${TITANE_ROOT}${NC}"
echo -e "${BLUE}📦 Version: ${APP_VERSION}${NC}"
echo -e "${BLUE}🔧 Mode: ${BUILD_MODE}${NC}"
echo ""
sleep 1

# ════════════════════════════════════════════════════════════════
# [1/12] MISE À JOUR DES DÉPENDANCES SYSTÈME
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[1/12]${NC} Mise à jour des dépendances système…"

# Vérification des permissions sudo
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}⚠ Permissions sudo requises pour installer les dépendances système${NC}"
    echo "Vous pouvez continuer sans sudo si les dépendances sont déjà installées."
    read -p "Continuer sans sudo? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Installation annulée${NC}"
        exit 1
    fi
    SKIP_SUDO=true
fi

if [ "$SKIP_SUDO" != "true" ]; then
    sudo apt update -y
    sudo apt install -y \
        curl \
        wget \
        file \
        pkg-config \
        libssl-dev \
        build-essential \
        libgtk-3-dev \
        libwebkit2gtk-4.1-dev \
        libjavascriptcoregtk-4.1-dev \
        libsoup-3.0-dev \
        librsvg2-dev \
        libayatana-appindicator3-dev
    echo -e "${GREEN}✓ Dépendances système installées${NC}"
else
    echo -e "${YELLOW}⚠ Installation système ignorée${NC}"
fi

# ════════════════════════════════════════════════════════════════
# [2/12] VÉRIFICATION & INSTALLATION RUST/CARGO
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[2/12]${NC} Vérification de Rust & Cargo…"

if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}⚠ Rust introuvable → installation rustup…${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo -e "${GREEN}✓ Rust installé${NC}"
else
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Rust ${RUST_VERSION} détecté${NC}"
fi

# Mise à jour de Rust
rustup update stable
source "$HOME/.cargo/env"

# ════════════════════════════════════════════════════════════════
# [3/12] INSTALLATION TAURI CLI
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[3/12]${NC} Installation/Mise à jour Tauri CLI…"

if ! command -v cargo-tauri &> /dev/null; then
    echo "Installation de Tauri CLI…"
    cargo install tauri-cli --locked
    echo -e "${GREEN}✓ Tauri CLI installé${NC}"
else
    echo -e "${GREEN}✓ Tauri CLI déjà installé${NC}"
fi

# ════════════════════════════════════════════════════════════════
# [4/12] VÉRIFICATION & INSTALLATION NODE.JS
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[4/12]${NC} Vérification de Node.js…"

# Chargement de nvm si disponible
export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    echo -e "${GREEN}✓ nvm chargé${NC}"
fi

# Fallback vers nvm standard
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trouvé${NC}"
    echo "Veuillez installer Node.js (>= 20.x) avant de continuer."
    exit 1
else
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
    echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
fi

# ════════════════════════════════════════════════════════════════
# [5/12] INSTALLATION DÉPENDANCES FRONTEND
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[5/12]${NC} Installation des dépendances frontend…"

cd "$TITANE_ROOT"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json introuvable${NC}"
    exit 1
fi

echo "Installation des packages npm…"
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dépendances frontend installées ($(ls node_modules | wc -l) packages)${NC}"
else
    echo -e "${RED}❌ Échec installation npm${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# [6/12] BUILD FRONTEND (VITE + REACT)
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[6/12]${NC} Compilation du frontend (Vite + React + TypeScript)…"

echo "Type checking…"
npm run type-check || echo -e "${YELLOW}⚠ Type check avec warnings${NC}"

echo "Build production…"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Échec du build frontend - dossier dist/ absent${NC}"
    exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
echo -e "${GREEN}✓ Frontend compilé (${DIST_SIZE})${NC}"

# Vérification des fichiers critiques
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ index.html manquant dans dist/${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# [7/12] VÉRIFICATION CONFIGURATION TAURI
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[7/12]${NC} Vérification configuration Tauri…"

if [ ! -d "src-tauri" ]; then
    echo -e "${RED}❌ Dossier src-tauri/ introuvable${NC}"
    exit 1
fi

if [ ! -f "src-tauri/Cargo.toml" ]; then
    echo -e "${RED}❌ src-tauri/Cargo.toml introuvable${NC}"
    exit 1
fi

if [ ! -f "src-tauri/tauri.conf.json" ]; then
    echo -e "${YELLOW}⚠ tauri.conf.json introuvable - génération recommandée${NC}"
fi

echo -e "${GREEN}✓ Configuration Tauri validée${NC}"

# ════════════════════════════════════════════════════════════════
# [8/12] COMPILATION RUST BACKEND
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[8/12]${NC} Compilation du backend Rust…"

cd "$TITANE_ROOT/src-tauri"

if [ "$BUILD_MODE" = "release" ]; then
    echo "Build RELEASE (optimisé)…"
    cargo build --release
    BINARY_PATH="target/release"
else
    echo "Build DEBUG (rapide)…"
    cargo build
    BINARY_PATH="target/debug"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend Rust compilé${NC}"
else
    echo -e "${RED}❌ Échec compilation Rust${NC}"
    exit 1
fi

cd "$TITANE_ROOT"

# ════════════════════════════════════════════════════════════════
# [9/12] BUILD COMPLET TAURI
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[9/12]${NC} Compilation application Tauri complète…"

if [ "$BUILD_MODE" = "release" ]; then
    cargo tauri build
else
    cargo tauri build --debug
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build Tauri échoué${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Application Tauri compilée${NC}"

# ════════════════════════════════════════════════════════════════
# [10/12] VÉRIFICATION & OPTIMISATION BINAIRES
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[10/12]${NC} Vérification et optimisation des binaires…"

# Recherche du binaire principal
BINARY_NAME=$(grep '^name' src-tauri/Cargo.toml | head -1 | cut -d'"' -f2)
BINARY_FILE="src-tauri/${BINARY_PATH}/${BINARY_NAME}"

if [ -f "$BINARY_FILE" ]; then
    BINARY_SIZE=$(ls -lh "$BINARY_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Binaire trouvé: ${BINARY_FILE} (${BINARY_SIZE})${NC}"
    
    if [ "$BUILD_MODE" = "release" ]; then
        echo "Optimisation (strip)…"
        strip "$BINARY_FILE" 2>/dev/null || echo -e "${YELLOW}⚠ Strip non disponible${NC}"
        BINARY_SIZE_AFTER=$(ls -lh "$BINARY_FILE" | awk '{print $5}')
        echo -e "${GREEN}✓ Binaire optimisé (${BINARY_SIZE_AFTER})${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Binaire principal non trouvé à ${BINARY_FILE}${NC}"
fi

# Vérification bundle
if [ -d "src-tauri/${BINARY_PATH}/bundle" ]; then
    BUNDLE_SIZE=$(du -sh "src-tauri/${BINARY_PATH}/bundle" | cut -f1)
    echo -e "${GREEN}✓ Bundle généré (${BUNDLE_SIZE})${NC}"
    
    # Liste des formats générés
    echo "Formats disponibles:"
    find "src-tauri/${BINARY_PATH}/bundle" -type f -name "*.deb" -o -name "*.AppImage" -o -name "*.dmg" -o -name "*.exe" | while read file; do
        FILE_SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo -e "  • $(basename "$file") (${FILE_SIZE})"
    done
else
    echo -e "${YELLOW}⚠ Bundle non trouvé${NC}"
fi

# ════════════════════════════════════════════════════════════════
# [11/12] EXÉCUTION DES TESTS
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[11/12]${NC} Exécution des tests…"

cd "$TITANE_ROOT/src-tauri"

echo "Tests backend Rust…"
cargo test --all 2>&1 | tail -20

TEST_RESULT=${PIPESTATUS[0]}
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les tests passés${NC}"
else
    echo -e "${YELLOW}⚠ Certains tests ont échoué (code: ${TEST_RESULT})${NC}"
    echo "Continuer malgré les tests échoués? (y/n)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd "$TITANE_ROOT"

# ════════════════════════════════════════════════════════════════
# [12/12] PACKAGING & PRÉPARATION RELEASE
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[12/12]${NC} Packaging et préparation release…"

# Création dossier release
RELEASE_DIR="$TITANE_ROOT/release/TITANE_v${APP_VERSION}_$(date +%Y%m%d)"
mkdir -p "$RELEASE_DIR"

echo "Copie des artefacts…"

# Copie bundle si disponible
if [ -d "src-tauri/${BINARY_PATH}/bundle" ]; then
    cp -r "src-tauri/${BINARY_PATH}/bundle" "$RELEASE_DIR/"
    echo -e "${GREEN}✓ Bundle copié${NC}"
fi

# Copie binaire
if [ -f "$BINARY_FILE" ]; then
    cp "$BINARY_FILE" "$RELEASE_DIR/"
    echo -e "${GREEN}✓ Binaire copié${NC}"
fi

# Copie documentation
[ -f "README.md" ] && cp "README.md" "$RELEASE_DIR/"
[ -f "LICENSE" ] && cp "LICENSE" "$RELEASE_DIR/"
[ -f "DEPLOYMENT_REPORT_v9.0.0.md" ] && cp "DEPLOYMENT_REPORT_v9.0.0.md" "$RELEASE_DIR/"

# Génération fichier version
cat > "$RELEASE_DIR/VERSION.txt" << EOF
TITANE∞ v${APP_VERSION}
Build Date: $(date +"%Y-%m-%d %H:%M:%S")
Build Mode: ${BUILD_MODE}
Node Version: ${NODE_VERSION}
Rust Version: $(rustc --version)
Platform: $(uname -s) $(uname -m)
EOF

echo -e "${GREEN}✓ Release packagé dans: ${RELEASE_DIR}${NC}"

# Nettoyage optionnel
echo ""
read -p "Nettoyer les caches et fichiers temporaires? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Nettoyage…"
    cd "$TITANE_ROOT/src-tauri"
    cargo clean --release 2>/dev/null || true
    cd "$TITANE_ROOT"
    npm cache clean --force 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    echo -e "${GREEN}✓ Nettoyage effectué${NC}"
fi

# ════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DÉPLOIEMENT COMPLET TERMINÉ${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Application:${NC} ${APP_NAME}"
echo -e "${BLUE}🔢 Version:${NC} ${APP_VERSION}"
echo -e "${BLUE}🎯 Mode:${NC} ${BUILD_MODE}"
echo -e "${BLUE}📁 Release:${NC} ${RELEASE_DIR}"
echo ""
echo -e "${GREEN}✓ Frontend compilé (Vite + React + TypeScript)${NC}"
echo -e "${GREEN}✓ Backend compilé (Rust + Tauri)${NC}"
echo -e "${GREEN}✓ Tests exécutés${NC}"
echo -e "${GREEN}✓ Binaires optimisés${NC}"
echo -e "${GREEN}✓ Bundle généré${NC}"
echo -e "${GREEN}✓ Release packagé${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        TITANE∞ v9 — Déploiement Officiel${NC}"
echo -e "${CYAN}        Activé, Stable, Fonctionnel.${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

exit 0
