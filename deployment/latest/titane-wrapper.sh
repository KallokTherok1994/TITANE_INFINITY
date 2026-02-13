#!/bin/bash
# TITANE Production Auto-Start Wrapper
# Ensures Ollama is running with correct model before launching TITANE

echo "🚀 TITANE∞ Startup Wrapper v27.0.1"
echo

# Check if Ollama is running
echo "📡 Checking Ollama service..."
curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Ollama is not running. Starting Ollama..."
  ollama serve &
  sleep 3
else
  echo "✅ Ollama is running"
fi

# Set default model for TITANE
export OLLAMA_DEFAULT_MODEL="gemma2:2b"
export OLLAMA_MODEL="gemma2:2b"
export OLLAMA_BASE_URL="http://127.0.0.1:11434"

echo "🤖 Model configured: $OLLAMA_DEFAULT_MODEL"
echo

# Pull model if needed
echo "📥 Ensuring model is available..."
ollama pull gemma2:2b 2>&1 | tail -3

echo
echo "🎯 Launching TITANE∞..."
exec "$@"
