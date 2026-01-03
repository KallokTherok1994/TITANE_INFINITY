#!/usr/bin/env bash
# TITANE∞ - Diagnostic Remote Tunnel
set -euo pipefail

echo "🔍 TITANE∞ - Diagnostic Remote Tunnel"
echo "═════════════════════════════════════"
echo ""

# Vérifier VS Code CLI
echo "1️⃣ VS Code CLI:"
if command -v code &> /dev/null; then
    echo "   ✅ Installé: $(command -v code)"
    CODE_VERSION=$(code --version | head -n 1)
    echo "   📦 Version: $CODE_VERSION"
else
    echo "   ❌ Non trouvé"
fi
echo ""

# Statut du tunnel
echo "2️⃣ Statut du tunnel:"
if code tunnel status &> /dev/null; then
    STATUS=$(code tunnel status 2>&1)
    echo "   Raw: $STATUS"
    
    # Parser le JSON
    TUNNEL_NAME=$(echo "$STATUS" | jq -r '.tunnel.name // "null"')
    TUNNEL_STATE=$(echo "$STATUS" | jq -r '.tunnel.tunnel // "unknown"')
    STARTED_AT=$(echo "$STATUS" | jq -r '.tunnel.started_at // "never"')
    LAST_CONNECTED=$(echo "$STATUS" | jq -r '.tunnel.last_connected_at // "never"')
    
    echo "   Nom: $TUNNEL_NAME"
    echo "   État: $TUNNEL_STATE"
    echo "   Démarré: $STARTED_AT"
    echo "   Dernière connexion: $LAST_CONNECTED"
else
    echo "   ❌ Impossible de récupérer le statut"
fi
echo ""

# Service système
echo "3️⃣ Service système:"
if code tunnel service status &> /dev/null; then
    echo "   ✅ Service installé"
    SERVICE_STATUS=$(systemctl --user status code-tunnel 2>&1 | grep "Active:" | awk '{print $2, $3}' || echo "unknown")
    echo "   État systemd: $SERVICE_STATUS"
    
    # Dernières lignes des logs
    echo "   📄 Derniers logs (5 lignes):"
    journalctl --user -u code-tunnel -n 5 --no-pager 2>/dev/null | sed 's/^/      /' || echo "      (logs non disponibles)"
else
    echo "   ❌ Service non installé"
fi
echo ""

# Processus actifs
echo "4️⃣ Processus actifs:"
TUNNEL_PROCS=$(pgrep -af 'code.*tunnel' || echo "")
if [ -n "$TUNNEL_PROCS" ]; then
    echo "$TUNNEL_PROCS" | sed 's/^/   /'
else
    echo "   ❌ Aucun processus tunnel détecté"
fi
echo ""

# Connexions réseau
echo "5️⃣ Connexions réseau (tunnel):"
TUNNEL_CONNS=$(ss -tunap 2>/dev/null | grep -i tunnel || echo "")
if [ -n "$TUNNEL_CONNS" ]; then
    echo "$TUNNEL_CONNS" | sed 's/^/   /'
else
    echo "   ℹ️  Aucune connexion tunnel active"
fi
echo ""

# Résumé
echo "═════════════════════════════════════"
echo "📊 Résumé:"
if [ "$TUNNEL_STATE" = "Connected" ]; then
    echo "   ✅ Tunnel actif et connecté"
    echo "   🌐 Accès: https://vscode.dev/tunnel/$TUNNEL_NAME"
elif [ "$TUNNEL_STATE" = "Disconnected" ]; then
    echo "   ⚠️  Tunnel configuré mais déconnecté"
    echo "   💡 Pour démarrer: code tunnel service start"
else
    echo "   ❌ Tunnel non configuré"
    echo "   💡 Pour configurer: ./scripts/remote/setup-github-tunnel.sh"
fi
echo ""
