#!/usr/bin/env bash
# TITANE∞ - Afficher les informations de connexion tunnel
set -euo pipefail

echo "🌐 TITANE∞ - Informations de Connexion Tunnel"
echo "═════════════════════════════════════════════"
echo ""

# Récupérer le statut
STATUS=$(code tunnel status 2>&1)

# Parser le JSON
TUNNEL_NAME=$(echo "$STATUS" | jq -r '.tunnel.name // "null"')
TUNNEL_STATE=$(echo "$STATUS" | jq -r '.tunnel.tunnel // "unknown"')

if [ "$TUNNEL_NAME" = "null" ]; then
    echo "❌ Aucun tunnel configuré"
    echo ""
    echo "💡 Pour configurer un tunnel:"
    echo "   ./scripts/remote/setup-github-tunnel.sh"
    echo ""
    exit 1
fi

echo "📦 Machine: $TUNNEL_NAME"
echo "📊 État: $TUNNEL_STATE"
echo ""

if [ "$TUNNEL_STATE" = "Connected" ]; then
    echo "✅ TUNNEL ACTIF"
    echo ""
    echo "🌍 Accès via navigateur:"
    echo "   https://vscode.dev/tunnel/$TUNNEL_NAME"
    echo ""
    echo "💻 Accès via VS Code Desktop:"
    echo "   1. Ctrl+Shift+P"
    echo "   2. 'Remote-Tunnels: Connect to Tunnel'"
    echo "   3. Sélectionner '$TUNNEL_NAME'"
    echo ""
    echo "⌨️  Accès via CLI:"
    echo "   code --remote tunnel/$TUNNEL_NAME"
    echo ""
elif [ "$TUNNEL_STATE" = "Disconnected" ]; then
    echo "⚠️  TUNNEL DÉCONNECTÉ"
    echo ""
    echo "💡 Pour démarrer:"
    echo "   code tunnel service start"
    echo ""
    echo "   ou pour une session interactive:"
    echo "   code tunnel --name $TUNNEL_NAME"
    echo ""
else
    echo "❓ État inconnu: $TUNNEL_STATE"
    echo ""
fi

# Afficher les logs récents si le service est installé
if systemctl --user is-active code-tunnel &>/dev/null; then
    echo "───────────────────────────────────────────"
    echo "📄 Derniers logs du service (3 lignes):"
    journalctl --user -u code-tunnel -n 3 --no-pager 2>/dev/null | sed 's/^/   /' || echo "   (logs non disponibles)"
    echo ""
fi

echo "───────────────────────────────────────────"
echo "📋 Commandes utiles:"
echo "   Statut:     code tunnel status"
echo "   Logs:       code tunnel service log"
echo "   Redémarrer: code tunnel service restart"
echo "   Arrêter:    code tunnel service stop"
echo ""
