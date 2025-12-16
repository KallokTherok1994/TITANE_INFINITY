#!/bin/bash

# TITANE∞ - Diagnostic Chat IA & DevTools
# Script de vérification rapide

echo "════════════════════════════════════════════════════════════════"
echo "  🔍 DIAGNOSTIC CHAT IA & DEVTOOLS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 1. Vérifier configuration DevTools
echo "📋 1. Vérification DevTools dans tauri.conf.json..."
devtools_main=$(grep -A 15 '"label": "main"' src-tauri/tauri.conf.json | grep '"devtools"' | grep -o 'true\|false')
devtools_avatar=$(grep -A 15 '"label": "avatar-floating"' src-tauri/tauri.conf.json | grep '"devtools"' | grep -o 'true\|false')

if [ "$devtools_main" = "true" ]; then
    echo "   ✅ Main window: devtools ENABLED"
else
    echo "   ❌ Main window: devtools DISABLED"
fi

if [ "$devtools_avatar" = "true" ]; then
    echo "   ✅ Avatar window: devtools ENABLED"
else
    echo "   ❌ Avatar window: devtools DISABLED"
fi
echo ""

# 2. Vérifier commandes Chat IA dans main.rs
echo "📋 2. Vérification commandes Chat IA dans main.rs..."
if grep -q "chat_send_message" src-tauri/src/main.rs; then
    echo "   ✅ chat_send_message: REGISTERED"
else
    echo "   ❌ chat_send_message: NOT FOUND"
fi

if grep -q "chat_stream_message" src-tauri/src/main.rs; then
    echo "   ✅ chat_stream_message: REGISTERED"
else
    echo "   ❌ chat_stream_message: NOT FOUND"
fi
echo ""

# 3. Vérifier implémentation Chat Orchestrator
echo "📋 3. Vérification Chat Orchestrator..."
if [ -f "src-tauri/src/overdrive/chat_orchestrator.rs" ]; then
    echo "   ✅ chat_orchestrator.rs: EXISTS"

    # Vérifier providers
    if grep -q "gemini" src-tauri/src/overdrive/chat_orchestrator.rs; then
        echo "   ✅ Gemini provider: IMPLEMENTED"
    fi

    if grep -q "ollama" src-tauri/src/overdrive/chat_orchestrator.rs; then
        echo "   ✅ Ollama provider: IMPLEMENTED"
    fi

    if grep -q "local_echo" src-tauri/src/overdrive/chat_orchestrator.rs; then
        echo "   ✅ Local echo fallback: IMPLEMENTED"
    fi
else
    echo "   ❌ chat_orchestrator.rs: NOT FOUND"
fi
echo ""

# 4. Vérifier frontend providers
echo "📋 4. Vérification Frontend Chat Providers..."
if [ -f "src/services/ai/providers/tauriChat.ts" ]; then
    echo "   ✅ tauriChat.ts: EXISTS"
else
    echo "   ❌ tauriChat.ts: NOT FOUND"
fi

if [ -f "src/services/tauriCommands.ts" ]; then
    if grep -q "chat_send_message" src/services/tauriCommands.ts; then
        echo "   ✅ chat_send_message: REGISTERED in frontend"
    fi
fi
echo ""

# 5. Vérifier devUrl configuration
echo "📋 5. Vérification devUrl..."
devUrl=$(grep '"devUrl"' src-tauri/tauri.conf.json | grep -o 'http://[^"]*\|tauri://[^"]*')
echo "   Current devUrl: $devUrl"

if [[ "$devUrl" == "http://localhost:"* ]]; then
    echo "   ❌ devUrl: INCORRECT (TAURI-ONLY: pas de devUrl HTTP)"
elif [[ "$devUrl" == "tauri://"* ]]; then
    echo "   ✅ devUrl: CORRECT (TAURI-ONLY)"
else
    echo "   ✅ devUrl: NON DÉFINI (OK en TAURI-ONLY)"
fi
echo ""

# 6. Test compilation rapide (Rust)
echo "📋 6. Test compilation Rust (quick check)..."
cd src-tauri
if cargo check --message-format=short 2>&1 | grep -q "Finished"; then
    echo "   ✅ Rust backend: COMPILES OK"
else
    echo "   ❌ Rust backend: COMPILATION ERRORS"
    echo "   Run: cd src-tauri && cargo check"
fi
cd ..
echo ""

# 7. Résumé
echo "════════════════════════════════════════════════════════════════"
echo "  📊 RÉSUMÉ"
echo "════════════════════════════════════════════════════════════════"

# Compteurs
ok_count=0
warn_count=0
error_count=0

# Check DevTools
if [ "$devtools_main" = "true" ]; then ((ok_count++)); else ((error_count++)); fi
if [ "$devtools_avatar" = "true" ]; then ((ok_count++)); else ((warn_count++)); fi

# Check commands
if grep -q "chat_send_message" src-tauri/src/main.rs; then ((ok_count++)); else ((error_count++)); fi
if grep -q "chat_stream_message" src-tauri/src/main.rs; then ((ok_count++)); else ((error_count++)); fi

# Check orchestrator
if [ -f "src-tauri/src/overdrive/chat_orchestrator.rs" ]; then ((ok_count++)); else ((error_count++)); fi

# Check frontend
if [ -f "src/services/ai/providers/tauriChat.ts" ]; then ((ok_count++)); else ((error_count++)); fi

# Check devUrl
if [[ "$devUrl" == "http://localhost:"* ]]; then ((ok_count++)); else ((warn_count++)); fi

echo "   ✅ OK: $ok_count"
echo "   ⚠️  Warnings: $warn_count"
echo "   ❌ Errors: $error_count"
echo ""

if [ $error_count -eq 0 ] && [ $warn_count -eq 0 ]; then
    echo "   🎉 Tous les tests passés! Le Chat IA devrait fonctionner."
    echo ""
    echo "   💡 Pour tester:"
    echo "      1. npm run tauri:dev"
    echo "      2. Ouvrir Chat IA dans l'app"
    echo "      3. F12 pour DevTools"
    echo "      4. Envoyer un message test"
elif [ $error_count -eq 0 ]; then
    echo "   ⚠️  Warnings détectés, vérifier les recommandations ci-dessus."
else
    echo "   ❌ Erreurs critiques détectées! Corriger avant de lancer."
fi

echo "════════════════════════════════════════════════════════════════"
