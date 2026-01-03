#!/usr/bin/env bash
# TITANE∞ - Démarrage rapide du tunnel (service systemd)
# Lance le tunnel comme service système pour accès permanent
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔧 TITANE∞ - Installation service tunnel"
echo "═══════════════════════════════════════"
echo ""

# Vérifier les prérequis
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI non trouvé"
    exit 1
fi

# Nom du tunnel par défaut
DEFAULT_NAME="titane-infinity-$(hostname)"
TUNNEL_NAME="${1:-$DEFAULT_NAME}"

echo "📦 Configuration:"
echo "   Nom: $TUNNEL_NAME"
echo "   Workspace: $PROJECT_ROOT"
echo ""

# Vérifier si un service existe déjà
if code tunnel service status &> /dev/null; then
    echo "⚠️  Un service tunnel existe déjà"
    read -p "Désinstaller et réinstaller ? [y/N]: " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "🗑️  Désinstallation..."
        code tunnel service uninstall || true
    else
        echo "❌ Annulé"
        exit 1
    fi
fi

echo "🚀 Installation du service..."
cd "$PROJECT_ROOT"

# Installer le service (nécessite authentification GitHub)
code tunnel service install \
    --name "$TUNNEL_NAME" \
    --accept-server-license-terms

echo ""
echo "✅ Service installé avec succès!"
echo ""
echo "📝 Commandes utiles:"
echo "   Démarrer:   code tunnel service start"
echo "   Arrêter:    code tunnel service stop"
echo "   Statut:     code tunnel service status"
echo "   Logs:       code tunnel service log"
echo "   Désinstall: code tunnel service uninstall"
echo ""
echo "🌐 Accès distant:"
echo "   https://vscode.dev/tunnel/$TUNNEL_NAME"
echo "   ou via: 'Remote-Tunnels: Connect to Tunnel' dans VS Code"
echo ""
