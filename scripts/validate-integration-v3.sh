#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
#   TITANE∞ v∞ — VALIDATION SCRIPT
#   Vérifie que toutes les nouvelles features sont opérationnelles
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🔍 TITANE∞ - Validation des Nouvelles Features v∞.3"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Fonction de vérification
check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

echo "📦 Vérification des fichiers créés..."
echo "─────────────────────────────────────────────────────────────"

# Fichiers principaux
[ -f "src/features/dashboard/DashboardEditor.tsx" ] && RES=0 || RES=1
check $RES "DashboardEditor.tsx existe"

[ -f "src/hooks/useAudioChat.tsx" ] && RES=0 || RES=1
check $RES "useAudioChat.tsx existe"

[ -f "src/components/chat/ChatBubble-ArcReactor.css" ] && RES=0 || RES=1
check $RES "ChatBubble-ArcReactor.css existe"

[ -f "src/types/web-speech-api.d.ts" ] && RES=0 || RES=1
check $RES "web-speech-api.d.ts existe"

[ -f "src/components/audio/ListeningIndicator.tsx" ] && RES=0 || RES=1
check $RES "ListeningIndicator.tsx existe"

echo ""
echo "📝 Vérification de la documentation..."
echo "─────────────────────────────────────────────────────────────"

[ -f "INTEGRATION_COMPLETE_FINAL_REPORT_v∞.3.md" ] && RES=0 || RES=1
check $RES "Rapport d'intégration existe"

[ -f "AUDIT_FINAL_COMPLET_v∞.3.md" ] && RES=0 || RES=1
check $RES "Rapport d'audit existe"

[ -f "QUICK_START_v∞.3.md" ] && RES=0 || RES=1
check $RES "Guide de démarrage existe"

echo ""
echo "🔧 Vérification TypeScript..."
echo "─────────────────────────────────────────────────────────────"

# Vérifier les erreurs TypeScript dans nos fichiers
if command -v corepack >/dev/null 2>&1; then
    ERRORS=$(corepack pnpm exec tsc --noEmit 2>&1 | grep -E "(useAudioChat|DashboardEditor|ChatProviderSelector|ListeningIndicator)" | wc -l)
elif command -v pnpm >/dev/null 2>&1; then
    ERRORS=$(pnpm exec tsc --noEmit 2>&1 | grep -E "(useAudioChat|DashboardEditor|ChatProviderSelector|ListeningIndicator)" | wc -l)
else
    echo "❌ pnpm requis (corepack/pnpm introuvable)." >&2
    exit 1
fi
[ "$ERRORS" -eq 0 ] && RES=0 || RES=1
check $RES "Aucune erreur TypeScript dans les nouveaux fichiers ($ERRORS erreurs)"

echo ""
echo "📊 Vérification des imports..."
echo "─────────────────────────────────────────────────────────────"

# Vérifier que ChatProviderSelector est bien importé
CHAT_INPUT_IMPORT=$(grep -c "ChatProviderSelector" src/features/chat/ChatInput.tsx || echo "0")
[ "$CHAT_INPUT_IMPORT" -gt 0 ] && RES=0 || RES=1
check $RES "ChatProviderSelector importé dans ChatInput"

CHAT_BUBBLE_IMPORT=$(grep -c "ChatProviderSelector" src/components/chat/ChatBubble.tsx || echo "0")
[ "$CHAT_BUBBLE_IMPORT" -gt 0 ] && RES=0 || RES=1
check $RES "ChatProviderSelector importé dans ChatBubble"

# Vérifier useAudioChat
AUDIO_IMPORT=$(grep -c "useAudioChat" src/components/chat/ChatBubble.tsx || echo "0")
[ "$AUDIO_IMPORT" -gt 0 ] && RES=0 || RES=1
check $RES "useAudioChat importé dans ChatBubble"

# Vérifier ListeningIndicator
INDICATOR_IMPORT=$(grep -c "ListeningIndicator" src/components/chat/ChatBubble.tsx || echo "0")
[ "$INDICATOR_IMPORT" -gt 0 ] && RES=0 || RES=1
check $RES "ListeningIndicator importé dans ChatBubble"

echo ""
echo "🎨 Vérification du CSS Arc Reactor..."
echo "─────────────────────────────────────────────────────────────"

# Vérifier que le nouveau CSS est importé
ARC_REACTOR_CSS=$(grep -c "ChatBubble-ArcReactor.css" src/components/chat/ChatBubble.tsx || echo "0")
[ "$ARC_REACTOR_CSS" -gt 0 ] && RES=0 || RES=1
check $RES "ChatBubble-ArcReactor.css importé"

# Vérifier que l'ancien CSS est supprimé
OLD_CSS=$([ -f "src/components/chat/ChatBubble.css" ] && echo "1" || echo "0")
[ "$OLD_CSS" -eq 0 ] && RES=0 || RES=1
check $RES "Ancien ChatBubble.css supprimé"

# Vérifier les animations
ANIMATIONS=$(grep -c "@keyframes arc-reactor" src/components/chat/ChatBubble-ArcReactor.css || echo "0")
[ "$ANIMATIONS" -gt 0 ] && RES=0 || RES=1
check $RES "Animations Arc Reactor présentes"

echo ""
echo "🔍 Vérification de l'intégration..."
echo "─────────────────────────────────────────────────────────────"

# Vérifier que DashboardEditor est intégré dans DashboardPage
DASHBOARD_INTEGRATION=$(grep -c "DashboardEditor" src/pages/DashboardPage.tsx || echo "0")
[ "$DASHBOARD_INTEGRATION" -gt 0 ] && RES=0 || RES=1
check $RES "DashboardEditor intégré dans DashboardPage"

# Vérifier les providers dans ChatInput
PROVIDERS_ARRAY=$(grep -c "providers = \[" src/features/chat/ChatInput.tsx || echo "0")
[ "$PROVIDERS_ARRAY" -gt 0 ] && RES=0 || RES=1
check $RES "Array de providers configuré dans ChatInput"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  📊 RÉSULTATS DE LA VALIDATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "Total de vérifications: ${YELLOW}$TOTAL_CHECKS${NC}"
echo -e "Réussies:               ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Échouées:               ${RED}$FAILED_CHECKS${NC}"
echo ""

# Calcul du pourcentage
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}✅ 100% - Toutes les vérifications sont passées !${NC}"
    echo -e "${GREEN}🚀 Le système est prêt pour le déploiement !${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $PERCENTAGE% - $FAILED_CHECKS vérification(s) échouée(s)${NC}"
    echo -e "${YELLOW}⚠️  Veuillez corriger les erreurs avant de déployer${NC}"
    exit 1
fi
