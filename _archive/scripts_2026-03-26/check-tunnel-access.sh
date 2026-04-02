#!/bin/bash
# TITANE∞ - Afficher l'URL d'accès public du tunnel

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           TITANE∞ - Tunnel Public Access                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si cloudflared est actif
if pgrep -af "cloudflared tunnel" > /dev/null; then
    echo "✅ Tunnel Cloudflare ACTIF"
    echo ""
    echo "📱 Accès local:"
    echo "   http://localhost:5173"
    echo ""
    echo "🌐 Accès public:"
    echo "   https://[URL].trycloudflare.com"
    echo ""
    echo "💡 Pour voir l'URL exact, exécutez:"
    echo "   curl -I http://localhost:5173 2>&1 | grep -i location"
    echo "   ou vérifiez les logs récents du tunnel"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "Processus cloudflared:"
    ps aux | grep -E "cloudflared" | grep -v grep | awk '{print "   PID " $2 ": " $11 " " $12 " " $13}'
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "⏸️  Pour arrêter le tunnel:"
    echo "   pkill -f 'cloudflared tunnel'"
    echo ""
else
    echo "❌ Aucun tunnel Cloudflare actif"
    echo ""
    echo "🚀 Pour lancer le tunnel:"
    echo "   nohup cloudflared tunnel --url http://localhost:5173 > .tunnel-access.txt 2>&1 &"
    echo ""
fi

echo "🔐 IMPORTANT:"
echo "   ⚠️  Ce tunnel est PUBLIC et sans authentification"
echo "   ⚠️  À utiliser UNIQUEMENT pour le développement"
echo "   ⚠️  Ollama (local) n'est PAS exposé"
echo ""
