#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — INSTALLATION AUTOMATIQUE DES MODÈLES OLLAMA
#   Version non-interactive pour scripts CI/CD
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

MODELS=("qwen2.5:latest" "llama3.1:8b" "mistral:7b")
OLLAMA_URL="http://localhost:11434"

# Vérifications
command -v ollama >/dev/null 2>&1 || { echo "❌ Ollama non installé"; exit 1; }
curl -sf "${OLLAMA_URL}/api/version" >/dev/null 2>&1 || { echo "❌ Serveur Ollama non actif"; exit 1; }

echo "🚀 Installation des modèles TITANE∞..."
echo ""

for model in "${MODELS[@]}"; do
    echo "📦 Installation: $model"
    if ollama pull "$model"; then
        echo "✅ OK"
    else
        echo "❌ ÉCHEC"
        exit 1
    fi
    echo ""
done

echo "✅ Installation terminée!"
ollama list
