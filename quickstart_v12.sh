#!/usr/bin/env bash
################################################################################
# TITANE∞ v12.0.0 - Quick Start
# Lancement rapide du pipeline complet
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                 TITANE∞ v12 - QUICK START                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Exécution du pipeline complet..."
echo ""

# Vérifier que scripts/ existe
if [ ! -d "$SCRIPT_DIR/scripts" ]; then
    echo "❌ Répertoire scripts/ introuvable"
    echo "📁 Chercher dans: $SCRIPT_DIR"
    exit 1
fi

# Lancer le pipeline
bash "$SCRIPT_DIR/scripts/pipeline/TITANE_PIPELINE_v12.sh" "$@"
