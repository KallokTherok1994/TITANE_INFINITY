#!/bin/bash

# TITANE∞ v26.4.1 - Script de Test Chat IA avec Capture Logs
# Usage: ./test_chat_ia.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/runtime/test-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/chat-ia-test_$TIMESTAMP.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║        🧪 TITANE∞ v26.4.1 — TEST CHAT IA COMPLET 🧪         ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Créer dossier logs
mkdir -p "$LOG_DIR"

echo -e "${YELLOW}📁 Dossier logs: $LOG_DIR${NC}"
echo -e "${YELLOW}📄 Fichier log: $LOG_FILE${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifications Pré-requis
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}━━━ ÉTAPE 1/6: Vérifications Pré-requis ━━━${NC}"

# 1.1 Vérifier Ollama
echo -n "🔍 Ollama service... "
if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Actif${NC}"
else
    echo -e "${RED}❌ Non actif${NC}"
    echo -e "${RED}   → Démarrer: ollama serve${NC}"
    exit 1
fi

# 1.2 Vérifier modèle llama3.1
echo -n "🔍 Modèle llama3.1... "
if curl -s http://127.0.0.1:11434/api/tags | grep -q "llama3.1"; then
    echo -e "${GREEN}✅ Installé${NC}"
else
    echo -e "${RED}❌ Non trouvé${NC}"
    echo -e "${RED}   → Installer: ollama pull llama3.1${NC}"
    exit 1
fi

# 1.3 Vérifier Node modules
echo -n "🔍 Node modules... "
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${GREEN}✅ Présents${NC}"
else
    echo -e "${YELLOW}⚠️  Absents${NC}"
    echo -e "${YELLOW}   → Installer: pnpm install${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2: Compilation
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}━━━ ÉTAPE 2/6: Compilation ━━━${NC}"

# 2.1 TypeScript
echo -n "🔧 TypeScript check... "
if pnpm exec tsc --noEmit 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Erreurs TypeScript${NC}"
    pnpm exec tsc --noEmit
    exit 1
else
    echo -e "${GREEN}✅ OK${NC}"
fi

# 2.2 Rust
echo -n "🔧 Rust check... "
cd "$PROJECT_ROOT"
if cargo check --manifest-path=src-tauri/Cargo.toml --quiet 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Erreurs Rust${NC}"
    cargo check --manifest-path=src-tauri/Cargo.toml
    exit 1
else
    echo -e "${GREEN}✅ OK${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3: Configuration Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}━━━ ÉTAPE 3/6: Configuration Test ━━━${NC}"

cat > "$LOG_DIR/test-config.json" << EOF
{
  "test_id": "$TIMESTAMP",
  "test_type": "chat-ia-debug",
  "version": "v26.4.1",
  "phase": 2,
  "ollama_model": "llama3.1",
  "test_message": "Bonjour, test debug phase 2",
  "expected_logs": [
    "[conversationEngine] 📤 Sending to backend",
    "[conversation_process_message] 📨 Request",
    "[AI Router] Routing to Ollama",
    "[conversation_process_message] ✅ Success",
    "[conversationEngine] 📥 Backend response",
    "[useConversationEngine] 📝 Assistant message créé",
    "[useConversationEngine] 📊 Messages après ajout"
  ]
}
EOF

echo -e "${GREEN}✅ Configuration créée: test-config.json${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4: Checklist Manuelle
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}━━━ ÉTAPE 4/6: Checklist Manuelle ━━━${NC}"
echo ""
echo -e "${YELLOW}📋 INSTRUCTIONS DE TEST:${NC}"
echo ""
echo "1️⃣  L'app va démarrer en mode dev"
echo "2️⃣  Ouvrir DevTools Console (F12)"
echo "3️⃣  Naviguer vers l'onglet 'CONVERSATION' ou 'Chat IA'"
echo "4️⃣  Envoyer le message: 'Bonjour, test debug phase 2'"
echo "5️⃣  Observer les logs dans la console"
echo ""
echo -e "${YELLOW}🔍 LOGS ATTENDUS (dans l'ordre):${NC}"
echo "   ────────────────────────────────────────────────────"
echo "   [conversationEngine] 📤 Sending to backend"
echo "   [conversation_process_message] 📨 Request (RUST)"
echo "   [AI Router] Routing to Ollama (RUST)"
echo "   [conversation_process_message] ✅ Success (RUST)"
echo "   [conversationEngine] 📥 Backend response"
echo "   [useConversationEngine] 📝 Assistant message créé"
echo "   [useConversationEngine] 📊 Messages après ajout"
echo "   ────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}❓ POINTS DE VÉRIFICATION:${NC}"
echo "   ✓ assistant_message_length > 0 ?"
echo "   ✓ content_length > 0 ?"
echo "   ✓ Messages state 'total' augmente ?"
echo "   ✓ Réponse visible dans l'interface ?"
echo ""
echo -e "${RED}⚠️  Si problème persiste:${NC}"
echo "   1. Copier TOUS les logs console"
echo "   2. Noter le DERNIER log avant rupture"
echo "   3. Exécuter dans console: document.querySelectorAll('.conversation-message').length"
echo "   4. Screenshot de l'interface + DevTools"
echo ""

read -p "Appuyez sur Entrée pour lancer l'app dev (Ctrl+C pour annuler)..."

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5: Lancement App Dev
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}━━━ ÉTAPE 5/6: Lancement App Dev ━━━${NC}"
echo ""
echo -e "${GREEN}🚀 Démarrage de l'application...${NC}"
echo -e "${YELLOW}   (Logs backend seront dans le terminal)${NC}"
echo -e "${YELLOW}   (Logs frontend: ouvrir DevTools Console F12)${NC}"
echo ""

cd "$PROJECT_ROOT"
pnpm run dev:tauri 2>&1 | tee "$LOG_FILE"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6: Rapport Final
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}━━━ ÉTAPE 6/6: Rapport Final ━━━${NC}"
echo ""
echo -e "${GREEN}📊 Logs sauvegardés dans:${NC}"
echo "   $LOG_FILE"
echo ""
echo -e "${YELLOW}📝 Pour analyser les logs:${NC}"
echo "   cat $LOG_FILE | grep 'conversation'"
echo "   cat $LOG_FILE | grep 'AI Router'"
echo "   cat $LOG_FILE | grep -E '(Success|Error|❌)'"
echo ""
