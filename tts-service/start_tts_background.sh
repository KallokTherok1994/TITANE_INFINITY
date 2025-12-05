#!/bin/bash

# TITANE∞ - Script de démarrage TTS en arrière-plan
# © 2024 Loïc Basque

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PID_FILE="$SCRIPT_DIR/tts_service.pid"
LOG_FILE="$SCRIPT_DIR/tts_service.log"

# Vérifier si déjà en cours
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "⚠️  Service déjà en cours (PID: $OLD_PID)"
        echo "   Pour l'arrêter: kill $OLD_PID"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

echo "🎤 [TITANE TTS] Démarrage en arrière-plan..."
echo "   Répertoire: $SCRIPT_DIR"
echo "   Log: $LOG_FILE"
echo "   PID: $PID_FILE"

# Démarrer en arrière-plan
nohup bash -c "
    cd '$SCRIPT_DIR'
    source venv-parler-tts/bin/activate
    python3 tts_api_server.py
" > "$LOG_FILE" 2>&1 &

PID=$!
echo $PID > "$PID_FILE"

echo ""
echo "🚀 Service TTS démarré! (PID: $PID)"
echo "   API: http://localhost:8765"
echo "   Health: http://localhost:8765/api/v1/tts/health"
echo "   Docs: http://localhost:8765/docs"
echo ""
echo "📊 Suivre les logs: tail -f $LOG_FILE"
echo "🛑 Arrêter: kill $PID"
echo ""
echo "⏳ Attendre ~60s que le modèle charge..."
