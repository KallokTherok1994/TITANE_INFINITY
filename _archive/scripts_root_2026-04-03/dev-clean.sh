#!/bin/bash
# TITANE∞ v26.3.0 — Script de nettoyage cache développement
echo "🧹 TITANE∞ - Nettoyage cache développement"

# Supprimer caches Vite
echo "Suppression cache Vite..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf src-tauri/target/debug # Cache Rust dev
rm -rf /tmp/tauri-*

# Supprimer node_modules si nécessaire (optionnel)
if [ "$1" = "--full" ]; then
  echo "Suppression node_modules..."
  rm -rf node_modules
  echo "Réinstallation des dépendances..."
  pnpm install
fi

# Nettoyer les logs temporaires
rm -f /tmp/boot-test.log
rm -f dev_tauri_*.log

echo "✅ Nettoyage terminé"