#!/bin/bash
# TITANE∞ OS - Build Frontend

echo "🎨 Compilation du Frontend..."

PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"
cd "$PROJECT_DIR"

# Installer dépendances
echo "📦 Installation des dépendances npm..."
pnpm install

# Build
echo "🏗️  Build Vite..."
pnpm build

if [ ! -d "dist" ]; then
    echo "❌ Erreur: Build frontend échoué"
    exit 1
fi

echo "✅ Frontend compilé avec succès"
exit 0
