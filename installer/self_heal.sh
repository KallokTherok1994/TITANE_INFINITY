#!/bin/bash
# TITANE∞ OS - Self-Heal Engine

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ OS - Self-Heal Engine                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(dirname "$0")/.."
cd "$PROJECT_DIR"

ERRORS_FOUND=0

# 1. Vérifier les dépendances système
echo "🔍 [1/6] Vérification des dépendances système..."
bash installer/checks/check_dependencies.sh || ERRORS_FOUND=$((ERRORS_FOUND + 1))

# 2. Vérifier l'intégrité des fichiers
echo "📂 [2/6] Vérification de l'intégrité des fichiers..."
CRITICAL_FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/services/singularityBridge.ts"
    "src-tauri/tauri.conf.json"
    "src-tauri/src/main.rs"
    "index.html"
    "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier critique manquant: $file"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
done

# 3. Nettoyage des caches
echo "🧹 [3/6] Nettoyage des caches..."
rm -rf node_modules/.cache
rm -rf dist/
rm -rf src-tauri/target/debug
pnpm store prune
cargo clean 2>/dev/null || true

# 4. Réinstallation des dépendances
echo "📦 [4/6] Réinstallation des dépendances..."
pnpm install --force

# 5. Vérification de la compilation
echo "🔧 [5/6] Test de compilation..."
echo "  → Frontend..."
pnpm type-check || ERRORS_FOUND=$((ERRORS_FOUND + 1))

echo "  → Backend..."
cd src-tauri
cargo check --no-default-features 2>&1 | tee /tmp/cargo_check.log
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Erreurs de compilation Rust détectées"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi
cd ..

# 6. Vérification ESLint
echo "✨ [6/6] Vérification de la qualité du code..."
pnpm run lint || echo "⚠️  Warnings ESLint détectés (non-bloquant)"

# Rapport final
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
if [ $ERRORS_FOUND -eq 0 ]; then
    echo "║   ✅ TITANE∞ OS - Système sain (0 erreurs)              ║"
else
    echo "║   ⚠️  TITANE∞ OS - $ERRORS_FOUND erreur(s) détectée(s)             ║"
    echo "║      Consultez les logs ci-dessus                       ║"
fi
echo "╚══════════════════════════════════════════════════════════╝"

exit $ERRORS_FOUND
