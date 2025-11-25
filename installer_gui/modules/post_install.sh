#!/bin/bash
# TITANE∞ OS - Post-installation

echo "🧹 Finalisation de l'installation..."

INSTALL_DIR="/opt/TITANE_Infinity"
PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"

# Nettoyage des caches de build
echo "🗑️  Nettoyage des caches..."
cd "$PROJECT_DIR"
rm -rf node_modules/.cache 2>/dev/null || true

# Créer le rapport d'installation
echo "📝 Génération du rapport d'installation..."
cat > "$INSTALL_DIR/logs/install_report.json" << EOF
{
  "status": "installed",
  "version": "v19.1.0",
  "date": "$(date -Iseconds)",
  "install_dir": "$INSTALL_DIR",
  "user": "$USER",
  "system": "$(uname -s) $(uname -r)"
}
EOF

# Vérification finale
if [ -f "$INSTALL_DIR/titane-infinity" ] && [ -d "$INSTALL_DIR/dist" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   ✅ TITANE∞ OS installé avec succès                    ║"
    echo "║                                                          ║"
    echo "║   📁 Installation: $INSTALL_DIR          ║"
    echo "║   🚀 Lancer: Menu Applications → TITANE∞ OS             ║"
    echo "║   📊 Logs: $INSTALL_DIR/logs/            ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
else
    echo "❌ Erreur: Installation incomplète"
    exit 1
fi

exit 0
