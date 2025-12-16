#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                                                                              ║
# ║   UNIFIED PRESENCE ENGINE v∞ - Script de Test Automatisé                    ║
# ║                                                                              ║
# ║   Ce script effectue une série de tests pour valider le moteur              ║
# ║                                                                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║  🌌 UNIFIED PRESENCE ENGINE v∞ - Tests de Validation                        ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=10

# Fonction de test
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((TESTS_FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 TEST 1 : Vérification des fichiers core"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FILES=(
    "src/engines/presence/unifiedPresenceEngine.ts"
    "src/engines/presence/narrativeProtocol.ts"
    "src/engines/presence/presenceIntegrations.ts"
    "src/hooks/useUnifiedPresence.ts"
    "src/components/presence/UnifiedPresenceControl.tsx"
    "src/components/presence/UnifiedPresenceControl.css"
)

ALL_FILES_EXIST=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file ${RED}(manquant)${NC}"
        ALL_FILES_EXIST=1
    fi
done

test_result $ALL_FILES_EXIST "Tous les fichiers core présents"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 TEST 2 : Vérification TypeScript"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run type-check > /tmp/ts-check.log 2>&1
TS_RESULT=$?

if [ $TS_RESULT -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Aucune erreur TypeScript détectée"
else
    echo -e "  ${RED}✗${NC} Erreurs TypeScript trouvées :"
    tail -20 /tmp/ts-check.log | sed 's/^/    /'
fi

test_result $TS_RESULT "Compilation TypeScript sans erreur"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST 3 : Statistiques des fichiers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file")
        echo "  📄 $(basename "$file"): ${BLUE}${LINES}${NC} lignes"
    fi
done

test_result 0 "Statistiques des fichiers affichées"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔗 TEST 4 : Vérification intégration App.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

APP_FILE="src/App.tsx"
INTEGRATION_CHECKS=(
    "import.*unifiedPresenceEngine"
    "import.*UnifiedPresenceControl"
    "unifiedPresenceEngine.start\(\)"
    "<UnifiedPresenceControl"
)

APP_INTEGRATION=0
for pattern in "${INTEGRATION_CHECKS[@]}"; do
    if grep -q "$pattern" "$APP_FILE"; then
        echo -e "  ${GREEN}✓${NC} Trouvé: $pattern"
    else
        echo -e "  ${RED}✗${NC} Manquant: $pattern"
        APP_INTEGRATION=1
    fi
done

test_result $APP_INTEGRATION "Intégration dans App.tsx"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎣 TEST 5 : Vérification export des hooks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HOOKS_FILE="src/hooks/index.ts"
HOOK_EXPORTS=(
    "useUnifiedPresence"
    "useNarrativeArc"
    "useVisualPresence"
    "useCognitivePresence"
    "useEmotionalPresence"
    "useSymbolicPresence"
    "useUserContextPresence"
    "useTonicProfile"
    "useTitaneIdentity"
)

HOOKS_EXPORT=0
for hook in "${HOOK_EXPORTS[@]}"; do
    if grep -q "$hook" "$HOOKS_FILE"; then
        echo -e "  ${GREEN}✓${NC} Export: $hook"
    else
        echo -e "  ${RED}✗${NC} Manquant: $hook"
        HOOKS_EXPORT=1
    fi
done

test_result $HOOKS_EXPORT "Tous les hooks exportés"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎨 TEST 6 : Vérification CSS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CSS_FILE="src/components/presence/UnifiedPresenceControl.css"
CSS_CLASSES=(
    "unified-presence-badge"
    "unified-presence-panel"
    "presence-tabs"
    "presence-progress-bar"
)

CSS_CHECK=0
for class in "${CSS_CLASSES[@]}"; do
    if grep -q "\.$class" "$CSS_FILE"; then
        echo -e "  ${GREEN}✓${NC} Classe: $class"
    else
        echo -e "  ${RED}✗${NC} Manquante: $class"
        CSS_CHECK=1
    fi
done

test_result $CSS_CHECK "Toutes les classes CSS présentes"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔮 TEST 7 : Vérification bibliothèque symbolique"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NARRATIVE_FILE="src/engines/presence/narrativeProtocol.ts"
SYMBOLS=(
    "triangle_infini"
    "reacteur"
    "ooda_loop"
    "lumiere"
    "ancre"
    "passage"
    "resonance"
)

SYMBOLS_CHECK=0
for symbol in "${SYMBOLS[@]}"; do
    if grep -q "$symbol:" "$NARRATIVE_FILE"; then
        echo -e "  ${GREEN}✓${NC} Symbole: $symbol"
    else
        echo -e "  ${RED}✗${NC} Manquant: $symbol"
        SYMBOLS_CHECK=1
    fi
done

test_result $SYMBOLS_CHECK "Tous les symboles TITANE∞ présents"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚙️  TEST 8 : Vérification profils toniques"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PRESENCE_FILE="src/engines/presence/unifiedPresenceEngine.ts"
PROFILES=(
    "deep_focus"
    "exploration"
    "maintenance"
    "deep_dialogue"
    "rest"
    "coaching"
)

PROFILES_CHECK=0
for profile in "${PROFILES[@]}"; do
    if grep -q "$profile:" "$PRESENCE_FILE"; then
        echo -e "  ${GREEN}✓${NC} Profil: $profile"
    else
        echo -e "  ${RED}✗${NC} Manquant: $profile"
        PROFILES_CHECK=1
    fi
done

test_result $PROFILES_CHECK "Tous les profils toniques présents"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔗 TEST 9 : Vérification intégrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INTEGRATIONS_FILE="src/engines/presence/presenceIntegrations.ts"
CONNECTORS=(
    "CognitivePresenceConnector"
    "HeliosPresenceConnector"
    "NexusPresenceConnector"
    "MemoryPresenceConnector"
)

INTEGRATIONS_CHECK=0
for connector in "${CONNECTORS[@]}"; do
    if grep -q "class $connector" "$INTEGRATIONS_FILE"; then
        echo -e "  ${GREEN}✓${NC} Connecteur: $connector"
    else
        echo -e "  ${RED}✗${NC} Manquant: $connector"
        INTEGRATIONS_CHECK=1
    fi
done

test_result $INTEGRATIONS_CHECK "Tous les connecteurs présents"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📚 TEST 10 : Vérification documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DOCS=(
    "UNIFIED_PRESENCE_ENGINE_v∞.md"
    "UNIFIED_PRESENCE_QUICK_START.md"
)

DOCS_CHECK=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        echo -e "  ${GREEN}✓${NC} $doc (${BLUE}${LINES}${NC} lignes)"
    else
        echo -e "  ${RED}✗${NC} $doc ${RED}(manquant)${NC}"
        DOCS_CHECK=1
    fi
done

test_result $DOCS_CHECK "Toute la documentation présente"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 RÉSULTATS FINAUX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PERCENTAGE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "  Tests réussis : ${GREEN}${TESTS_PASSED}${NC}/${TOTAL_TESTS}"
echo "  Tests échoués : ${RED}${TESTS_FAILED}${NC}/${TOTAL_TESTS}"
echo "  Taux de succès : ${BLUE}${PERCENTAGE}%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                        ║${NC}"
    echo -e "${GREEN}║  ✅ TOUS LES TESTS SONT PASSÉS !                                       ║${NC}"
    echo -e "${GREEN}║                                                                        ║${NC}"
    echo -e "${GREEN}║  Le moteur de présence unifiée est prêt pour utilisation.             ║${NC}"
    echo -e "${GREEN}║                                                                        ║${NC}"
    echo -e "${GREEN}║  Prochaine étape : npm run tauri:dev                                  ║${NC}"
    echo -e "${GREEN}║                                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                        ║${NC}"
    echo -e "${RED}║  ⚠️  CERTAINS TESTS ONT ÉCHOUÉ                                         ║${NC}"
    echo -e "${RED}║                                                                        ║${NC}"
    echo -e "${RED}║  Veuillez corriger les problèmes ci-dessus avant de continuer.        ║${NC}"
    echo -e "${RED}║                                                                        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
