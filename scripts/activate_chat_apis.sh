#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ - Script d'Activation Chat IA APIs
# ═══════════════════════════════════════════════════════════════════════════
# Active et configure tous les providers IA pour Chat IA
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║           🚀 ACTIVATION CHAT IA APIs - TITANE∞ v19.3.0                    ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CONFIG_DIR="$HOME/.config/titane-infinity"
SECRETS_FILE="$CONFIG_DIR/secrets.json"

# ─────────────────────────────────────────────────────────────────────────────
# Étape 1: Créer répertoire configuration
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}📁 Étape 1: Configuration répertoire${NC}"
if [ ! -d "$CONFIG_DIR" ]; then
  mkdir -p "$CONFIG_DIR"
  echo -e "${GREEN}✅ Répertoire créé: $CONFIG_DIR${NC}"
else
  echo -e "${GREEN}✅ Répertoire existe: $CONFIG_DIR${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Étape 2: Créer/Vérifier fichier secrets.json
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}🔐 Étape 2: Configuration secrets.json${NC}"
if [ ! -f "$SECRETS_FILE" ]; then
  cat << 'SECRETS_EOF' > "$SECRETS_FILE"
{
  "gemini_api_key": "",
  "openai_api_key": "",
  "anthropic_api_key": ""
}
SECRETS_EOF
  chmod 600 "$SECRETS_FILE"
  echo -e "${GREEN}✅ Fichier secrets.json créé${NC}"
else
  echo -e "${GREEN}✅ Fichier secrets.json existe${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Étape 3: Vérifier Ollama
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}🦙 Étape 3: Vérification Ollama${NC}"
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | grep -o '"name"' | wc -l)
  echo -e "${GREEN}✅ Ollama actif: $MODEL_COUNT modèles détectés${NC}"
  
  # Lister modèles
  echo -e "${BLUE}   📦 Modèles installés:${NC}"
  ollama list | tail -n +2 | head -5 | awk '{print "      • " $1 " (" $2 ")"}'
  
  TOTAL_MODELS=$(ollama list | tail -n +2 | wc -l)
  if [ "$TOTAL_MODELS" -gt 5 ]; then
    echo "      ... et $(($TOTAL_MODELS - 5)) autres"
  fi
else
  echo -e "${RED}❌ Ollama non démarré${NC}"
  echo -e "${YELLOW}   🔧 Démarrer Ollama:${NC}"
  echo "      ollama serve &"
  echo ""
  echo -e "${YELLOW}   📥 Télécharger modèles (optionnel):${NC}"
  echo "      ollama pull llama3.2:latest"
  echo "      ollama pull gemma2:latest"
  echo "      ollama pull deepseek-coder-v2:latest"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Étape 4: Configuration clés API (interactif)
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}🔑 Étape 4: Configuration clés API${NC}"
echo -e "${YELLOW}Voulez-vous configurer les clés API maintenant? (y/N)${NC}"
read -r CONFIGURE_KEYS

