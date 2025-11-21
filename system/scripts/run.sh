#!/bin/bash
# TITANE∞ v8.0 - Run Development Server

set -e

echo "🚀 TITANE∞ v8.0 - Démarrage en mode développement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/../.."

echo "▶️  Démarrage de Tauri..."
echo ""
npm run tauri:dev
