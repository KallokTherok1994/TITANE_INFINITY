#!/bin/bash
# Script de test complet TITANE∞ v24

cd /home/titane/Documents/TITANE_INFINITY

echo "═══════════════════════════════════════════════════════════════"
echo "TITANE∞ v24 — Test Suite Complet"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "1️⃣ Vérification compilation..."
cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | tail -10
CHECK_STATUS=$?

if [ $CHECK_STATUS -ne 0 ]; then
    echo "❌ Erreurs de compilation détectées"
    exit 1
fi

echo "✅ Compilation OK"
echo ""

echo "2️⃣ Tests unitaires backend..."
cargo test --manifest-path src-tauri/Cargo.toml --lib 2>&1 | tee /tmp/titane_test_results.txt

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "RÉSUMÉ"
echo "═══════════════════════════════════════════════════════════════"
grep "test result:" /tmp/titane_test_results.txt

echo ""
echo "Tests terminés!"
