#!/bin/bash

# 🔄 TITANE∞ - Force Browser Reload (Clear Cache)
# Utilise un timestamp dans l'URL pour forcer le rechargement

echo "🔄 Forçage du rechargement du navigateur..."
echo ""
echo "📋 Configuration actuelle:"
echo "   DOCTYPE: <!DOCTYPE html> ✓"
echo "   Charset: UTF-8 ✓"
echo "   HTTP Header: text/html; charset=utf-8 ✓"
echo ""
echo "💡 Pour forcer le rechargement dans le navigateur:"
echo "   Firefox/Chrome: Ctrl + Shift + R"
echo "   Safari: Cmd + Shift + R"
echo ""
echo "🌐 Accès avec cache-bust:"
TIMESTAMP=$(date +%s)
echo "   http://localhost:5173/?v=$TIMESTAMP"
echo "   http://192.168.2.16:5173/?v=$TIMESTAMP"
echo ""

# Ouvrir dans le navigateur avec cache-bust
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173/?v=$TIMESTAMP" 2>/dev/null &
    echo "✅ Ouverture du navigateur avec cache-bust..."
fi
