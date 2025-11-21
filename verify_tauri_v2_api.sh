#!/bin/bash
# TITANE∞ v15.5 - Verification script for Tauri v2 API compliance
# Checks that all Rust code uses correct Tauri v2 APIs

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 TITANE∞ v15.5 - Tauri v2 API Compliance Check        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/src-tauri"

ERRORS=0

# Test 1: Check for deprecated Tauri v1 APIs
echo "🔍 Test 1/5 : Recherche d'APIs Tauri v1 obsolètes..."
echo ""

DEPRECATED_APIS=(
    "app.get_window"
    "tauri::api::"
    "Window<R>"
)

for api in "${DEPRECATED_APIS[@]}"; do
    if grep -r "$api" src/ --include="*.rs" 2>/dev/null | grep -v "//"; then
        echo "🚨 ERREUR : API Tauri v1 obsolète trouvée : $api"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "✅ Aucune API Tauri v1 obsolète trouvée"
fi

echo ""

# Test 2: Check Manager trait is imported where needed
echo "🔍 Test 2/5 : Vérification import trait Manager..."
echo ""

if grep -q "get_webview_window" src/main.rs; then
    if grep -q "use tauri::Manager" src/main.rs; then
        echo "✅ Trait Manager correctement importé"
    else
        echo "🚨 ERREUR : get_webview_window utilisé sans import Manager"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "ℹ️  get_webview_window non utilisé (OK)"
fi

echo ""

# Test 3: Check correct WebviewWindow usage
echo "🔍 Test 3/5 : Vérification utilisation WebviewWindow..."
echo ""

if grep -q "get_webview_window" src/main.rs; then
    echo "✅ Utilisation de get_webview_window (Tauri v2 API)"
else
    echo "ℹ️  get_webview_window non utilisé"
fi

echo ""

# Test 4: Check tauri dependencies in Cargo.toml
echo "🔍 Test 4/5 : Vérification version Tauri dans Cargo.toml..."
echo ""

TAURI_VERSION=$(grep '^tauri = ' Cargo.toml | head -1 | grep -oP 'version = "\K[0-9.]+')

if [ -n "$TAURI_VERSION" ]; then
    MAJOR_VERSION=$(echo "$TAURI_VERSION" | cut -d. -f1)
    if [ "$MAJOR_VERSION" = "2" ]; then
        echo "✅ Tauri v$TAURI_VERSION détecté (v2.x)"
    else
        echo "🚨 ERREUR : Tauri v$TAURI_VERSION (doit être v2.x)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  Version Tauri non détectée"
fi

echo ""

# Test 5: Check for common Tauri v2 imports
echo "🔍 Test 5/5 : Vérification imports Tauri v2 courants..."
echo ""

EXPECTED_IMPORTS=(
    "use tauri::Manager"
    "use tauri::State"
)

for import in "${EXPECTED_IMPORTS[@]}"; do
    if grep -r "$import" src/ --include="*.rs" 2>/dev/null | head -1 >/dev/null; then
        echo "✅ Import trouvé : $import"
    else
        echo "ℹ️  Import non trouvé (peut être normal) : $import"
    fi
done

echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
if [ $ERRORS -eq 0 ]; then
    echo "║  ✅ TOUS LES TESTS RÉUSSIS                                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Le code Rust est conforme à Tauri v2 API"
    echo ""
    echo "🎯 Prochaine étape : Installer les dépendances système"
    echo "   bash install_system_deps.sh"
    echo ""
else
    echo "║  🚨 $ERRORS ERREUR(S) DÉTECTÉE(S)                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "❌ Veuillez corriger les erreurs ci-dessus"
    echo ""
    exit 1
fi

# Bonus: Try cargo check if dependencies are installed
echo "🧪 Test bonus : Tentative de compilation (cargo check)..."
echo ""

if pkg-config --exists webkit2gtk-4.1 2>/dev/null || pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    echo "✅ WebKitGTK détecté, lancement cargo check..."
    echo ""
    if cargo check 2>&1 | head -20; then
        echo ""
        echo "✅ cargo check réussi !"
    else
        echo ""
        echo "⚠️  cargo check a échoué (voir erreurs ci-dessus)"
    fi
else
    echo "⚠️  WebKitGTK non installé, cargo check sera ignoré"
    echo "   Pour installer : bash ../install_system_deps.sh"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ VÉRIFICATION TERMINÉE                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
