#!/usr/bin/env bash
# Test de Conversation Ollama via API directe

echo "🧪 Test Conversation Ollama"
echo "══════════════════════════════════════════════"
echo ""

OLLAMA_URL="http://127.0.0.1:11434"
MODEL="llama3.1:latest"

echo "📡 Envoi d'une question au modèle ${MODEL}..."
echo ""

RESPONSE=$(curl -sf -X POST "${OLLAMA_URL}/api/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"prompt\": \"Bonjour! Je suis TITANE∞. Peux-tu te présenter en une phrase?\",
    \"stream\": false,
    \"options\": {
      \"temperature\": 0.7,
      \"top_p\": 0.9
    }
  }" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Réponse reçue:"
    echo ""
    echo "$RESPONSE" | jq -r '.response' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "══════════════════════════════════════════════"
    echo "✅ Test réussi! Ollama répond correctement."
else
    echo "❌ Erreur lors de la requête:"
    echo "$RESPONSE"
    exit 1
fi
