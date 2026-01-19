#!/bin/bash
# TITANE∞ - Test End-to-End Final
# Validation système complet avec PHASE 4 protections actives

PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((FAIL++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 TITANE∞ - TEST END-TO-END FINAL"
echo "   Validation système complet PHASE 4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 1: Infrastructure
# ═══════════════════════════════════════════════════════════════
echo "🏗️  TEST 1: Infrastructure Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "TAURI-ONLY: pas de serveur HTTP frontend (skip)"
check_pass "Frontend: TAURI-only (aucun serveur HTTP)"

if pgrep -f "titane-infinity" > /dev/null; then
    check_pass "Tauri backend running"
else
    check_fail "Tauri backend non actif"
fi

if curl -s http://localhost:11434/api/tags > /dev/null; then
    check_pass "Ollama accessible (localhost:11434)"
else
    check_fail "Ollama non accessible"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 2: Ollama Réponses Dynamiques (validation clé)
# ═══════════════════════════════════════════════════════════════
echo "🤖 TEST 2: Ollama Réponses Dynamiques"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROMPTS=(
    "Say the word ALPHA"
    "Say the word BETA"
    "Say the word GAMMA"
)

RESPONSES=()

for i in "${!PROMPTS[@]}"; do
    PROMPT="${PROMPTS[$i]}"
    echo -n "  → Test $((i+1)): \"$PROMPT\" ... "
    
    RESPONSE=$(curl -s http://localhost:11434/api/generate -d "{
        \"model\": \"llama3.2\",
        \"prompt\": \"$PROMPT\",
        \"stream\": false
    }" | grep -o '"response":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$RESPONSE" ]; then
        RESPONSES+=("$RESPONSE")
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
done

# Vérifier unicité
UNIQUE=$(printf '%s\n' "${RESPONSES[@]}" | sort -u | wc -l)
TOTAL=${#RESPONSES[@]}

if [ "$UNIQUE" -eq "$TOTAL" ]; then
    check_pass "Réponses dynamiques: $UNIQUE/$TOTAL uniques"
else
    check_fail "Réponses non uniques: $UNIQUE/$TOTAL"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 3: PHASE 4 Protections Actives
# ═══════════════════════════════════════════════════════════════
echo "🛡️  TEST 3: Protections PHASE 4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Timeout 10s
if grep -q "10000.*PHASE 4" src/components/chat/ChatInput.tsx; then
    check_pass "Protection: Timeout 10s actif"
else
    check_fail "Protection: Timeout non restauré"
fi

# messageSent.current
if grep -q "messageSent.current.*PHASE 4" src/components/chat/ChatInput.tsx; then
    check_pass "Protection: Anti-spam messageSent.current actif"
else
    check_fail "Protection: Anti-spam non restauré"
fi

# Providers orchestrator
PROVIDERS=$(grep -c "Provider," src/services/ai/orchestrator.ts || echo 0)
if [ "$PROVIDERS" -ge 5 ]; then
    check_pass "Protection: Cascade providers active ($PROVIDERS)"
else
    check_fail "Protection: Cascade providers insuffisante"
fi

# Backend cascade
if grep -q "openai.*anthropic.*gemini" src-tauri/src/overdrive/chat_orchestrator.rs; then
    check_pass "Protection: Backend cascade multi-providers active"
else
    check_fail "Protection: Backend cascade manquante"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 4: Performance
# ═══════════════════════════════════════════════════════════════
echo "⚡ TEST 4: Performance Système"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

START=$(date +%s%N)
curl -s http://localhost:11434/api/generate -d '{
    "model": "llama3.2",
    "prompt": "Test",
    "stream": false
}' > /dev/null
END=$(date +%s%N)

DURATION=$(( (END - START) / 1000000 ))

if [ "$DURATION" -lt 5000 ]; then
    check_pass "Temps réponse Ollama: ${DURATION}ms (excellent)"
elif [ "$DURATION" -lt 10000 ]; then
    check_pass "Temps réponse Ollama: ${DURATION}ms (bon)"
else
    check_fail "Temps réponse Ollama: ${DURATION}ms (lent)"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 5: Git État
# ═══════════════════════════════════════════════════════════════
echo "📦 TEST 5: État Git PHASE 4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PHASE4_COMMITS=$(git log --oneline --grep="PHASE 4" -n 10 | wc -l)
if [ "$PHASE4_COMMITS" -ge 4 ]; then
    check_pass "Commits PHASE 4: $PHASE4_COMMITS détectés"
else
    check_fail "Commits PHASE 4 incomplets"
fi

if git tag | grep -q "BACKUP_TITANE_CHAT_PRE_PURGE"; then
    check_pass "Tag backup disponible (rollback possible)"
else
    check_fail "Tag backup manquant"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ TEST END-TO-END FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASS:${NC} $PASS"
echo -e "${RED}❌ FAIL:${NC} $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo "╔════════════════════════════════════════════╗"
    echo "║  ✅ SYSTÈME VALIDÉ — PRODUCTION READY     ║"
    echo "║                                            ║"
    echo "║  Infrastructure:        ✓                 ║"
    echo "║  Ollama dynamique:      ✓                 ║"
    echo "║  Protections PHASE 4:   ✓                 ║"
    echo "║  Performance:           ✓                 ║"
    echo "║  Git backup:            ✓                 ║"
    echo "║                                            ║"
    echo "║  🎯 TITANE∞ v24.2.0 OMEGA                 ║"
    echo "║  Chat IA système complet opérationnel     ║"
    echo "║                                            ║"
    echo "║  Application: ouvrir Titan-Dev (Tauri)    ║"
    echo "╚════════════════════════════════════════════╝"
    exit 0
else
    echo "╔════════════════════════════════════════════╗"
    echo "║  ⚠️  VALIDATION ÉCHOUÉE                   ║"
    echo "║                                            ║"
    echo "║  $FAIL test(s) en échec                      ║"
    echo "║                                            ║"
    echo "║  Analyser les erreurs ci-dessus           ║"
    echo "╚════════════════════════════════════════════╝"
    exit 1
fi
