#!/bin/bash

# 🌐 TITANE∞ Network Deployment Script
# Démarre le serveur Vite accessible sur le réseau local

set -e

echo "🌐 TITANE∞ Network Deployment"
echo "=============================="
echo ""

# Obtenir l'IP locale
LOCAL_IP=$(ip addr show | grep -E "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Erreur: Impossible de détecter l'adresse IP locale"
    exit 1
fi

echo "📡 Adresse IP locale détectée: $LOCAL_IP"
echo ""

# Port par défaut Vite
PORT=4000

echo "🚀 Démarrage du serveur de développement..."
echo "   - Host: 0.0.0.0 (toutes les interfaces)"
echo "   - Port: $PORT"
echo ""
echo "✅ Accès réseau disponible sur:"
echo "   - Local:   http://localhost:$PORT"
echo "   - Réseau:  http://$LOCAL_IP:$PORT"
echo ""
echo "📱 Sur vos autres appareils (même WiFi):"
echo "   Ouvrez:  http://$LOCAL_IP:$PORT"
echo ""

# Générer un QR code si possible
if command -v qrencode &> /dev/null; then
    echo "📱 QR Code (scannez depuis mobile):"
    qrencode -t ANSIUTF8 "http://$LOCAL_IP:$PORT"
    echo ""
fi

echo "🔒 Note: Assurez-vous que le firewall autorise le port $PORT"
echo "   Firewall actuel: $(sudo ufw status 2>/dev/null | head -1 || echo 'Non configuré')"
echo ""
echo "⏳ Lancement de Vite en mode réseau..."
echo ""

# Lancer Vite directement (sans Tauri pour dev frontend)
pnpm vite --host 0.0.0.0 --port $PORT --open

