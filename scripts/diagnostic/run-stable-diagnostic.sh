#!/bin/bash
# TITANE∞ — Diagnostic Runtime Stable
# Lance l'AppImage stable avec logging complet et monitoring process
# Usage: ./scripts/diagnostic/run-stable-diagnostic.sh [duration_seconds]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/scripts/diagnostic/logs"
DURATION="${1:-180}" # 3 minutes par défaut

# Couleurs
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        TITANE∞ — Diagnostic Runtime Stable                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Créer dossier logs
mkdir -p "$LOG_DIR"

# Timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_PREFIX="$LOG_DIR/stable-run-$TIMESTAMP"

# Trouver l'AppImage stable
echo -e "${BLUE}🔍 Recherche de l'AppImage stable...${NC}"
APPIMAGE_PATH=""

if [[ -f "$PROJECT_ROOT/runtime/stable/Titan-Stable_26.2.0_amd64.AppImage" ]]; then
    APPIMAGE_PATH="$PROJECT_ROOT/runtime/stable/Titan-Stable_26.2.0_amd64.AppImage"
elif [[ -d "$PROJECT_ROOT/runtime/stable" ]]; then
    # Chercher le premier AppImage
    APPIMAGE_PATH=$(find "$PROJECT_ROOT/runtime/stable" -maxdepth 1 -type f -name "*.AppImage" | head -n 1)
fi

if [[ -z "$APPIMAGE_PATH" || ! -f "$APPIMAGE_PATH" ]]; then
    echo -e "${RED}❌ Aucun AppImage trouvé dans runtime/stable/${NC}"
    echo -e "${YELLOW}💡 Lancez d'abord: ./runtime/stable/build.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AppImage trouvé: $(basename "$APPIMAGE_PATH")${NC}"
echo ""

# Nettoyage préventif des caches/sessions
echo -e "${BLUE}🧹 Nettoyage des caches Tauri/Chrome...${NC}"

# Cache service worker
if [[ -d "$HOME/.cache/com.titane.infinity.stable" ]]; then
    echo "  • Nettoyage: $HOME/.cache/com.titane.infinity.stable"
    rm -rf "$HOME/.cache/com.titane.infinity.stable" 2>/dev/null || true
fi

# Session storage
if [[ -d "$HOME/.local/share/com.titane.infinity.stable" ]]; then
    # Garder memory/ mais nettoyer les caches webkit
    echo "  • Nettoyage partiel: $HOME/.local/share/com.titane.infinity.stable (préserve memory/)"
    find "$HOME/.local/share/com.titane.infinity.stable" -type d \( -name "Cache" -o -name "Code Cache" -o -name "GPUCache" \) -exec rm -rf {} + 2>/dev/null || true
fi

echo -e "${GREEN}✓ Nettoyage effectué${NC}"
echo ""

# Informations pré-lancement
echo -e "${CYAN}📋 Configuration du test:${NC}"
echo "  • Durée: ${DURATION}s"
echo "  • Logs stdout: ${LOG_PREFIX}.stdout.log"
echo "  • Logs stderr: ${LOG_PREFIX}.stderr.log"
echo "  • Process log: ${LOG_PREFIX}.process.log"
echo ""

# Lancement en arrière-plan avec redirection logs
echo -e "${BLUE}🚀 Lancement de Titan-Stable...${NC}"
"$APPIMAGE_PATH" >"${LOG_PREFIX}.stdout.log" 2>"${LOG_PREFIX}.stderr.log" &
APP_PID=$!

echo -e "${GREEN}✓ Application lancée (PID: $APP_PID)${NC}"
echo ""

# Monitoring process
echo -e "${BLUE}📊 Monitoring process ($DURATION secondes)...${NC}"
echo ""

# Header du log process
echo "# TITANE∞ Stable Process Monitor" > "${LOG_PREFIX}.process.log"
echo "# Timestamp: $(date -Iseconds)" >> "${LOG_PREFIX}.process.log"
echo "# Main PID: $APP_PID" >> "${LOG_PREFIX}.process.log"
echo "# Duration: ${DURATION}s" >> "${LOG_PREFIX}.process.log"
echo "" >> "${LOG_PREFIX}.process.log"

SAMPLE_INTERVAL=5
SAMPLES=$((DURATION / SAMPLE_INTERVAL))

