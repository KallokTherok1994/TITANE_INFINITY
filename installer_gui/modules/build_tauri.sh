#!/bin/bash
# TITANE∞ OS - Build Tauri

echo "🌓 Build de l'application Tauri..."

PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"
cd "$PROJECT_DIR"

# Vérifier que le frontend est build
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Frontend non compilé (dist/ manquant)"
    exit 1
fi

# Build Tauri (sans bundle pour garder binaire simple)
echo "📦 Packaging Tauri..."
pnpm tauri build --no-bundle

echo "✅ Application Tauri compilée"
exit 0
