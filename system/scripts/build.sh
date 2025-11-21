#!/bin/bash
# TITANE∞ v8.0 - Build Script for Production

set -e

echo "🏗️  TITANE∞ v8.0 - Build Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/../.."

# Type check
echo "📋 Vérification TypeScript..."
npm run type-check

# Build frontend
echo "⚛️  Build du frontend React..."
npm run build

# Build Tauri application
echo "🦀 Build de l'application Tauri..."
npm run tauri:build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build terminé avec succès!"
echo ""
echo "Les binaires sont dans: src-tauri/target/release/"
