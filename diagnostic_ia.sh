#!/bin/bash

##############################################################################
# TITANE∞ - Script de diagnostic complet des services IA
##############################################################################

echo "🔍 DIAGNOSTIC SERVICES IA TITANE∞"
echo "=================================="
echo ""

# 1. Vérifier fichier .env
echo "📝 1. Configuration .env"
echo "-----------------------"
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"

    if grep -q "VITE_GEMINI_API_KEY=" .env; then
        KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)
        if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
            echo "✅ VITE_GEMINI_API_KEY configurée (${KEY:0:20}...)"
        else
            echo "⚠️  VITE_GEMINI_API_KEY vide ou placeholder"
        fi
    else
        echo "❌ VITE_GEMINI_API_KEY manquante dans .env"
    fi

    if grep -q "VITE_OLLAMA_URL=" .env; then
        URL=$(grep "VITE_OLLAMA_URL=" .env | cut -d'=' -f2)
        echo "✅ VITE_OLLAMA_URL=$URL"
    fi
else
    echo "❌ Fichier .env introuvable"
    echo "   → Copie .env.example vers .env et configure les clés"
fi

echo ""

# 2. Tester Ollama
echo "🤖 2. Service Ollama Local"
echo "--------------------------"
if command -v ollama &> /dev/null; then
    echo "✅ Ollama installé"

    # Test connexion
    if curl -s --connect-timeout 2 http://localhost:11434/api/tags &> /dev/null; then
        echo "✅ Ollama service démarré (port 11434)"

        # Lister modèles
        MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$MODELS" ]; then
            echo "✅ Modèles installés:"
            echo "$MODELS" | sed 's/^/   - /'
        else
            echo "⚠️  Aucun modèle installé"
            echo "   → Installe un modèle: ollama pull llama2"
        fi
    else
        echo "❌ Ollama service NON démarré"
        echo "   → Lance: ollama serve"
    fi
else
    echo "❌ Ollama NON installé"
    echo "   → Installe depuis: https://ollama.ai"
fi

echo ""

# 3. Tester Gemini API
echo "🌐 3. Google Gemini API"
echo "------------------------"
if [ -f ".env" ]; then
    KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)

    if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
        echo "🔍 Test de connexion Gemini..."

        RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 5 \
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$KEY" \
            -X POST \
            -H "Content-Type: application/json" \
            -d '{"contents":[{"parts":[{"text":"test"}]}]}' 2>&1)

        HTTP_CODE=$(echo "$RESPONSE" | tail -1)

        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Gemini API opérationnelle"
        elif [ "$HTTP_CODE" = "403" ]; then
            echo "❌ Gemini API: Clé invalide (403 Forbidden)"
            echo "   → Vérifie ta clé sur https://ai.google.dev"
        elif [ "$HTTP_CODE" = "429" ]; then
            echo "⚠️  Gemini API: Limite de requêtes atteinte (429)"
        else
            echo "❌ Gemini API: Erreur HTTP $HTTP_CODE"
            echo "   → Vérifie ta connexion internet"
        fi
    else
        echo "⚠️  Clé API Gemini non configurée"
        echo "   → Ajoute VITE_GEMINI_API_KEY=ta_clé dans .env"
    fi
else
    echo "❌ Fichier .env manquant"
fi

echo ""

# 4. Résumé et recommandations
echo "📊 RÉSUMÉ & RECOMMANDATIONS"
echo "============================"
echo ""

if curl -s --connect-timeout 2 http://localhost:11434/api/tags &> /dev/null; then
    echo "✅ OLLAMA ACTIF → Mode local privilégié (privé, rapide)"
elif [ -f ".env" ] && grep -q "VITE_GEMINI_API_KEY=" .env; then
    KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)
    if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
        echo "✅ GEMINI CONFIGURÉ → Mode cloud (nécessite internet)"
    else
        echo "❌ AUCUN SERVICE IA DISPONIBLE"
        echo ""
        echo "🔧 ACTIONS REQUISES:"
        echo ""
        echo "Option A (Recommandée - Local + Privé):"
        echo "  1. curl https://ollama.ai/install.sh | sh"
        echo "  2. ollama serve"
        echo "  3. ollama pull llama2"
        echo ""
        echo "Option B (Cloud - Nécessite internet):"
        echo "  1. Obtenir clé: https://ai.google.dev"
        echo "  2. Ajouter dans .env: VITE_GEMINI_API_KEY=ta_clé"
    fi
else
    echo "❌ AUCUN SERVICE IA DISPONIBLE"
    echo ""
    echo "🔧 Configure au moins un provider:"
    echo "  • Gemini (cloud): Ajoute VITE_GEMINI_API_KEY dans .env"
    echo "  • Ollama (local): Installe et démarre ollama serve"
fi

echo ""
echo "🔩 TITANE∞ - Diagnostic terminé"
