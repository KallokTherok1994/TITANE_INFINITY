#!/bin/bash

# Script de monitoring logs en temps réel pour debug Chat IA
# Usage: Lancer dans un terminal séparé pendant que l'app tourne

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/runtime/test-logs/monitor-$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$PROJECT_ROOT/runtime/test-logs"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🔍 MONITORING LOGS CHAT IA EN TEMPS RÉEL 🔍          ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Filtres actifs:"
echo "   - [conversationEngine]"
echo "   - [useConversationEngine]"
echo "   - [conversation_process_message]"
echo "   - [AI Router]"
echo ""
echo "💾 Logs sauvegardés dans: $LOG_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction pour coloriser les logs
colorize_log() {
    while IFS= read -r line; do
        timestamp=$(date '+%H:%M:%S')
        
        # Sauvegarder dans fichier
        echo "[$timestamp] $line" >> "$LOG_FILE"
        
        # Coloriser selon le type
        if [[ "$line" == *"📤"* ]]; then
            echo -e "\033[0;36m[$timestamp] $line\033[0m"  # Cyan - Envoi
        elif [[ "$line" == *"📥"* ]]; then
            echo -e "\033[0;34m[$timestamp] $line\033[0m"  # Bleu - Réception
        elif [[ "$line" == *"📨"* ]]; then
            echo -e "\033[0;35m[$timestamp] $line\033[0m"  # Magenta - Request
        elif [[ "$line" == *"✅"* ]]; then
            echo -e "\033[0;32m[$timestamp] $line\033[0m"  # Vert - Succès
        elif [[ "$line" == *"❌"* ]] || [[ "$line" == *"Error"* ]]; then
            echo -e "\033[0;31m[$timestamp] $line\033[0m"  # Rouge - Erreur
        elif [[ "$line" == *"📝"* ]]; then
            echo -e "\033[0;33m[$timestamp] $line\033[0m"  # Jaune - Création
        elif [[ "$line" == *"📊"* ]]; then
            echo -e "\033[0;32m[$timestamp] $line\033[0m"  # Vert clair - State
        else
            echo "[$timestamp] $line"
        fi
    done
}

# Monitorer le log Vite (frontend)
VITE_LOG="$PROJECT_ROOT/runtime/dev/logs/vite.log"

echo "🟢 Monitoring démarré..."
echo "   Attente des logs dans: $VITE_LOG"
echo ""

# Créer le fichier si inexistant
touch "$VITE_LOG"

# Tail avec filtre et colorisation
tail -f "$VITE_LOG" 2>/dev/null | grep -E "(conversationEngine|useConversationEngine|conversation_process_message|AI Router)" --line-buffered | colorize_log &

TAIL_PID=$!

# Trap pour cleanup
trap "kill $TAIL_PID 2>/dev/null; echo ''; echo '🛑 Monitoring arrêté'; exit 0" INT TERM

echo "💡 INSTRUCTIONS:"
echo ""
echo "1. Dans l'app TITANE∞, naviguer vers Chat IA"
echo "2. Envoyer message: 'Bonjour, test debug phase 2'"
echo "3. Observer les logs ci-dessous en temps réel"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Attente infinie
wait $TAIL_PID
