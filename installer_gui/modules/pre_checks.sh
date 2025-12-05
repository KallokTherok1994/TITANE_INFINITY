#!/bin/bash
# TITANE∞ OS - Module de vérification préalable

echo "🔍 Vérification du système..."

PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"

# Utiliser le script existant
bash "$PROJECT_DIR/installer/checks/check_dependencies.sh"

RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "⚠️  Certaines dépendances sont manquantes"
else
    echo "✅ Toutes les dépendances sont présentes"
fi

exit $RESULT
