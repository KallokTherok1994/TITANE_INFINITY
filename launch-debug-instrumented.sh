#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v17.2.1 — LANCEMENT INSTRUMENTÉ (DEBUG PROFOND)
# Capture tous les logs backend + frontend pour diagnostic
# ═══════════════════════════════════════════════════════════════

set -e

cd /home/titane/Documents/TITANE_INFINITY

echo "🔧 TITANE∞ v17.2.1 — LANCEMENT INSTRUMENTÉ"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Créer dossier logs
mkdir -p logs
LOG_FILE="logs/debug-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}📊 Configuration :${NC}"
echo "  - Mode : Development (cargo tauri dev)"
echo "  - DevTools : Auto-ouverture activée"
echo "  - Logs : $LOG_FILE"
echo "  - Backend : src-tauri/src/main.rs (instrumented)"
echo "  - Frontend : src/main.tsx (instrumented)"
echo ""

echo -e "${YELLOW}⚠️  INSTRUCTIONS :${NC}"
echo "  1. La fenêtre va s'ouvrir"
echo "  2. DevTools s'ouvriront automatiquement (côté droit)"
echo "  3. Consulter Console pour voir :"
echo "     - '>>> TITANE∞ FRONTEND INITIALIZING...'"
echo "     - '>>> TITANE∞ FRONTEND READY TO MOUNT REACT'"
echo "     - '✅ TITANE∞ frontend loaded successfully'"
echo "  4. Tous les logs sont capturés dans $LOG_FILE"
echo ""

echo -e "${GREEN}🚀 Démarrage de Tauri...${NC}"
echo ""

# Lancer avec capture complète
echo "=== TITANE∞ DEBUG SESSION START ===" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "Command: cargo tauri dev" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Lancer Tauri avec logs
{
    echo ">>> Launching cargo tauri dev..."
    cargo tauri dev 2>&1
} | tee -a "$LOG_FILE"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Session terminée${NC}"
echo "📄 Logs sauvegardés : $LOG_FILE"
echo ""
echo "Pour analyser les logs :"
echo "  cat $LOG_FILE | grep '>>>'"
echo "  cat $LOG_FILE | grep 'ERROR'"
echo "  cat $LOG_FILE | grep 'WARN'"
echo ""
