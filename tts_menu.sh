#!/bin/bash

# TITANE∞ - Menu TTS Quick Actions
# © 2024 Loïc Basque

TTS_DIR="/home/titane/Documents/TITANE_INFINITY/tts-service"
PID_FILE="$TTS_DIR/tts_service.pid"
LOG_FILE="$TTS_DIR/tts_service.log"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║         🎤 TITANE∞ TTS - Menu Actions Rapides           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "  [1] 🚀 Démarrer le service TTS"
    echo "  [2] 🛑 Arrêter le service TTS"
    echo "  [3] 🔄 Redémarrer le service TTS"
    echo "  [4] 📊 Statut du service"
    echo "  [5] 📋 Voir les logs (live)"
    echo "  [6] 🧪 Lancer test intégration"
    echo "  [7] 🎵 Test synthèse rapide"
    echo "  [8] 📚 Ouvrir la documentation"
    echo "  [9] 🖥️  Lancer TITANE∞ frontend"
    echo "  [0] 🚪 Quitter"
    echo ""
}

get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    else
        echo ""
    fi
}

is_running() {
    PID=$(get_pid)
    if [ -n "$PID" ] && ps -p "$PID" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

start_service() {
    if is_running; then
        echo "⚠️  Service déjà en cours (PID: $(get_pid))"
    else
        echo "🚀 Démarrage du service TTS..."
        $TTS_DIR/start_tts_background.sh
        sleep 2
        if is_running; then
            echo "✅ Service démarré (PID: $(get_pid))"
        else
            echo "❌ Échec du démarrage"
        fi
    fi
}

stop_service() {
    if is_running; then
        PID=$(get_pid)
        echo "🛑 Arrêt du service (PID: $PID)..."
        kill "$PID"
        rm -f "$PID_FILE"
        sleep 1
        echo "✅ Service arrêté"
    else
        echo "⚠️  Service non démarré"
        rm -f "$PID_FILE"
    fi
}

restart_service() {
    stop_service
    sleep 2
    start_service
}

show_status() {
    echo "📊 Statut du service TTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if is_running; then
        PID=$(get_pid)
        echo "État: ✅ Actif"
        echo "PID: $PID"
        echo "Uptime: $(ps -p $PID -o etime= | xargs)"
        echo ""
        echo "Health Check:"
        curl -s http://localhost:8765/api/v1/tts/health | python3 -m json.tool
    else
        echo "État: ❌ Inactif"
        echo ""
        echo "Pour démarrer: $0 start"
    fi
}

show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📋 Logs du service (Ctrl+C pour quitter):"
        echo ""
        tail -f "$LOG_FILE"
    else
        echo "❌ Fichier de logs introuvable: $LOG_FILE"
    fi
}

run_test() {
    echo "🧪 Lancement du test d'intégration..."
    echo ""
    $TTS_DIR/test_integration.sh
}

quick_synth() {
    echo "🎵 Test de synthèse rapide"
    echo ""
    read -p "Texte à synthétiser: " TEXT

    if [ -z "$TEXT" ]; then
        TEXT="Bonjour, je suis TITANE."
    fi

    OUTPUT="/tmp/titane_quick_test.wav"

    echo "Génération en cours..."
    curl -s -X POST http://localhost:8765/api/v1/tts/synthesize \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"$TEXT\", \"return_audio\": true}" \
      > "$OUTPUT"

    if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
        echo "✅ Audio généré: $OUTPUT"
        echo ""
        if command -v aplay &> /dev/null; then
            aplay "$OUTPUT"
        elif command -v ffplay &> /dev/null; then
            ffplay -nodisp -autoexit "$OUTPUT" 2>/dev/null
        else
            echo "Jouer avec: aplay $OUTPUT"
        fi
    else
        echo "❌ Échec de la génération"
    fi
}

open_docs() {
    echo "📚 Documentation disponible:"
    echo ""
    echo "  1. TTS_FINAL_REPORT.md - Rapport complet"
    echo "  2. TTS_INSTALLATION_SUCCESS.md - Guide succès"
    echo "  3. TTS_QUICK_REFERENCE.md - Référence rapide"
    echo "  4. TTS_PARLER_INSTALLATION_GUIDE.md - Guide détaillé"
    echo ""
    read -p "Ouvrir quel document? [1-4]: " DOC_NUM

    case $DOC_NUM in
        1) xdg-open "/home/titane/Documents/TITANE_INFINITY/TTS_FINAL_REPORT.md" 2>/dev/null ;;
        2) xdg-open "/home/titane/Documents/TITANE_INFINITY/TTS_INSTALLATION_SUCCESS.md" 2>/dev/null ;;
        3) xdg-open "/home/titane/Documents/TITANE_INFINITY/TTS_QUICK_REFERENCE.md" 2>/dev/null ;;
        4) xdg-open "/home/titane/Documents/TITANE_INFINITY/TTS_PARLER_INSTALLATION_GUIDE.md" 2>/dev/null ;;
        *) echo "❌ Choix invalide" ;;
    esac
}

launch_frontend() {
    echo "🖥️  Lancement de TITANE∞..."
    cd /home/titane/Documents/TITANE_INFINITY
    npm run tauri:dev
}

# Mode command-line
if [ $# -gt 0 ]; then
    case $1 in
        start) start_service ;;
        stop) stop_service ;;
        restart) restart_service ;;
        status) show_status ;;
        logs) show_logs ;;
        test) run_test ;;
        synth) quick_synth ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|test|synth}"
            exit 1
            ;;
    esac
    exit 0
fi

# Mode interactif
while true; do
    show_menu
    read -p "Choisir une action [0-9]: " choice

    case $choice in
        1) start_service ;;
        2) stop_service ;;
        3) restart_service ;;
        4) show_status ;;
        5) show_logs ;;
        6) run_test ;;
        7) quick_synth ;;
        8) open_docs ;;
        9) launch_frontend; break ;;
        0) echo "👋 Au revoir!"; break ;;
        *) echo "❌ Choix invalide" ;;
    esac

    if [ "$choice" != "5" ] && [ "$choice" != "9" ]; then
        read -p "Appuyer sur Entrée pour continuer..."
    fi
done
