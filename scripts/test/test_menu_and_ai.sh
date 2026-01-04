#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  TITANE∞ v∞ — Script de Test Automatique
#  Menu Editor + AI Providers + Chat Integration
# ═══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════"
echo "  🧪 TITANE∞ - TESTS MENU EDITOR & AI PROVIDERS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Gestionnaire de paquets: pnpm-only (corepack préféré)
PNPM=()
resolve_pnpm_cmd() {
  if command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1; then
    PNPM=(corepack pnpm)
    return 0
  fi
  if command -v pnpm >/dev/null 2>&1; then
    PNPM=(pnpm)
    return 0
  fi
  return 1
}

# Helper functions
pass_test() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((TESTS_PASSED++))
  ((TESTS_RUN++))
}

fail_test() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  echo -e "   ${RED}Error:${NC} $2"
  ((TESTS_FAILED++))
  ((TESTS_RUN++))
}

info() {
  echo -e "${BLUE}ℹ️${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

# ═══════════════════════════════════════════════════════════════
# TEST 1: Vérification des fichiers créés
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Vérification des fichiers créés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES=(
  "src/features/menu-editor/MenuEditor.tsx"
  "src/features/governance-center/components/AIProvidersTester.tsx"
  "src/features/chat/ChatProviderSelector.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    pass_test "Fichier existe: $file ($lines lignes)"
  else
    fail_test "Fichier manquant: $file" "Fichier introuvable"
  fi
done

# ═══════════════════════════════════════════════════════════════
# TEST 2: Vérification des modifications
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: Vérification des modifications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Menu.tsx modifications
if grep -q "MenuEditor" "src/ui/Menu.tsx"; then
  pass_test "Menu.tsx: Import MenuEditor présent"
else
  fail_test "Menu.tsx: Import MenuEditor manquant" "MenuEditor non importé"
fi

if grep -q "isEditing" "src/ui/Menu.tsx"; then
  pass_test "Menu.tsx: State isEditing présent"
else
  fail_test "Menu.tsx: State isEditing manquant" "State non défini"
fi

if grep -q "Edit3" "src/ui/Menu.tsx"; then
  pass_test "Menu.tsx: Icône Edit3 importée"
else
  fail_test "Menu.tsx: Icône Edit3 manquante" "Import lucide-react incomplet"
fi

# Check GovernanceCenter.tsx modifications
if grep -q "AIProvidersTester" "src/features/governance-center/GovernanceCenter.tsx"; then
  pass_test "GovernanceCenter.tsx: Import AIProvidersTester présent"
else
  fail_test "GovernanceCenter.tsx: Import AIProvidersTester manquant" "Composant non importé"
fi

if grep -q "showTester" "src/features/governance-center/GovernanceCenter.tsx"; then
  pass_test "GovernanceCenter.tsx: State showTester présent"
else
  fail_test "GovernanceCenter.tsx: State showTester manquant" "State non défini"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 3: Vérification compilation TypeScript
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Compilation TypeScript"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

info "Compilation en cours..."
if ! resolve_pnpm_cmd; then
  warn "pnpm non détecté - check TypeScript ignoré"
elif "${PNPM[@]}" exec tsc --noEmit 2>&1 | grep -q "error TS"; then
  # Count errors related to our new files
  NEW_FILES_ERRORS=$("${PNPM[@]}" exec tsc --noEmit 2>&1 | grep -E "(MenuEditor|AIProvidersTester|ChatProviderSelector)" | wc -l)
  
  if [ "$NEW_FILES_ERRORS" -eq 0 ]; then
    pass_test "Aucune erreur TypeScript dans les nouveaux fichiers"
  else
    fail_test "Erreurs TypeScript détectées" "$NEW_FILES_ERRORS erreur(s) dans les nouveaux fichiers"
  fi
else
  pass_test "Compilation TypeScript réussie (aucune erreur)"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 4: Vérification Ollama (si disponible)
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Vérification Ollama"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v ollama &> /dev/null; then
  pass_test "Ollama installé"
  
  # Check if Ollama is running
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    pass_test "Ollama serveur actif (localhost:11434)"
    
    # Count models
    MODEL_COUNT=$(ollama list 2>/dev/null | tail -n +2 | wc -l)
    if [ "$MODEL_COUNT" -gt 0 ]; then
      pass_test "Ollama: $MODEL_COUNT modèle(s) installé(s)"
    else
      warn "Aucun modèle Ollama installé"
    fi
  else
    warn "Ollama installé mais serveur non actif (démarrer: ollama serve)"
  fi
else
  warn "Ollama non installé (optionnel pour le provider local)"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 5: Structure des composants
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Structure des composants"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# MenuEditor
if grep -q "interface MenuSection" "src/features/menu-editor/MenuEditor.tsx"; then
  pass_test "MenuEditor: Interface MenuSection définie"
fi

if grep -q "handleDragStart" "src/features/menu-editor/MenuEditor.tsx"; then
  pass_test "MenuEditor: Fonction drag & drop présente"
fi

if grep -q "moveUp\|moveDown" "src/features/menu-editor/MenuEditor.tsx"; then
  pass_test "MenuEditor: Fonctions de déplacement présentes"
fi

if grep -q "toggleVisibility" "src/features/menu-editor/MenuEditor.tsx"; then
  pass_test "MenuEditor: Toggle visibilité implémenté"
fi

# AIProvidersTester
if grep -q "interface ProviderTest" "src/features/governance-center/components/AIProvidersTester.tsx"; then
  pass_test "AIProvidersTester: Interface ProviderTest définie"
fi

if grep -q "testProvider" "src/features/governance-center/components/AIProvidersTester.tsx"; then
  pass_test "AIProvidersTester: Fonction de test présente"
fi

if grep -q "performance.now" "src/features/governance-center/components/AIProvidersTester.tsx"; then
  pass_test "AIProvidersTester: Mesure de performance implémentée"
fi

# ChatProviderSelector
if grep -q "ChatProviderSelectorProps" "src/features/chat/ChatProviderSelector.tsx"; then
  pass_test "ChatProviderSelector: Interface Props définie"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 6: Imports et dépendances
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 6: Imports et dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check lucide-react imports
LUCIDE_COMPONENTS=(
  "GripVertical"
  "Plus"
  "Edit2"
  "Trash2"
  "Save"
  "Eye"
  "EyeOff"
  "Play"
  "CheckCircle"
  "XCircle"
  "Clock"
  "Zap"
  "TestTube"
  "Bot"
  "Sparkles"
)

MISSING_IMPORTS=0
for component in "${LUCIDE_COMPONENTS[@]}"; do
  if ! grep -rq "import.*$component.*from.*lucide-react" src/features/menu-editor/ src/features/governance-center/ src/features/chat/ 2>/dev/null; then
    ((MISSING_IMPORTS++))
  fi
done

if [ "$MISSING_IMPORTS" -eq 0 ]; then
  pass_test "Tous les imports lucide-react présents"
else
  warn "$MISSING_IMPORTS import(s) lucide-react potentiellement manquant(s)"
fi

# ═══════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📊 RÉSUMÉ DES TESTS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "  Tests exécutés:  ${BLUE}$TESTS_RUN${NC}"
echo -e "  Tests réussis:   ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Tests échoués:   ${RED}$TESTS_FAILED${NC}"
echo ""

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TESTS_RUN)*100}")
echo -e "  Taux de succès:  ${GREEN}${SUCCESS_RATE}%${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ TOUS LES TESTS SONT PASSÉS${NC}"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🚀 PROCHAINES ÉTAPES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1. Lancer le serveur de développement:"
  echo "   ${BLUE}pnpm run dev${NC}"
  echo ""
  echo "2. Tester Menu Editor:"
  echo "   - Ouvrir l'application"
  echo "   - Cliquer sur le bouton bleu ✏️ dans le menu"
  echo "   - Glisser-déposer des sections"
  echo "   - Sauvegarder et recharger la page"
  echo ""
  echo "3. Tester AI Providers:"
  echo "   - Aller dans Governance Center (/governance-center)"
  echo "   - Configurer au moins 1 clé API"
  echo "   - Cliquer 'Tester les providers'"
  echo "   - Vérifier les métriques"
  echo ""
  exit 0
else
  echo -e "${RED}❌ CERTAINS TESTS ONT ÉCHOUÉ${NC}"
  echo ""
  echo "Vérifiez les erreurs ci-dessus et corrigez-les avant de continuer."
  echo ""
  exit 1
fi
