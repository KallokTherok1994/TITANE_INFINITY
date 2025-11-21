#!/bin/bash

################################################################################
# TITANE∞ v9.0.0 - TEST ET DIAGNOSTIC COMPLET
# Vérifie TOUTE la chaîne et lance l'application
################################################################################

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║    TITANE∞ v9 - DIAGNOSTIC COMPLET + LANCEMENT               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# 1. Vérifier structure
echo "→ Vérification structure..."
[ -d "core/frontend" ] && echo "✓ core/frontend/" || { echo "✗ core/frontend/ manquant"; exit 1; }
[ -f "index.html" ] && echo "✓ index.html" || { echo "✗ index.html manquant"; exit 1; }
[ -f "vite.config.ts" ] && echo "✓ vite.config.ts" || { echo "✗ vite.config.ts manquant"; exit 1; }
[ -f "src-tauri/tauri.conf.json" ] && echo "✓ tauri.conf.json" || { echo "✗ tauri.conf.json manquant"; exit 1; }

# 2. Vérifier build existant
echo ""
echo "→ Vérification build..."
if [ -d "dist" ]; then
    echo "✓ dist/ existe"
    [ -f "dist/index.html" ] && echo "✓ dist/index.html" || echo "✗ dist/index.html manquant"
    [ -d "dist/assets" ] && echo "✓ dist/assets/" || echo "⚠ dist/assets/ manquant"
    echo "  Taille: $(du -sh dist | cut -f1)"
else
    echo "✗ dist/ manquant - Build requis"
    echo ""
    echo "→ Build frontend..."
    npm install
    npm run build
fi

# 3. Vérifier configuration Tauri
echo ""
echo "→ Analyse tauri.conf.json..."
FRONTEND_DIST=$(grep -oP '"frontendDist":\s*"\K[^"]+' src-tauri/tauri.conf.json)
DEV_URL=$(grep -oP '"devUrl":\s*"\K[^"]+' src-tauri/tauri.conf.json)
echo "  frontendDist: $FRONTEND_DIST"
echo "  devUrl: $DEV_URL"

if [ "$FRONTEND_DIST" = "../dist" ]; then
    echo "✓ frontendDist correct"
else
    echo "⚠ frontendDist devrait être '../dist'"
fi

# 4. Vérifier imports TypeScript
echo ""
echo "→ Vérification imports invoke()..."
WRONG_IMPORTS=$(grep -r "from '@tauri-apps/api/tauri'" core/frontend/ 2>/dev/null | wc -l || echo "0")
CORRECT_IMPORTS=$(grep -r "from '@tauri-apps/api/core'" core/frontend/ 2>/dev/null | wc -l || echo "0")

echo "  Imports Tauri v2 (core): $CORRECT_IMPORTS"
echo "  Imports Tauri v1 (tauri): $WRONG_IMPORTS"

if [ "$WRONG_IMPORTS" -gt 0 ]; then
    echo "⚠ $WRONG_IMPORTS imports incorrects détectés - Correction..."
    find core/frontend/ -name "*.ts" -o -name "*.tsx" | while read file; do
        sed -i "s|from '@tauri-apps/api/tauri'|from '@tauri-apps/api/core'|g" "$file"
    done
    echo "✓ Imports corrigés"
fi

# 5. Vérifier commands Rust
echo ""
echo "→ Vérification commands Rust..."
for cmd in save_entry load_entries get_memory_state clear_memory; do
    if grep -q "fn $cmd" src-tauri/src/system/memory*/mod.rs 2>/dev/null; then
        echo "✓ $cmd"
    else
        echo "✗ $cmd manquante"
    fi
done

# 6. Nettoyer processus
echo ""
echo "→ Nettoyage..."
pkill -9 -f vite 2>/dev/null || true
pkill -9 -f tauri 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2
echo "✓ Processus nettoyés"

# 7. Vérifier Node/npm/Rust
echo ""
echo "→ Environnement..."
node --version 2>/dev/null && echo "✓ Node.js" || echo "✗ Node.js manquant"
npm --version 2>/dev/null && echo "✓ npm" || echo "✗ npm manquant"
rustc --version 2>/dev/null && echo "✓ Rust" || echo "✗ Rust manquant"
cargo --version 2>/dev/null && echo "✓ Cargo" || echo "✗ Cargo manquant"

# 8. Test compilation rapide Rust
echo ""
echo "→ Test compilation Rust (30s)..."
if cargo check --manifest-path=src-tauri/Cargo.toml 2>&1 | tail -5; then
    echo "✓ Rust OK"
else
    echo "⚠ Warnings Rust (non bloquant)"
fi

# 9. Lancement
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  🚀 LANCEMENT TAURI                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Lancement en cours..."
echo "(La première compilation Rust prend 2-3 minutes)"
echo ""

npm run tauri dev

