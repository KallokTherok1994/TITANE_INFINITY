#!/usr/bin/env bash
# TITANE∞ - Finaliser l'authentification du tunnel service
set -euo pipefail

echo "🔐 TITANE∞ - Finalisation Authentification Tunnel"
echo "═════════════════════════════════════════════════"
echo ""

# Vérifier le statut actuel
STATUS=$(code tunnel status 2>&1)
SERVICE_INSTALLED=$(echo "$STATUS" | jq -r '.service_installed // false')
TUNNEL_NAME=$(echo "$STATUS" | jq -r '.tunnel.name // "null"')

if [ "$SERVICE_INSTALLED" = "false" ]; then
    echo "❌ Aucun service tunnel installé"
    echo ""
    echo "💡 Installez d'abord le service :"
    echo "   ./install-tunnel-service.sh"
    exit 1
fi

if [ "$TUNNEL_NAME" != "null" ]; then
    echo "✅ Tunnel déjà configuré : $TUNNEL_NAME"
    echo ""
    ./show-tunnel-info.sh
    exit 0
fi

echo "⚠️  Le service tunnel est installé mais pas encore authentifié"
echo ""
echo "📋 Étapes pour finaliser :"
echo ""
echo "1️⃣  Arrêter le service actuel :"
echo "    code tunnel service stop"
echo ""
echo "2️⃣  Démarrer une session interactive pour authentifier :"
echo "    code tunnel --name titane-infinity-$(hostname)"
echo ""
echo "3️⃣  Suivre les instructions pour authentifier sur GitHub"
echo ""
echo "4️⃣  Une fois authentifié, arrêter avec Ctrl+C"
echo ""
echo "5️⃣  Redémarrer le service :"
echo "    code tunnel service start"
echo ""
echo "═════════════════════════════════════════════════"
echo ""

read -p "Voulez-vous exécuter ces étapes maintenant ? [y/N]: " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 0
fi

echo ""
echo "🔄 Étape 1/5 : Arrêt du service..."
code tunnel service stop || true
sleep 2

echo ""
echo "🔑 Étape 2/5 : Démarrage de la session interactive..."
echo ""
echo "⚠️  IMPORTANT :"
echo "   - Une fenêtre de navigateur va s'ouvrir"
echo "   - Authentifiez-vous sur GitHub"
echo "   - Attendez que le tunnel soit 'Connected'"
echo "   - Appuyez sur Ctrl+C pour continuer"
echo ""
read -p "Appuyez sur Entrée pour continuer..." 

TUNNEL_NAME="titane-infinity-$(hostname)"
echo ""
echo "🚀 Lancement du tunnel : $TUNNEL_NAME"
echo ""

# Lancer le tunnel en mode interactif
# L'utilisateur doit faire Ctrl+C après authentification
code tunnel --name "$TUNNEL_NAME" --accept-server-license-terms || true

echo ""
echo "✅ Authentification terminée"
echo ""
echo "🔄 Étape 5/5 : Redémarrage du service..."
code tunnel service start

sleep 3

echo ""
echo "✅ Configuration terminée !"
echo ""

# Afficher les infos finales
./show-tunnel-info.sh
