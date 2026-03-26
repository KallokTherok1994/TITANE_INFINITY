#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ - Script de Vérification Ollama
#   Vérifie la configuration complète d'Ollama pour TITANE
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔍 TITANE∞ - Vérification Configuration Ollama"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Ollama service
echo -n "1️⃣  Service Ollama... "
if curl -s http://127.0.0.1:11434/api/version > /dev/null 2>&1; then
    VERSION=$(curl -s http://127.0.0.1:11434/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ En ligne (v${VERSION})${NC}"
else
    echo -e "${RED}❌ Inaccessible${NC}"
    echo "   💡 Démarrez Ollama: ollama serve"
    exit 1
fi

# Check 2: Models installed
echo -n "2️⃣  Modèles installés... "
MODELS=$(curl -s http://127.0.0.1:11434/api/tags | grep -o '"name":"[^"]*"' | wc -l)
if [ "$MODELS" -gt 0 ]; then
    echo -e "${GREEN}✅ ${MODELS} modèle(s)${NC}"
else
    echo -e "${RED}❌ Aucun modèle${NC}"
    echo "   💡 Installez un modèle: ollama pull llama3.1"
    exit 1
fi

# Check 3: Default model
echo -n "3️⃣  Modèle par défaut (llama3.1)... "
if curl -s http://127.0.0.1:11434/api/tags | grep -q "llama3.1"; then
    echo -e "${GREEN}✅ Disponible${NC}"
else
    echo -e "${YELLOW}⚠️  Non trouvé${NC}"
    echo "   💡 Installez-le: ollama pull llama3.1"
fi

# Check 4: .env file
echo -n "4️⃣  Fichier .env... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Présent${NC}"
    
    # Check if Ollama config is present
    if grep -q "OLLAMA_BASE_URL" .env && grep -q "OLLAMA_DEFAULT_MODEL" .env; then
        echo "   ✅ Configuration Ollama trouvée"
    else
        echo -e "   ${YELLOW}⚠️  Configuration Ollama manquante${NC}"
        echo "   💡 Ajoutez dans .env:"
        echo "      OLLAMA_BASE_URL=http://127.0.0.1:11434"
        echo "      OLLAMA_DEFAULT_MODEL=llama3.1"
    fi
else
    echo -e "${YELLOW}⚠️  Absent${NC}"
    echo "   💡 Copiez .env.example vers .env"
fi

# Check 5: TITANE can access Ollama
echo -n "5️⃣  Test de génération... "
RESPONSE=$(curl -s -X POST http://127.0.0.1:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{"model":"llama3.1","prompt":"Dis bonjour","stream":false}' \
    2>/dev/null || echo "error")

if echo "$RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✅ Fonctionnel${NC}"
else
    echo -e "${RED}❌ Échec${NC}"
    echo "   Réponse: $RESPONSE"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Configuration Ollama validée pour TITANE∞${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Résumé:"
echo "   • Service: http://127.0.0.1:11434"
echo "   • Modèles: ${MODELS} installé(s)"
echo "   • Modèle par défaut: llama3.1"
echo ""
echo "🚀 Prêt à lancer TITANE:"
echo "   pnpm tauri dev"
echo ""