for ((i=1; i<=SAMPLES; i++)); do
    ELAPSED=$((i * SAMPLE_INTERVAL))
    
    # Vérifier si le process principal est toujours vivant
    if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo -e "${RED}⚠️  Process principal terminé prématurément (après ${ELAPSED}s)${NC}"
        break
    fi
    
    # Logger l'état du process
    echo "=== Sample $i/$SAMPLES (T+${ELAPSED}s) ===" >> "${LOG_PREFIX}.process.log"
    echo "Timestamp: $(date -Iseconds)" >> "${LOG_PREFIX}.process.log"
    
    # Process principal
    ps -p "$APP_PID" -o pid,ppid,%cpu,%mem,vsz,rss,stat,start,time,cmd --no-headers >> "${LOG_PREFIX}.process.log" 2>/dev/null || echo "Main process $APP_PID not found" >> "${LOG_PREFIX}.process.log"
    
    # Sous-processus (WebKit, etc.)
    echo "--- Subprocesses ---" >> "${LOG_PREFIX}.process.log"
    pgrep -P "$APP_PID" | while read -r child_pid; do
        ps -p "$child_pid" -o pid,ppid,%cpu,%mem,vsz,rss,stat,start,time,cmd --no-headers >> "${LOG_PREFIX}.process.log" 2>/dev/null || true
    done
    
    echo "" >> "${LOG_PREFIX}.process.log"
    
    # Affichage console (progress bar simple)
    printf "\r${CYAN}⏱️  Temps écoulé: %3ds / %ds${NC}" "$ELAPSED" "$DURATION"
    
    sleep "$SAMPLE_INTERVAL"
done

echo ""
echo ""

# Terminer proprement l'application
echo -e "${BLUE}🛑 Arrêt de l'application...${NC}"
if kill -0 "$APP_PID" 2>/dev/null; then
    kill -TERM "$APP_PID" 2>/dev/null || true
    sleep 2
    # Force kill si toujours vivant
    if kill -0 "$APP_PID" 2>/dev/null; then
        kill -KILL "$APP_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Application arrêtée${NC}"
else
    echo -e "${YELLOW}⚠️  Application déjà arrêtée${NC}"
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    RÉSUMÉ DIAGNOSTIC                           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Analyse rapide stderr
STDERR_ERRORS=$(grep -ciE "error|fatal|panic|exception" "${LOG_PREFIX}.stderr.log" 2>/dev/null || echo "0")
STDERR_WARNINGS=$(grep -ciE "warn|warning" "${LOG_PREFIX}.stderr.log" 2>/dev/null || echo "0")

echo -e "${BLUE}📊 Statistiques logs:${NC}"
echo "  • Erreurs stderr: $STDERR_ERRORS"
echo "  • Warnings stderr: $STDERR_WARNINGS"
echo ""

# Extraire quelques lignes clés
echo -e "${BLUE}🔍 Dernières lignes stderr:${NC}"
tail -n 20 "${LOG_PREFIX}.stderr.log" | sed 's/^/  /'
echo ""

# Analyse process log
PROCESS_SAMPLES=$(grep -c "^=== Sample" "${LOG_PREFIX}.process.log" 2>/dev/null || echo "0")
echo -e "${BLUE}📈 Process monitoring:${NC}"
echo "  • Échantillons collectés: $PROCESS_SAMPLES"
echo ""

# Fichiers de logs générés
echo -e "${BLUE}📁 Fichiers générés:${NC}"
echo "  • ${LOG_PREFIX}.stdout.log"
echo "  • ${LOG_PREFIX}.stderr.log"
echo "  • ${LOG_PREFIX}.process.log"
echo ""

# Indicateur succès/échec
if [[ $STDERR_ERRORS -gt 0 ]]; then
    echo -e "${RED}❌ Des erreurs ont été détectées — vérifiez les logs${NC}"
    EXIT_CODE=1
elif [[ $PROCESS_SAMPLES -lt $((SAMPLES / 2)) ]]; then
    echo -e "${YELLOW}⚠️  L'application s'est terminée tôt — inspection recommandée${NC}"
    EXIT_CODE=2
else
    echo -e "${GREEN}✅ Exécution nominale — pas d'erreurs critiques détectées${NC}"
    EXIT_CODE=0
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

exit $EXIT_CODE
