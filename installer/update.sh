#!/bin/bash
# TITANE∞ OS - Mise à jour automatique

set -e

INSTALL_DIR="/opt/TITANE_Infinity"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ OS - Mise à jour automatique                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(dirname "$0")/.."
cd "$PROJECT_DIR"

# 1. Vérifier Git
echo "🔍 [1/5] Vérification des mises à jour..."
if [ -d ".git" ]; then
    git fetch origin
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "✅ Aucune mise à jour disponible"
        exit 0
    else
        echo "📥 Nouvelles mises à jour disponibles"
        git pull origin main
    fi
else
    echo "⚠️  Pas de repository Git détecté, passage au rebuild..."
fi

# 2. Self-Heal
echo "🔧 [2/5] Exécution du Self-Heal..."
bash installer/self_heal.sh

# 3. Rebuild complet
echo "🏗️  [3/5] Rebuild complet..."
pnpm build

cd src-tauri
cargo build --release --no-default-features
cd ..

# 4. Redéploiement
echo "🚀 [4/5] Redéploiement..."
if [ -d "$INSTALL_DIR" ]; then
    sudo cp -r dist "$INSTALL_DIR/"
    sudo cp src-tauri/target/release/titane-infinity "$INSTALL_DIR/"
    echo "✅ Application mise à jour dans $INSTALL_DIR"
fi

# 5. Log
echo "📝 [5/5] Enregistrement de la mise à jour..."
mkdir -p logs
echo "{\"status\":\"updated\",\"version\":\"v19.1.0\",\"date\":\"$(date -Iseconds)\"}" > logs/update_report.json

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ TITANE∞ OS mis à jour avec succès !                ║"
echo "╚══════════════════════════════════════════════════════════╝"
