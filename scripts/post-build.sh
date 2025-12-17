#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ - Post Build Hook
# Exécuté automatiquement après chaque build
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo ""
echo "🔄 Post-Build: Mise à jour automatique de l'icône desktop..."
echo ""

# Exécuter le script de mise à jour de l'icône
"$PROJECT_DIR/scripts/update-desktop-icon.sh"

echo ""
echo "✅ Post-Build terminé"
