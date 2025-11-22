#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v17.2.1 — DIAGNOSTIC ÉCRAN NOIR PROFOND
# Analyse complète : Backend + Frontend + WebKit + Vite + Tauri
# ═══════════════════════════════════════════════════════════════

echo "🔍 TITANE∞ v17.2.1 — DIAGNOSTIC ÉCRAN NOIR PROFOND"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd /home/titane/Documents/TITANE_INFINITY

# ═══════════════════════════════════════════════════════════════
# I. BACKEND RUST
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ I. BACKEND RUST ═══${NC}"

echo -n "1. Compilation Rust... "
if (cd src-tauri && cargo check --quiet 2>&1) | grep -q "Finished"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ÉCHEC${NC}"
    echo "   → Compilation backend bloquée"
fi

echo -n "2. main.rs contient println debug... "
if grep -q "println!" src-tauri/src/main.rs; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  MISSING${NC}"
    echo "   → Ajouter des println! pour debug"
fi

echo -n "3. DevTools auto-ouverture dans setup... "
if grep -q "open_devtools" src-tauri/src/main.rs; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    echo "   → DevTools non activés automatiquement"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# II. FRONTEND REACT
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ II. FRONTEND REACT ═══${NC}"

echo -n "1. main.tsx contient console.log debug... "
if grep -q "console.log" src/main.tsx; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  MISSING${NC}"
    echo "   → Ajouter console.log pour debug runtime"
fi

echo -n "2. Error handlers globaux (error + unhandledrejection)... "
if grep -q "addEventListener.*error" src/main.tsx && grep -q "unhandledrejection" src/main.tsx; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    echo "   → Handlers d'erreur manquants"
fi

echo -n "3. ErrorBoundary React... "
if grep -q "ErrorBoundary" src/main.tsx; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  MISSING${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# III. VITE BUILD
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ III. VITE BUILD ═══${NC}"

echo -n "1. dist/ existe... "
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    echo "   → Lancer 'npm run build'"
fi

echo -n "2. dist/index.html existe... "
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
fi

echo -n "3. dist/assets/ existe... "
if [ -d "dist/assets" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   → Fichiers: $(ls dist/assets/ | wc -l) fichiers"
else
    echo -e "${RED}❌ MISSING${NC}"
fi

echo -n "4. index.html utilise chemins relatifs (./)... "
if grep -q 'src="\./assets' dist/index.html 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ CHEMINS ABSOLUS DÉTECTÉS${NC}"
    echo "   → Vite config doit avoir: base: './'"
fi

echo -n "5. vite.config.ts: base='./'... "
if grep -q "base: '\.\/'" vite.config.ts || grep -q 'base: "\.\/"' vite.config.ts; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ INCORRECT${NC}"
    echo "   → Changer en: base: './'"
fi

echo -n "6. vite.config.ts: outDir='dist'... "
if grep -q "outDir: 'dist'" vite.config.ts; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  VÉRIFIER${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# IV. TAURI CONFIG
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ IV. TAURI CONFIG ═══${NC}"

echo -n "1. frontendDist pointe vers ../dist... "
if grep -q '"frontendDist": "\.\./dist"' src-tauri/tauri.conf.json; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  VÉRIFIER${NC}"
    grep "frontendDist" src-tauri/tauri.conf.json || echo "   → Non trouvé"
fi

echo -n "2. devtools: true... "
if grep -q '"devtools": true' src-tauri/tauri.conf.json; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ DÉSACTIVÉ${NC}"
fi

echo -n "3. CSP désactivé (null)... "
if grep -q '"csp": null' src-tauri/tauri.conf.json; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  CSP ACTIF${NC}"
    echo "   → Peut bloquer scripts"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# V. WEBKITGTK (CRITIQUE)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ V. WEBKITGTK (Pop!_OS) ═══${NC}"

echo -n "1. webkit2gtk-4.1 installé... "
if flatpak-spawn --host pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(flatpak-spawn --host pkg-config --modversion webkit2gtk-4.1 2>/dev/null)
    echo -e "${GREEN}✅ OK (v$VERSION)${NC}"
elif command -v pkg-config >/dev/null 2>&1 && pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>/dev/null)
    echo -e "${GREEN}✅ OK (v$VERSION)${NC}"
else
    echo -e "${RED}❌ NOT FOUND${NC}"
    echo "   → CAUSE PROBABLE DE L'ÉCRAN NOIR!"
    echo "   → Installer: sudo apt install libwebkit2gtk-4.1-dev"
fi

echo -n "2. libjavascriptcoregtk-4.1 installé... "
if flatpak-spawn --host pkg-config --exists javascriptcoregtk-4.1 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
elif command -v pkg-config >/dev/null 2>&1 && pkg-config --exists javascriptcoregtk-4.1 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ NOT FOUND${NC}"
    echo "   → Installer: sudo apt install libjavascriptcoregtk-4.1-dev"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# VI. PORTS ET PROCESSUS
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══ VI. PORTS ET PROCESSUS ═══${NC}"

echo -n "1. Port 5173 (Vite) libre... "
if ! lsof -i :5173 >/dev/null 2>&1 && ! netstat -tuln 2>/dev/null | grep -q ":5173 "; then
    echo -e "${GREEN}✅ LIBRE${NC}"
else
    echo -e "${YELLOW}⚠️  OCCUPÉ${NC}"
    echo "   → Processus: $(lsof -i :5173 2>/dev/null | tail -1 || echo 'inconnu')"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# VII. RÉSUMÉ
# ═══════════════════════════════════════════════════════════════
echo "══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 RÉSUMÉ DIAGNOSTIC${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""

echo "🔴 PROBLÈMES CRITIQUES DÉTECTÉS:"
echo ""

# Check WebKit
if ! flatpak-spawn --host pkg-config --exists webkit2gtk-4.1 2>/dev/null && \
   ! (command -v pkg-config >/dev/null 2>&1 && pkg-config --exists webkit2gtk-4.1 2>/dev/null); then
    echo -e "${RED}❌ WebKitGTK 4.1 NON INSTALLÉ${NC}"
    echo "   → C'EST LA CAUSE PROBABLE DE L'ÉCRAN NOIR"
    echo "   → Solution:"
    echo "      flatpak-spawn --host sudo apt update"
    echo "      flatpak-spawn --host sudo apt install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev"
    echo ""
fi

# Check dist
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ DIST/ INCOMPLET${NC}"
    echo "   → Lancer: npm run build"
    echo ""
fi

# Check DevTools
if ! grep -q "open_devtools" src-tauri/src/main.rs; then
    echo -e "${YELLOW}⚠️  DEVTOOLS NON AUTO-OUVERTS${NC}"
    echo "   → Déjà corrigé dans v17.2.1"
    echo ""
fi

echo "✅ VÉRIFICATIONS COMPLÈTES"
echo ""
echo "🚀 PROCHAINE ÉTAPE:"
echo "   1. Installer WebKitGTK (si manquant)"
echo "   2. Relancer: cargo tauri dev"
echo ""
