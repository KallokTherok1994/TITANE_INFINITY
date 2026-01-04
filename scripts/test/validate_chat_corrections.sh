#!/bin/bash
# TITANE∞ v24.2.1 - Chat IA Corrections Validation
# Script de validation des corrections complètes

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ v24.2.1 — Chat IA Corrections Validation          ║"
echo "║   Vérification complète des améliorations logging            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

check_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((TOTAL_CHECKS++))
}

echo -e "${BLUE}🔍 Phase 1: Vérification TypeScript${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v corepack >/dev/null 2>&1; then
    TSC_CMD=(corepack pnpm exec tsc)
elif command -v pnpm >/dev/null 2>&1; then
    TSC_CMD=(pnpm exec tsc)
else
    check_failed "pnpm requis (corepack/pnpm introuvable)"
    exit 1
fi

if "${TSC_CMD[@]}" --noEmit 2>&1 | grep -q "error TS"; then
    check_failed "TypeScript compilation (erreurs détectées)"
    "${TSC_CMD[@]}" --noEmit 2>&1 | grep "error TS" | head -5
else
    check_passed "TypeScript compilation (0 errors)"
fi

echo ""
echo -e "${BLUE}🔍 Phase 2: Vérification console.log dans Chat${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Liste des fichiers du Chat IA
CHAT_FILES=(
    "src/ui/pages/Chat.tsx"
    "src/hooks/useChat.ts"
    "src/components/chat/ChatInput.tsx"
    "src/components/chat/MessageList.tsx"
    "src/components/chat/MessageListOptimized.tsx"
    "src/components/chat/MessageListSimple.tsx"
    "src/components/chat/FileUploadButton.tsx"
    "src/components/chat/MemoryViewer.tsx"
    "src/components/chat/ChatFileImport.tsx"
    "src/services/ai/chatEngine_OMNIS_v1.ts"
    "src/services/ai/orchestrator_OMNIS_v1.ts"
)

CONSOLE_COUNT=0
for file in "${CHAT_FILES[@]}"; do
    if [ -f "$file" ]; then
        count=$(grep -E "^\s*console\.(log|warn|error)\(" "$file" 2>/dev/null | wc -l)
        CONSOLE_COUNT=$((CONSOLE_COUNT + count))
        if [ $count -gt 0 ]; then
            check_warning "$file: $count console.log trouvés"
        fi
    fi
done

if [ $CONSOLE_COUNT -eq 0 ]; then
    check_passed "Aucun console.log direct dans les fichiers Chat"
else
    check_failed "$CONSOLE_COUNT console.log directs restants dans Chat"
fi

echo ""
echo -e "${BLUE}🔍 Phase 3: Vérification chatLogger imports${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGGER_COUNT=0
for file in "${CHAT_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "import.*chatLogger" "$file" 2>/dev/null; then
            ((LOGGER_COUNT++))
        fi
    fi
done

if [ $LOGGER_COUNT -ge 8 ]; then
    check_passed "chatLogger importé dans $LOGGER_COUNT fichiers"
else
    check_warning "chatLogger importé dans seulement $LOGGER_COUNT fichiers"
fi

echo ""
echo -e "${BLUE}🔍 Phase 4: Vérification usage chatLogger${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CHATLOGGER_USAGE=0
for file in "${CHAT_FILES[@]}"; do
    if [ -f "$file" ]; then
        count=$(grep -E "chatLogger\.(debug|info|warn|error|success)" "$file" 2>/dev/null | wc -l)
        CHATLOGGER_USAGE=$((CHATLOGGER_USAGE + count))
    fi
done

if [ $CHATLOGGER_USAGE -ge 50 ]; then
    check_passed "chatLogger utilisé $CHATLOGGER_USAGE fois"
else
    check_warning "chatLogger utilisé seulement $CHATLOGGER_USAGE fois"
fi

echo ""
echo -e "${BLUE}🔍 Phase 5: Vérification fichier chatLogger${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/utils/chatLogger.ts" ]; then
    check_passed "Fichier chatLogger.ts existe"
    
    # Vérifier les méthodes essentielles
    if grep -q "export const chatLogger" "src/utils/chatLogger.ts"; then
        check_passed "Export chatLogger trouvé"
    else
        check_failed "Export chatLogger manquant"
    fi
    
    if grep -q "\.debug.*=>" "src/utils/chatLogger.ts"; then
        check_passed "Méthode debug() présente"
    else
        check_failed "Méthode debug() manquante"
    fi
    
    if grep -q "\.error.*=>" "src/utils/chatLogger.ts"; then
        check_passed "Méthode error() présente"
    else
        check_failed "Méthode error() manquante"
    fi
else
    check_failed "Fichier chatLogger.ts manquant"
fi

echo ""
echo -e "${BLUE}🔍 Phase 6: Vérification production safety${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "isDebugEnabled()" "src/utils/chatLogger.ts" 2>/dev/null; then
    check_passed "Protection debug mode activée"
else
    check_warning "Protection debug mode non trouvée"
fi

if grep -q "localStorage.getItem('titane_debug_chat')" "src/utils/chatLogger.ts" 2>/dev/null; then
    check_passed "Contrôle localStorage présent"
else
    check_warning "Contrôle localStorage non trouvé"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    RÉSULTATS FINAUX                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Total checks:    $TOTAL_CHECKS"
echo -e "${GREEN}Passed:          $PASSED_CHECKS${NC}"
echo -e "${RED}Failed:          $FAILED_CHECKS${NC}"
echo ""

# Score de qualité
SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $SCORE -ge 95 ]; then
    echo -e "${GREEN}🏆 SCORE FINAL: $SCORE/100 (EXCELLENT)${NC}"
    echo "✅ Corrections Chat IA validées avec succès !"
elif [ $SCORE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  SCORE FINAL: $SCORE/100 (BON)${NC}"
    echo "Quelques améliorations recommandées"
else
    echo -e "${RED}❌ SCORE FINAL: $SCORE/100 (INSUFFISANT)${NC}"
    echo "Corrections requises"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Documentation: CORRECTIONS_CHAT_IA_COMPLETE_v24.2.1.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
