#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ - Quick Start avec Ollama
#   Lance TITANE avec Ollama configuré
# ═══════════════════════════════════════════════════════════════

set -e

echo "🚀 TITANE∞ - Démarrage avec Ollama"
echo "════════════════════════════════════════════════════════════"

# Check Ollama
echo -n "Vérification Ollama... "
if curl -s http://127.0.0.1:11434/api/version > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
    echo ""
    echo "⚠️  Ollama n'est pas accessible"
    echo "💡 Démarrez Ollama: ollama serve"
    echo ""
    read -p "Voulez-vous continuer sans Ollama? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check .env
echo -n "Vérification .env... "
if [ -f ".env" ]; then
    echo "✅"
else
    echo "⚠️"
    echo "Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✨ Lancement de TITANE∞ en mode développement"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📝 Provider AI:"
echo "   • Ollama (Local) - Priorité #1"
echo "   • Fallback vers cloud si configuré"
echo ""
echo "🎯 Pour utiliser Ollama dans TITANE:"
echo "   1. Ouvrez le Chat"
echo "   2. Sélectionnez 'Ollama' ou 'Local'"
echo "   3. Posez votre question!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Launch TITANE
OLLAMA_DEFAULT_MODEL=llama3.1 pnpm tauri dev
