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
# (permit non-zero exit for desktop icon update, it's optional)
"$PROJECT_DIR/scripts/update-desktop-icon.sh" || {
  echo "⚠️  Desktop icon update failed (non-critical), continuing build..."
}

echo ""
echo "✅ Post-Build terminé"
