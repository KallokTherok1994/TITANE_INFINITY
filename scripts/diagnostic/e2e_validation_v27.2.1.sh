#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — SUPER PROMPT — Section 6: E2E Validation Suite
#   Tests manuels et automatisés pour v27.2.1
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/runs/super_prompt_audit_v1/e2e_logs"

mkdir -p "$LOG_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v27.2.1 — E2E Validation Suite"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# ═══════════════════════════════════════════════════════════════════════════
#   TEST 1: Backend Gate Block (VITE_ENABLE_EXTERNAL_AI not set)
# ═══════════════════════════════════════════════════════════════════════════

test_backend_gate_block() {
    echo "──────────────────────────────────────────────────────────────"
    echo "TEST 1: Backend Gate Block"
    echo "──────────────────────────────────────────────────────────────"
    
    # Pre-condition: Remove VITE_ENABLE_EXTERNAL_AI
    unset VITE_ENABLE_EXTERNAL_AI
    
    echo "1. Vérifier .env (VITE_ENABLE_EXTERNAL_AI doit être absent)"
    if grep -q "^VITE_ENABLE_EXTERNAL_AI=1" "$PROJECT_ROOT/.env" 2>/dev/null; then
        fail "VITE_ENABLE_EXTERNAL_AI=1 trouvé dans .env (doit être commenté)"
        return 1
    fi
    pass ".env OK (flag absent ou commenté)"
    
    echo ""
    echo "2. Démarrer app en mode dev"
    warn "ACTION MANUELLE REQUISE:"
    echo "   $ cd $PROJECT_ROOT"
    echo "   $ pnpm run dev:tauri"
    echo ""
    read -p "App démarrée? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné (app non démarrée)"
        return 1
    fi
    
    echo ""
    echo "3. Envoyer message avec provider externe"
    warn "ACTION MANUELLE REQUISE:"
    echo "   1. Ouvrir TITANE∞"
    echo "   2. Aller dans une conversation"
    echo "   3. Sélectionner provider: Gemini (ou OpenAI/Claude)"
    echo "   4. Envoyer un message: 'Test backend gate'"
    echo ""
    read -p "Message envoyé? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "4. Vérifier logs backend"
    warn "Rechercher dans logs Tauri:"
    echo "   Pattern attendu: '🚫 BACKEND GATE BLOCKED'"
    echo ""
    read -p "Log trouvé? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Backend gate block confirmé"
        echo "blocked" > "$LOG_DIR/test1_result.txt"
    else
        fail "Backend gate NOT blocking (v27.2.1 regression?)"
        echo "not_blocked" > "$LOG_DIR/test1_result.txt"
        return 1
    fi
    
    echo ""
    echo "5. Vérifier response frontend"
    warn "Vérifier dans UI:"
    echo "   - Message affiché: 'Service externe bloqué...'"
    echo "   - Latency: <100ms (pas de timeout 20s)"
    echo ""
    read -p "Response OK? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Frontend response correcte"
    else
        fail "Frontend response incorrecte"
        return 1
    fi
    
    pass "TEST 1 PASSED: Backend gate block fonctionne"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
#   TEST 2: Backend Gate Allow (VITE_ENABLE_EXTERNAL_AI=1)
# ═══════════════════════════════════════════════════════════════════════════

test_backend_gate_allow() {
    echo ""
    echo "──────────────────────────────────────────────────────────────"
    echo "TEST 2: Backend Gate Allow"
    echo "──────────────────────────────────────────────────────────────"
    
    echo "1. Créer .env avec VITE_ENABLE_EXTERNAL_AI=1"
    warn "ACTION MANUELLE REQUISE:"
    echo "   $ echo 'VITE_ENABLE_EXTERNAL_AI=1' >> $PROJECT_ROOT/.env"
    echo "   $ echo 'GEMINI_API_KEY=<your_key>' >> $PROJECT_ROOT/.env"
    echo ""
    read -p ".env configuré? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "2. Rebuilder app (pour charger .env)"
    warn "ACTION MANUELLE REQUISE:"
    echo "   $ pnpm run dev:tauri  # Restart"
    echo ""
    read -p "App redémarrée? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "3. Envoyer message avec Gemini"
    warn "ACTION MANUELLE REQUISE:"
    echo "   1. Provider: Gemini"
    echo "   2. Message: 'Hello from v27.2.1 test'"
    echo "   3. Attendre réponse"
    echo ""
    read -p "Réponse reçue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Génération externe OK"
        echo "allowed" > "$LOG_DIR/test2_result.txt"
    else
        fail "Génération externe FAIL (vérifier clé API)"
        echo "failed" > "$LOG_DIR/test2_result.txt"
        return 1
    fi
    
    echo ""
    echo "4. Vérifier logs backend"
    warn "Vérifier ABSENCE de '🚫 BACKEND GATE BLOCKED'"
    echo ""
    read -p "Pas de gate block? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Backend gate allow correct"
    else
        fail "Backend gate blocking alors que flag=1"
        return 1
    fi
    
    pass "TEST 2 PASSED: Backend gate allow fonctionne"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
#   TEST 3: Ollama Cache Hit (<10s)
# ═══════════════════════════════════════════════════════════════════════════

test_ollama_cache_hit() {
    echo ""
    echo "──────────────────────────────────────────────────────────────"
    echo "TEST 3: Ollama Cache Hit"
    echo "──────────────────────────────────────────────────────────────"
    
    echo "1. Ouvrir DevTools Console"
    warn "ACTION MANUELLE REQUISE:"
    echo "   F12 → Console"
    echo ""
    read -p "DevTools ouvert? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "2. Appeler ai_check_ollama_status (2x en <10s)"
    warn "Dans Console:"
    echo "   window.__TAURI__.invoke('ai_check_ollama_status')"
    echo "   (attendre réponse)"
    echo "   window.__TAURI__.invoke('ai_check_ollama_status')  # 2ème fois"
    echo ""
    read -p "2 appels effectués? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "3. Vérifier logs Rust"
    warn "Pattern attendu (2ème call):"
    echo "   '[OLLAMA] Cache hit | age=<10s'"
    echo ""
    read -p "Cache hit log trouvé? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Ollama cache hit confirmé"
        echo "cache_hit" > "$LOG_DIR/test3_result.txt"
    else
        fail "Cache miss (v27.2.1 cache not working)"
        echo "cache_miss" > "$LOG_DIR/test3_result.txt"
        return 1
    fi
    
    echo ""
    echo "4. Vérifier latency"
    warn "2ème réponse doit être quasi-instantanée (<5ms)"
    echo ""
    read -p "Latency <5ms? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Latency OK (cache effective)"
    else
        warn "Latency élevée (cache peut-être raté)"
    fi
    
    pass "TEST 3 PASSED: Ollama cache fonctionne"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
#   TEST 4: Ollama Cache Expire (>10s)
# ═══════════════════════════════════════════════════════════════════════════

test_ollama_cache_expire() {
    echo ""
    echo "──────────────────────────────────────────────────────────────"
    echo "TEST 4: Ollama Cache Expire"
    echo "──────────────────────────────────────────────────────────────"
    
    echo "1. Appeler ai_check_ollama_status"
    warn "Dans Console:"
    echo "   window.__TAURI__.invoke('ai_check_ollama_status')"
    echo ""
    read -p "Appelé? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "2. Attendre 11 secondes"
    warn "Timer: 11s..."
    for i in {11..1}; do
        echo -ne "\r  ${i}s restant(es)..."
        sleep 1
    done
    echo -e "\r  ✓ 11s écoulées"
    
    echo ""
    echo "3. Re-appeler ai_check_ollama_status"
    warn "Dans Console:"
    echo "   window.__TAURI__.invoke('ai_check_ollama_status')"
    echo ""
    read -p "Appelé? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Test abandonné"
        return 1
    fi
    
    echo ""
    echo "4. Vérifier logs Rust"
    warn "Pattern attendu: PAS de 'Cache hit' (cache expiré)"
    echo "   Doit voir re-check HTTP"
    echo ""
    read -p "Cache expiré (re-check effectué)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pass "Cache TTL respecté (10s)"
        echo "cache_expired" > "$LOG_DIR/test4_result.txt"
    else
        fail "Cache NOT expired après 11s (TTL bug?)"
        echo "cache_not_expired" > "$LOG_DIR/test4_result.txt"
        return 1
    fi
    
    pass "TEST 4 PASSED: Cache TTL fonctionne"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
#   MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

main() {
    echo "Pre-requisites:"
    echo "  - Ollama running (si test 3-4)"
    echo "  - API keys configurées (si test 2)"
    echo "  - App rebuildable (pnpm run dev:tauri)"
    echo ""
    read -p "Pré-requis OK? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fail "Pré-requis non satisfaits"
        exit 1
    fi
    
    PASS_COUNT=0
    FAIL_COUNT=0
    
    # Run tests
    if test_backend_gate_block; then
        ((PASS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    
    if test_backend_gate_allow; then
        ((PASS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    
    if test_ollama_cache_hit; then
        ((PASS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    
    if test_ollama_cache_expire; then
        ((PASS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    
    # Summary
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  RÉSULTATS FINAUX"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "PASS: $PASS_COUNT / 4"
    echo "FAIL: $FAIL_COUNT / 4"
    echo ""
    
    if [ $FAIL_COUNT -eq 0 ]; then
        pass "TOUS LES TESTS PASSED ✅"
        echo "go" > "$LOG_DIR/verdict.txt"
        return 0
    else
        fail "CERTAINS TESTS FAILED ❌"
        echo "hold" > "$LOG_DIR/verdict.txt"
        return 1
    fi
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
