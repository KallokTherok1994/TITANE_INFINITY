#!/bin/bash
echo "�� TITANE∞ — Activation TTS + Chat IA"
echo ""

# TTS
echo "📢 Activation TTS..."
sudo apt-get install -y espeak espeak-data libespeak-dev 2>&1 | grep -E "(installé|installed|Setting up)" && echo "✅ espeak prêt"

# Chat IA
echo "🤖 Activation Chat IA..."
if ! command -v ollama &> /dev/null; then
    echo "📥 Installation Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

echo "🚀 Démarrage Ollama..."
pkill ollama 2>/dev/null
ollama serve > /tmp/ollama.log 2>&1 &
sleep 3

if ! ollama list | grep -q llama3.2; then
    echo "📥 Téléchargement llama3.2:1b (1.3 GB)..."
    ollama pull llama3.2:1b
fi

echo ""
echo "✅ Activation terminée !"
echo ""
echo "🧪 Tests :"
echo "  TTS : espeak -v fr 'Bonjour Kevin'"
echo "  Chat : curl http://localhost:11434/api/tags"
echo ""
echo "🚀 TITANE prêt à l'emploi !"
