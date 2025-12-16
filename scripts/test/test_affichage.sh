#!/bin/bash

# TITANE∞ v17.3 - Script de test rapide (écran blanc)
# Ce script teste que l'app s'affiche correctement

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🧪 TITANE∞ v17.3 - TEST RAPIDE AFFICHAGE                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Étape 1: Build
echo "📦 [1/3] Build frontend..."
pnpm run build 2>&1 | tail -5

# Étape 2: Vérifier dist/index.html
echo ""
echo "🔍 [2/3] Vérification dist/index.html..."
if [ -f "dist/index.html" ]; then
  echo "✅ dist/index.html existe"

  # Vérifier que <div id="root"> est présent
  if grep -q '<div id="root">' dist/index.html; then
    echo "✅ <div id='root'> trouvé"
  else
    echo "❌ <div id='root'> MANQUANT !"
    exit 1
  fi

  # Vérifier les scripts
  if grep -q '<script' dist/index.html; then
    echo "✅ Scripts JS trouvés"
  else
    echo "❌ Scripts JS MANQUANTS !"
    exit 1
  fi

  # Afficher les assets
  echo ""
  echo "📁 Assets générés:"
  ls -lh dist/assets/ | tail -5
else
  echo "❌ dist/index.html n'existe pas !"
  exit 1
fi

# Étape 3: Lancer Tauri
echo ""
echo "🚀 [3/3] Lancement Tauri..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VÉRIFICATIONS À FAIRE DANS L'APP:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. ✅ La fenêtre s'ouvre"
echo "  2. ✅ L'interface est visible (PAS d'écran blanc)"
echo "  3. ✅ Le Dashboard ou l'AppMinimal s'affiche"
echo "  4. ✅ Les boutons/navigation fonctionnent"
echo ""
echo "  📋 Si écran blanc:"
echo "     - Appuyez sur F12 pour ouvrir DevTools"
echo "     - Vérifiez la console (logs de boot)"
echo "     - Vérifiez l'onglet Elements (DOM structure)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Option: Lancer en mode production build
pnpm tauri dev
