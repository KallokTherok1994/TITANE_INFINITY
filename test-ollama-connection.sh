#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ - Test de Connexion Ollama + Tauri
# ═══════════════════════════════════════════════════════════════════

set -uo pipefail

echo "🔍 TITANE∞ - Test de Connexion Ollama + Tauri"
echo "════════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3.1:latest"
PASS_COUNT=0
FAIL_COUNT=0

# Fonction de test
run_test() {
    local test_name="$1"
    local test_cmd="$2"
    
    echo -n "🧪 Test: ${test_name}... "
    
    if eval "${test_cmd}" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Test 1: Serveur Ollama actif
echo "📡 Phase 1: Vérification Serveur Ollama"
echo "────────────────────────────────────────────────────────────"
run_test "Serveur Ollama actif" "curl -sf ${OLLAMA_URL}/api/tags"

# Test 2: Modèle disponible
echo ""
echo "🦙 Phase 2: Vérification Modèles"
echo "────────────────────────────────────────────────────────────"
if curl -sf "${OLLAMA_URL}/api/tags" | grep -q "${OLLAMA_MODEL}"; then
    echo -e "🧪 Test: Modèle ${OLLAMA_MODEL} disponible... ${GREEN}✅ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "🧪 Test: Modèle ${OLLAMA_MODEL} disponible... ${YELLOW}⚠️  SKIP (utiliser un modèle disponible)${NC}"
fi

# Test 3: Génération simple
echo ""
echo "💬 Phase 3: Test de Génération"
echo "────────────────────────────────────────────────────────────"
echo -n "🧪 Test: Génération de texte... "
RESPONSE=$(curl -sf -X POST "${OLLAMA_URL}/api/generate" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"${OLLAMA_MODEL}\", \"prompt\": \"Hello\", \"stream\": false}" \
    | jq -r '.response' 2>/dev/null)

if [ -n "$RESPONSE" ] && [ "$RESPONSE" != "null" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   📝 Réponse: ${RESPONSE:0:60}..."
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAIL_COUNT++))
fi

# Test 4: Configuration .env.local
echo ""
echo "⚙️  Phase 4: Configuration TITANE∞"
echo "────────────────────────────────────────────────────────────"
run_test "Fichier .env.local existe" "test -f .env.local"
run_test "Variable OLLAMA_BASE_URL configurée" "grep -q 'OLLAMA_BASE_URL' .env.local"
run_test "Variable TITANE_OLLAMA_MODEL configurée" "grep -q 'TITANE_OLLAMA_MODEL' .env.local"

# Test 5: Configuration Vite Proxy
echo ""
echo "🔧 Phase 5: Configuration Vite Proxy"
echo "────────────────────────────────────────────────────────────"
run_test "Proxy Ollama configuré dans vite.config.ts" "grep -q '/api/ollama' vite.config.ts"

# Test 6: Commandes Tauri
echo ""
echo "🦀 Phase 6: Commandes Tauri Rust"
echo "────────────────────────────────────────────────────────────"
run_test "Module ollama.rs existe" "test -f src-tauri/src/ollama.rs"
run_test "Commande conversation_generate enregistrée" "grep -q 'conversation_generate' src-tauri/src/main.rs"
run_test "Build Rust compile" "cargo check --manifest-path src-tauri/Cargo.toml --quiet"

# Résumé
echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ DES TESTS"
echo "════════════════════════════════════════════════════════════"
echo -e "✅ Tests réussis: ${GREEN}${PASS_COUNT}${NC}"
echo -e "❌ Tests échoués: ${RED}${FAIL_COUNT}${NC}"
echo ""

if [ ${FAIL_COUNT} -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS!${NC}"
    echo ""
    echo "✨ Configuration Ollama + Tauri opérationnelle"
    echo ""
    echo "🚀 Pour démarrer TITANE∞ en mode développement:"
    echo "   pnpm run dev:tauri"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo ""
    echo "🔧 Actions recommandées:"
    [ ! -f .env.local ] && echo "   • Créer le fichier .env.local (voir .env.ollama.example)"
    ! curl -sf "${OLLAMA_URL}/api/tags" >/dev/null 2>&1 && echo "   • Démarrer Ollama: ollama serve"
    echo ""
    exit 1
fi
