#!/bin/bash
echo "🔊 Installation espeak pour TTS TITANE∞"
if command -v espeak &> /dev/null; then
    echo "✅ espeak déjà installé: $(espeak --version | head -1)"
    exit 0
fi
echo "📦 Installation en cours..."
sudo apt-get update -qq
sudo apt-get install -y espeak espeak-data libespeak-dev
echo "✅ Installation terminée"
espeak -v fr "Bonjour Kevin, je suis TITANE" 2>/dev/null || echo "Test vocal prêt"
