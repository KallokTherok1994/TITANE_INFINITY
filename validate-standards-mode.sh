#!/bin/bash

# TITANE∞ - Script de validation Standards Mode & Charset

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     TITANE∞ - Tests de Validation Standards Mode & Charset     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Test 1: DOCTYPE (Standards Mode)"
echo "─────────────────────────────────────────────────────────────────"
DOCTYPE=$(curl -s http://localhost:5173 | grep -o 'DOCTYPE html')
if [ -n "$DOCTYPE" ]; then
    echo "✅ <!DOCTYPE html> détecté"
else
    echo "❌ DOCTYPE non trouvé"
fi
echo ""

echo "📋 Test 2: Meta Charset"
echo "─────────────────────────────────────────────────────────────────"
CHARSET=$(curl -s http://localhost:5173 | grep 'charset="UTF-8"')
if [ -n "$CHARSET" ]; then
    echo "✅ Charset UTF-8 déclaré dans meta tags"
else
    echo "❌ Charset UTF-8 non trouvé"
fi
echo ""

echo "📋 Test 3: HTTP Content-Type Header"
echo "─────────────────────────────────────────────────────────────────"
CONTENT_TYPE=$(curl -I http://localhost:5173 2>&1 | grep "Content-Type: text/html; charset=utf-8")
if [ -n "$CONTENT_TYPE" ]; then
    echo "✅ Content-Type: text/html; charset=utf-8"
else
    echo "⚠️  Header Content-Type différent"
    curl -I http://localhost:5173 2>&1 | grep "Content-Type:"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ VALIDATION TERMINÉE                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Si vous voyez encore des warnings de Quirks Mode:"
echo "   → Videz le cache du navigateur: Ctrl + Shift + R"
echo "   → Ou utilisez le mode navigation privée"
echo ""
