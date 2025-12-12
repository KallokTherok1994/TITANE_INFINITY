#!/bin/bash
# TITANE∞ - Script validation automatique PHASE 3
# Vérifie le noyau minimal avant tests manuels

# Note: Pas de set -e pour permettre la collecte de tous les tests

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TITANE∞ - VALIDATION AUTOMATIQUE PHASE 3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK 1: Ollama disponibilité
# ═══════════════════════════════════════════════════════════════
echo "📡 Vérification Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    check_pass "Ollama accessible sur localhost:11434"
    
    # Vérifier modèles (grep -c compte les lignes contenant "name")
    MODELS=$(curl -s http://localhost:11434/api/tags | grep -c '"name"' || echo "0")
    if [ "$MODELS" -gt 0 ]; then
        check_pass "Ollama: $MODELS modèle(s) disponible(s)"
    else
        check_fail "Ollama: Aucun modèle installé"
    fi
else
    check_fail "Ollama non accessible - Lancer: ollama serve"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK 2: Backup existe
# ═══════════════════════════════════════════════════════════════
echo "💾 Vérification backup..."
if git rev-parse --verify backup/chat-pre-cleanup > /dev/null 2>&1; then
    check_pass "Branche backup/chat-pre-cleanup existe"
else
    check_fail "Branche backup manquante"
fi

if git tag | grep -q "BACKUP_TITANE_CHAT_PRE_PURGE"; then
    check_pass "Tag BACKUP_TITANE_CHAT_PRE_PURGE existe"
else
    check_fail "Tag backup manquant"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK 3: Fichiers modifiés (TEMP CLEANUP)
# ═══════════════════════════════════════════════════════════════
echo "🔍 Vérification modifications TEMP CLEANUP..."

# ChatInput.tsx - messageSent.current retiré du disabled
if grep -q "disabled={!trimmedValue || isInputDisabled /\* TEMP CLEANUP" src/components/chat/ChatInput.tsx; then
    check_pass "ChatInput: messageSent.current retiré (TEMP)"
else
    check_warn "ChatInput: Modification TEMP non détectée"
fi

# chat_orchestrator.rs - Ollama seul
if grep -q "TEMP CLEANUP MODE" src-tauri/src/overdrive/chat_orchestrator.rs; then
    check_pass "Backend: Mode TEMP CLEANUP activé"
else
    check_warn "Backend: Mode TEMP non détecté"
fi

# orchestrator.ts - providers simplifiés
if grep -q "TEMP CLEANUP MODE: Simplified provider order" src/services/ai/orchestrator.ts; then
    check_pass "Orchestrator: Providers simplifiés (TEMP)"
else
    check_warn "Orchestrator: Modification TEMP non détectée"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK 4: Build compilation
# ═══════════════════════════════════════════════════════════════
echo "🔨 Vérification compilation..."

# React build
echo "  → Vérification build React..."
if npm run build > /tmp/titane-build.log 2>&1; then
    check_pass "Build React: Succès"
else
    check_fail "Build React: Échec (voir /tmp/titane-build.log)"
fi

# Rust check
echo "  → Vérification Rust..."
cd src-tauri
if cargo check > /tmp/titane-cargo.log 2>&1; then
    check_pass "Cargo check: Succès"
else
    check_fail "Cargo check: Échec (voir /tmp/titane-cargo.log)"
fi
cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK 5: Fichiers critiques existent
# ═══════════════════════════════════════════════════════════════
echo "📂 Vérification fichiers critiques..."

CRITICAL_FILES=(
    "src/hooks/useChat.ts"
    "src/components/chat/ChatInput.tsx"
    "src/ui/pages/Chat.tsx"
    "src/services/ai/orchestrator.ts"
    "src-tauri/src/overdrive/chat_orchestrator.rs"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Fichier existe: $file"
    else
        check_fail "Fichier manquant: $file"
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ VALIDATION AUTOMATIQUE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASS${NC}: $PASS"
echo -e "${RED}❌ FAIL${NC}: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ TOUS LES PRE-CHECKS SONT VALIDES      ║${NC}"
    echo -e "${GREEN}║                                            ║${NC}"
    echo -e "${GREEN}║  Prêt pour tests manuels PHASE 3          ║${NC}"
    echo -e "${GREEN}║  Lancer: npm run dev:tauri                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📋 Guide complet: TEST_PHASE3_VALIDATION.md"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ ÉCHECS DÉTECTÉS                        ║${NC}"
    echo -e "${RED}║                                            ║${NC}"
    echo -e "${RED}║  Corriger les erreurs avant de continuer  ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    exit 1
fi
