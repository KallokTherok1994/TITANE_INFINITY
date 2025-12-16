#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TITANE∞ v24 — VÉRIFICATION POST-FIX DIALOG PLUGIN
# Auto-vérification complète après installation plugin
# ═══════════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ v24 — POST-FIX VERIFICATION                        ║"
echo "║   Dialog Plugin + File Import System                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_pass() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "✅ $1"
}

check_fail() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo "❌ $1"
}

echo "═══════════════════════════════════════════════════════════════"
echo "1. VÉRIFICATION NODE_MODULES"
echo "═══════════════════════════════════════════════════════════════"

if [ -d "node_modules/@tauri-apps/plugin-dialog" ]; then
    check_pass "Plugin dialog présent dans node_modules"
else
    check_fail "Plugin dialog ABSENT de node_modules"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "2. VÉRIFICATION PACKAGE.JSON"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "@tauri-apps/plugin-dialog" package.json; then
    check_pass "Dialog référencé dans package.json"
else
    check_fail "Dialog ABSENT de package.json"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "3. VÉRIFICATION CARGO.TOML"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "tauri-plugin-dialog" src-tauri/Cargo.toml; then
    check_pass "tauri-plugin-dialog dans Cargo.toml"
else
    check_fail "tauri-plugin-dialog ABSENT de Cargo.toml"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "4. VÉRIFICATION MAIN.RS"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "tauri_plugin_dialog::init()" src-tauri/src/main.rs; then
    check_pass "Plugin dialog enregistré dans main.rs"
else
    check_fail "Plugin dialog NON enregistré dans main.rs"
fi

if grep -q "import_file" src-tauri/src/main.rs; then
    check_pass "Commande import_file enregistrée"
else
    check_fail "Commande import_file ABSENTE"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "5. VÉRIFICATION TAURI.CONF.JSON"
echo "═══════════════════════════════════════════════════════════════"

if grep -q '"dialog"' src-tauri/tauri.conf.json; then
    check_pass "Plugin dialog configuré dans tauri.conf.json"
else
    check_fail "Plugin dialog NON configuré"
fi

if grep -q "dialog:allow-open" src-tauri/tauri.conf.json; then
    check_pass "Permissions dialog activées"
else
    check_fail "Permissions dialog ABSENTES"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "6. VÉRIFICATION CHATINPUT.TSX"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "@tauri-apps/plugin-dialog" src/features/chat/ChatInput.tsx; then
    check_pass "Import dialog dans ChatInput.tsx"
else
    check_fail "Import dialog ABSENT de ChatInput.tsx"
fi

if grep -q "handleFileImport" src/features/chat/ChatInput.tsx; then
    check_pass "Handler handleFileImport présent"
else
    check_fail "Handler handleFileImport ABSENT"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "7. VÉRIFICATION MOCK_COMMANDS.RS"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "pub async fn import_file" src-tauri/src/mock_commands.rs; then
    check_pass "Commande import_file implémentée"
else
    check_fail "Commande import_file NON implémentée"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "RÉSULTAT FINAL"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Total: $TOTAL_CHECKS checks"
echo "Passed: $PASSED_CHECKS ✅"
echo "Failed: $FAILED_CHECKS ❌"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   🎉 TOUTES LES VÉRIFICATIONS RÉUSSIES                       ║"
    echo "║   Plugin Dialog installé et configuré correctement          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. pnpm install (si dialog absent de node_modules)"
    echo "   2. pnpm run dev (test mode dev)"
    echo "   3. Tester bouton import fichier dans Chat"
    echo ""
    exit 0
else
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   ⚠️  CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ                     ║"
    echo "║   Exécuter: pnpm install && cargo build                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
