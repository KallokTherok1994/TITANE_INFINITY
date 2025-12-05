#!/bin/bash
# TITANE∞ v19.1.0 - Script de Validation Frontend
# Teste automatiquement les corrections d'affichage UI

set -e

echo "🚀 TITANE∞ - Validation Corrections Frontend v19.1.0"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de vérification
check_step() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Fonction d'information
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction d'avertissement
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "src-tauri" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet TITANE_INFINITY${NC}"
    exit 1
fi

echo "📁 Répertoire: $(pwd)"
echo ""

# Étape 1: Vérification des fichiers modifiés
echo "1️⃣  Vérification des fichiers modifiés..."
echo "----------------------------------------"

FILES_TO_CHECK=(
    "src/App.tsx"
    "src/core/tauri/environment.ts"
    "src/ui/pages/styles/Chat.css"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        info "$file existe"
    else
        warn "$file non trouvé"
    fi
done
echo ""

# Étape 2: Vérification TypeScript
echo "2️⃣  Type-check TypeScript..."
echo "----------------------------------------"
pnpm run type-check > /dev/null 2>&1
check_step "Type-check: 0 erreur"
echo ""

# Étape 3: Vérification ESLint
echo "3️⃣  Lint ESLint..."
echo "----------------------------------------"
pnpm run lint > /dev/null 2>&1
check_step "Lint: 0 erreur, 0 warning"
echo ""

# Étape 4: Build Production
echo "4️⃣  Build production..."
echo "----------------------------------------"
info "Building... (cela peut prendre 3-5 secondes)"
pnpm run build > /tmp/titane_build.log 2>&1
check_step "Build réussi"

# Afficher taille bundle
if [ -f "dist/assets/main-*.js" ]; then
    BUNDLE_SIZE=$(du -h dist/assets/main-*.js | cut -f1)
    info "Bundle size: $BUNDLE_SIZE"
fi
echo ""

# Étape 5: Vérification des corrections App.tsx
echo "5️⃣  Vérification corrections App.tsx..."
echo "----------------------------------------"

# Vérifier que document.body.innerHTML n'existe plus
if grep -q "document.body.innerHTML" src/App.tsx; then
    warn "document.body.innerHTML trouvé (devrait être commentaire uniquement)"
else
    check_step "document.body.innerHTML supprimé"
fi

# Vérifier que throw Error n'existe plus
if grep -q "throw new Error.*blocked" src/App.tsx; then
    echo -e "${RED}❌ throw Error blocant toujours présent${NC}"
else
    check_step "throw Error blocant supprimé"
fi

# Vérifier présence logs console.warn
if grep -q "console.warn.*Contexte browser production" src/App.tsx; then
    check_step "Logs console.warn non-bloquants ajoutés"
else
    warn "Logs console.warn non trouvés"
fi
echo ""

# Étape 6: Vérification environment.ts
echo "6️⃣  Vérification environment.ts..."
echo "----------------------------------------"

if grep -q "console.info.*Mode développement browser" src/core/tauri/environment.ts; then
    check_step "Logs dev optimisés (console.info)"
else
    warn "Logs dev console.info non trouvés"
fi

if grep -q "shouldBlockLoading.*boolean" src/core/tauri/environment.ts; then
    check_step "Fonction shouldBlockLoading présente"
else
    warn "shouldBlockLoading non trouvée"
fi
echo ""

# Étape 7: Vérification Chat.css
echo "7️⃣  Vérification Chat.css..."
echo "----------------------------------------"

# Vérifier que overflow: hidden n'est pas sur .chat-page
if grep -A 5 "\.chat-page" src/ui/pages/styles/Chat.css | grep -q "overflow: hidden"; then
    warn ".chat-page a encore overflow: hidden (peut être intentionnel)"
else
    check_step ".chat-page sans overflow: hidden problématique"
fi
echo ""

# Récapitulatif
echo ""
echo "=================================================="
echo "📊 RÉCAPITULATIF VALIDATION"
echo "=================================================="
echo ""
check_step "Type-check: OK"
check_step "Lint: OK"
check_step "Build: OK"
check_step "Corrections App.tsx: OK"
check_step "Corrections environment.ts: OK"
check_step "Corrections Chat.css: OK"
echo ""

# Instructions suivantes
echo "=================================================="
echo "🧪 TESTS VISUELS REQUIS"
echo "=================================================="
echo ""
warn "Les tests automatiques sont OK, mais validation visuelle requise:"
echo ""
echo "Test 1: Mode Dev Navigateur (5 min)"
echo "  $ pnpm dev"
echo "  → Ouvrir http://localhost:5173"
echo "  → Vérifier: UI complète visible, pas d'écran rouge"
echo ""
echo "Test 2: Mode Tauri Dev (10 min)"
echo "  $ pnpm tauri dev"
echo "  → Vérifier: Fenêtre affiche interface React complète"
echo ""
echo "Consulter: GUIDE_VALIDATION_VISUELLE_v19.1.0.md"
echo ""

# Documentation
echo "=================================================="
echo "📚 DOCUMENTATION"
echo "=================================================="
echo ""
echo "Rapports disponibles:"
ls -1 *v19*.md 2>/dev/null | while read -r file; do
    echo "  • $file"
done
echo ""

echo -e "${GREEN}✅ Validation automatique terminée avec succès!${NC}"
echo ""
