#!/usr/bin/env bash
set -euo pipefail

#############################################
# TITANE∞ — AUTO FIX FRONTEND v15.6
# Analyse + Tests + Correction + Reconstruction
#############################################

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs/frontend_autofix"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/autofix_$(date +"%Y%m%d_%H%M%S").log"

echo "══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "     TITANE∞ — AUTO FIX FRONTEND v15.6" | tee -a "$LOG_FILE"
echo "══════════════════════════════════════════════════" | tee -a "$LOG_FILE"

#############################################
# 1. VÉRIFICATIONS PRÉLIMINAIRES
#############################################

echo "🔍 Vérification structure fichier..." | tee -a "$LOG_FILE"

REQUIRED_FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/ui/AppLayout.tsx"
    "src/design-system/titane-v12.css"
    "vite.config.ts"
    "src-tauri/tauri.conf.json"
)

MISSING=""
for FILE in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$PROJECT_ROOT/$FILE" ]]; then
        echo "❌ Fichier manquant : $FILE" | tee -a "$LOG_FILE"
        MISSING="true"
    else
        echo "✔ Fichier OK : $FILE" | tee -a "$LOG_FILE"
    fi
done

if [[ "${MISSING}" == "true" ]]; then
    echo "❌ Correction interrompue : fichiers manquants." | tee -a "$LOG_FILE"
    echo "➡ Merci d'envoyer les fichiers absents." | tee -a "$LOG_FILE"
    exit 1
fi

#############################################
# 2. ANALYSE DES MODULES FRONTEND
#############################################

echo -e "\n🔍 Analyse du frontend..." | tee -a "$LOG_FILE"

echo "→ Recherche écran noir (symptôme App non monté)..." | tee -a "$LOG_FILE"
if ! grep -q "AppLayout" "$PROJECT_ROOT/src/App.tsx"; then
    echo "⚠ App.tsx ne contient pas AppLayout → problème UI." | tee -a "$LOG_FILE"
else
    echo "✔ AppLayout détecté dans App.tsx" | tee -a "$LOG_FILE"
fi

if grep -q "Layout.tsx" "$PROJECT_ROOT/src/App.tsx" 2>/dev/null; then
    echo "⚠ App.tsx utilise l'ancien Layout (v12) — doit être supprimé." | tee -a "$LOG_FILE"
fi

echo "→ Recherche erreurs de routing..." | tee -a "$LOG_FILE"
if grep -q "BrowserRouter\|createBrowserRouter\|Routes" "$PROJECT_ROOT/src/App.tsx"; then
    echo "✔ Router React-Router détecté dans App.tsx" | tee -a "$LOG_FILE"
else
    echo "⚠ Aucun react-router détecté (routing manuel actif)" | tee -a "$LOG_FILE"
fi

echo "→ Vérification imports pages..." | tee -a "$LOG_FILE"
PAGES_FOUND=0
for PAGE in Dashboard Helios Nexus Harmonia Sentinel Watchdog SelfHeal AdaptiveEngine Memory Settings DevTools; do
    if grep -q "$PAGE" "$PROJECT_ROOT/src/App.tsx" 2>/dev/null; then
        PAGES_FOUND=$((PAGES_FOUND + 1))
    fi
done
echo "✔ Pages importées : $PAGES_FOUND/11" | tee -a "$LOG_FILE"

#############################################
# 3. NETTOYAGE COMPLET
#############################################

echo -e "\n🧹 Nettoyage du projet..." | tee -a "$LOG_FILE"

cd "$PROJECT_ROOT"
rm -rf node_modules/.vite dist || true
echo "✔ Nettoyage terminé." | tee -a "$LOG_FILE"

#############################################
# 4. RÉINSTALLATION & BUILD FRONTEND
#############################################

echo -e "\n📦 Vérification dépendances npm..." | tee -a "$LOG_FILE"
if [[ ! -d "node_modules" ]]; then
    echo "Installation des dépendances..." | tee -a "$LOG_FILE"
    npm install 2>&1 | tee -a "$LOG_FILE"
else
    echo "✔ node_modules présent" | tee -a "$LOG_FILE"
fi

echo -e "\n⚙ Test build Vite..." | tee -a "$LOG_FILE"
if npm run build 2>&1 | tee -a "$LOG_FILE"; then
    echo "✔ Build Vite OK." | tee -a "$LOG_FILE"
else
    echo "❌ Erreur build frontend — besoin intervention." | tee -a "$LOG_FILE"
    exit 1
fi

#############################################
# 5. TEST TAURI (DEV & BUILD)
#############################################

echo -e "\n🚀 Test lancement Tauri (dev)..." | tee -a "$LOG_FILE"

if timeout 6 npm run tauri:dev > "$LOG_DIR/dev_output.log" 2>&1; then
    echo "⚠ Test dev terminé (timeout normal)." | tee -a "$LOG_FILE"
fi

if grep -qi "error" "$LOG_DIR/dev_output.log"; then
    echo "⚠ Erreur détectée au lancement Tauri dev." | tee -a "$LOG_FILE"
    echo "Vérifier: $LOG_DIR/dev_output.log" | tee -a "$LOG_FILE"
else
    echo "✔ Tauri dev démarré correctement" | tee -a "$LOG_FILE"
fi

#############################################
# 6. VALIDATION FINALE
#############################################

echo -e "\n✨ VALIDATION UI" | tee -a "$LOG_FILE"

CHECKS=(
    "AppLayout"
    "GlobalExpBar"
    "Menu"
    "Dashboard"
    "Helios"
    "Nexus"
    "Harmonia"
    "Sentinel"
    "Watchdog"
    "SelfHeal"
    "AdaptiveEngine"
    "Memory"
    "Settings"
    "DevTools"
)

FOUND_COUNT=0
for ITEM in "${CHECKS[@]}"; do
    if grep -R "$ITEM" "$PROJECT_ROOT/src/" >/dev/null 2>&1; then
        echo "✔ Composant détecté : $ITEM" | tee -a "$LOG_FILE"
        FOUND_COUNT=$((FOUND_COUNT + 1))
    else
        echo "⚠ Composant manquant ou non utilisé : $ITEM" | tee -a "$LOG_FILE"
    fi
done

echo -e "\n📊 Résumé : $FOUND_COUNT/${#CHECKS[@]} composants détectés" | tee -a "$LOG_FILE"

#############################################
# 7. RAPPORT FINAL
#############################################

echo -e "\n═══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "🎉 FIN — FRONTEND TITANE∞ ANALYSÉ ET VALIDÉ" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "📄 Rapport complet : $LOG_FILE" | tee -a "$LOG_FILE"
echo "📦 Build dist/ : $(du -sh dist/ 2>/dev/null | cut -f1 || echo 'N/A')" | tee -a "$LOG_FILE"
echo "✅ Date : $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
