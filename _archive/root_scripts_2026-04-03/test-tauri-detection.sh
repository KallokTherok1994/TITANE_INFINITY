#!/usr/bin/env bash
# Test de détection Tauri dans l'application

echo "🔍 Test de Détection Tauri"
echo "══════════════════════════════════════════════"
echo ""

echo "1️⃣ Vérifier si Vite est actif..."
if curl -sf http://127.0.0.1:5173 > /dev/null 2>&1; then
    echo "   ✅ Vite actif sur port 5173"
else
    echo "   ❌ Vite non actif"
    exit 1
fi

echo ""
echo "2️⃣ Vérifier si Tauri est actif..."
TAURI_PROC=$(ps aux | grep "target/debug/titane-infinity" | grep -v grep | wc -l)
if [ "$TAURI_PROC" -gt 0 ]; then
    echo "   ✅ Processus Tauri actif"
    ps aux | grep "target/debug/titane-infinity" | grep -v grep | awk '{print "      PID:", $2}'
else
    echo "   ❌ Aucun processus Tauri"
    exit 1
fi

echo ""
echo "3️⃣ Vérifier Ollama..."
if curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama actif"
else
    echo "   ⚠️  Ollama non actif (optionnel)"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "✅ Système opérationnel!"
echo ""
echo "📋 Si le chat ne fonctionne toujours pas:"
echo ""
echo "1. Vérifiez que vous utilisez la FENÊTRE NATIVE (pas le navigateur)"
echo "   → Doit dire 'Titan-Dev [DEV]' dans le titre"
echo ""
echo "2. Ouvrez la console de développement:"
echo "   → Clic droit → Inspect"
echo "   → Onglet Console"
echo ""
echo "3. Testez dans la console:"
echo "   window.__TAURI__"
echo "   → Doit retourner un objet (pas undefined)"
echo ""
echo "4. Si undefined, rechargez l'app:"
echo "   → Ctrl+R dans la fenêtre native"
echo ""
