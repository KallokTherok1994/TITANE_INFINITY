#!/usr/bin/env bash
# TITANE∞ - Setup GitHub Remote Tunnel
# Permet l'accès distant au workspace via vscode.dev
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🌐 TITANE∞ - Configuration Remote Tunnel"
echo "════════════════════════════════════════"
echo ""

# Vérifier que code tunnel est disponible
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI non trouvé"
    echo "   Installer: https://code.visualstudio.com/docs/setup/linux#_visual-studio-code-is-unable-to-watch-for-file-changes-in-this-large-workspace-error-enospc"
    exit 1
fi

# Vérifier que la sous-commande `tunnel` est réellement supportée.
# Certaines variantes de `code` (ex: VSCodium/CLI minimal) n'incluent pas Remote Tunnels.
tunnel_help="$(code tunnel --help 2>&1 || true)"
if ! echo "$tunnel_help" | grep -qiE 'Usage:.*code +tunnel|code +tunnel +(status|service|restart|kill)|Remote +Tunnels'; then
    echo "❌ La CLI 'code' détectée ne supporte pas 'code tunnel' (Remote Tunnels)."
    echo ""
    echo "➡️ Solutions possibles:"
    echo "   1) Installer Visual Studio Code (build Microsoft) et activer la commande 'code'"
    echo "      - https://code.visualstudio.com/docs/setup/linux"
    echo "   2) Relancer ce script une fois 'code tunnel' disponible"
    echo ""
    echo "ℹ️ Fallback (sans Remote Tunnels): utiliser un tunnel SSH/port-forwarding vers 127.0.0.1:5173"
    echo "   (garde Vite en localhost et n'expose pas un nouveau serveur)"
    echo ""
    exit 2
fi

echo "✅ VS Code CLI détecté"
echo ""

# Afficher le statut actuel
echo "📊 Statut actuel du tunnel:"
code tunnel status || true
echo ""

# Proposer de créer/démarrer le tunnel
echo "🚀 Options disponibles:"
echo "   1. Créer un nouveau tunnel avec nom personnalisé"
echo "   2. Créer un tunnel avec nom aléatoire"
echo "   3. Redémarrer le tunnel existant"
echo "   4. Afficher le statut uniquement"
echo ""

read -p "Choix [1-4]: " choice

case $choice in
    1)
        read -p "Nom du tunnel (ex: titane-dev-laptop): " tunnel_name
        echo ""
        echo "🔗 Création du tunnel: $tunnel_name"
        echo "   Vous serez redirigé vers GitHub pour l'authentification"
        echo ""
        cd "$PROJECT_ROOT"
        code tunnel --name "$tunnel_name" --accept-server-license-terms
        ;;
    2)
        echo ""
        echo "🔗 Création du tunnel avec nom aléatoire"
        echo "   Vous serez redirigé vers GitHub pour l'authentification"
        echo ""
        cd "$PROJECT_ROOT"
        code tunnel --random-name --accept-server-license-terms
        ;;
    3)
        echo ""
        echo "🔄 Redémarrage du tunnel..."
        code tunnel restart
        ;;
    4)
        echo ""
        echo "📊 Statut détaillé:"
        code tunnel status
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Configuration terminée"
echo ""
echo "📝 Notes importantes:"
echo "   - Le tunnel reste actif tant que cette session est ouverte"
echo "   - Accédez via: https://vscode.dev/tunnel/<nom-machine>"
echo "   - Pour arrêter: Ctrl+C ou 'code tunnel kill'"
echo "   - Pour installer comme service: 'code tunnel service install'"
echo ""