if [[ "$CONFIGURE_KEYS" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${BLUE}📝 Configuration Gemini API${NC}"
  echo "   🔗 Obtenir clé: https://makersuite.google.com/app/apikey"
  echo -n "   Clé Gemini (laisser vide pour ignorer): "
  read -r GEMINI_KEY
  
  echo ""
  echo -e "${BLUE}📝 Configuration OpenAI API${NC}"
  echo "   🔗 Obtenir clé: https://platform.openai.com/api-keys"
  echo -n "   Clé OpenAI (laisser vide pour ignorer): "
  read -r OPENAI_KEY
  
  echo ""
  echo -e "${BLUE}📝 Configuration Anthropic API${NC}"
  echo "   🔗 Obtenir clé: https://console.anthropic.com/settings/keys"
  echo -n "   Clé Anthropic (laisser vide pour ignorer): "
  read -r ANTHROPIC_KEY
  
  # Mettre à jour secrets.json
  cat << EOF > "$SECRETS_FILE"
{
  "gemini_api_key": "$GEMINI_KEY",
  "openai_api_key": "$OPENAI_KEY",
  "anthropic_api_key": "$ANTHROPIC_KEY"
}
EOF
  chmod 600 "$SECRETS_FILE"
  echo -e "${GREEN}✅ Clés API enregistrées${NC}"
else
  echo -e "${YELLOW}⏭️  Configuration manuelle requise:${NC}"
  echo "   nano $SECRETS_FILE"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Étape 5: Vérification clés configurées
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}🔍 Étape 5: Vérification configuration${NC}"

GEMINI_CONFIGURED=false
OPENAI_CONFIGURED=false
ANTHROPIC_CONFIGURED=false

if grep -q '"gemini_api_key": "[^"]' "$SECRETS_FILE" 2>/dev/null; then
  GEMINI_CONFIGURED=true
  echo -e "${GREEN}✅ Gemini API configurée${NC}"
else
  echo -e "${YELLOW}⚠️  Gemini API non configurée${NC}"
fi

if grep -q '"openai_api_key": "[^"]' "$SECRETS_FILE" 2>/dev/null; then
  OPENAI_CONFIGURED=true
  echo -e "${GREEN}✅ OpenAI API configurée${NC}"
else
  echo -e "${YELLOW}⚠️  OpenAI API non configurée${NC}"
fi

if grep -q '"anthropic_api_key": "[^"]' "$SECRETS_FILE" 2>/dev/null; then
  ANTHROPIC_CONFIGURED=true
  echo -e "${GREEN}✅ Anthropic API configurée${NC}"
else
  echo -e "${YELLOW}⚠️  Anthropic API non configurée${NC}"
fi

# Ollama check
OLLAMA_ACTIVE=false
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  OLLAMA_ACTIVE=true
  echo -e "${GREEN}✅ Ollama actif (local)${NC}"
else
  echo -e "${RED}❌ Ollama non actif${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Étape 6: Test rapide Ollama
# ─────────────────────────────────────────────────────────────────────────────

if [ "$OLLAMA_ACTIVE" = true ]; then
  echo -e "${BLUE}🧪 Étape 6: Test Ollama (rapide)${NC}"
  
  RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{
      "model": "llama3.2:latest",
      "prompt": "Réponds juste: OK",
      "stream": false,
      "options": {"num_predict": 5}
    }' 2>/dev/null | head -c 300)
  
  if echo "$RESPONSE" | grep -q '"response"'; then
    echo -e "${GREEN}✅ Test conversation Ollama: Fonctionnel${NC}"
  else
    echo -e "${YELLOW}⚠️  Test Ollama: Erreur (modèle peut-être absent)${NC}"
    echo "   Installer llama3.2: ollama pull llama3.2:latest"
  fi
  echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# Résumé Final
# ─────────────────────────────────────────────────────────────────────────────

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║                     🎯 RÉSUMÉ CONFIGURATION                                ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

ACTIVE_COUNT=0
TOTAL_COUNT=4

echo "📊 Providers disponibles:"
if [ "$OLLAMA_ACTIVE" = true ]; then
  echo -e "   ${GREEN}✅ Ollama (local)${NC} - 10 modèles"
  ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
else
  echo -e "   ${RED}❌ Ollama${NC} - Non démarré"
fi

if [ "$GEMINI_CONFIGURED" = true ]; then
  echo -e "   ${GREEN}✅ Gemini (cloud)${NC} - 3 modèles"
  ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
else
  echo -e "   ${YELLOW}⚠️  Gemini${NC} - Non configuré"
fi

if [ "$OPENAI_CONFIGURED" = true ]; then
  echo -e "   ${GREEN}✅ OpenAI (cloud)${NC} - 4 modèles"
  ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
else
  echo -e "   ${YELLOW}⚠️  OpenAI${NC} - Non configuré"
fi

if [ "$ANTHROPIC_CONFIGURED" = true ]; then
  echo -e "   ${GREEN}✅ Anthropic (cloud)${NC} - 3 modèles"
  ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
else
  echo -e "   ${YELLOW}⚠️  Anthropic${NC} - Non configuré"
fi

echo ""
echo "📈 Statut: $ACTIVE_COUNT/$TOTAL_COUNT providers actifs"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Instructions finales
# ─────────────────────────────────────────────────────────────────────────────

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║                     🚀 PROCHAINES ÉTAPES                                   ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$OLLAMA_ACTIVE" = false ]; then
  echo -e "${YELLOW}1. Démarrer Ollama:${NC}"
  echo "   ollama serve &"
  echo ""
fi

if [ "$GEMINI_CONFIGURED" = false ] || [ "$OPENAI_CONFIGURED" = false ] || [ "$ANTHROPIC_CONFIGURED" = false ]; then
  echo -e "${YELLOW}2. Configurer clés API (optionnel):${NC}"
  echo "   nano ~/.config/titane-infinity/secrets.json"
  echo ""
  echo "   📝 Obtenir clés:"
  [ "$GEMINI_CONFIGURED" = false ] && echo "   • Gemini: https://makersuite.google.com/app/apikey"
  [ "$OPENAI_CONFIGURED" = false ] && echo "   • OpenAI: https://platform.openai.com/api-keys"
  [ "$ANTHROPIC_CONFIGURED" = false ] && echo "   • Anthropic: https://console.anthropic.com/settings/keys"
  echo ""
fi

echo -e "${GREEN}3. Lancer TITANE∞ Dev:${NC}"
echo "   ./runtime/dev/run-dev.sh"
echo ""

echo -e "${GREEN}4. Tester Chat IA:${NC}"
echo "   • Ouvrir interface TITANE∞"
echo "   • Naviguer vers 💬 Chat IA"
echo "   • Sélectionner Provider: 🟢 Ollama"
echo "   • Sélectionner Modèle: llama3.2:latest"
echo "   • Envoyer message de test"
echo ""

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║              ✅ ACTIVATION COMPLÈTE - CHAT IA PRÊT ! ✅                    ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
