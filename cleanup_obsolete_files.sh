#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ v∞ - Cleanup Script
# Suppression des fichiers obsolètes détectés
# ═══════════════════════════════════════════════════════════════════

echo "🧹 TITANE∞ Cleanup - Suppression fichiers obsolètes"
echo "═══════════════════════════════════════════════════════════════"

# Fichiers identifiés comme inutilisés
OBSOLETE_FILES=(
  "src/components/ChatInput.tsx"
)

# Fonction de suppression sécurisée
remove_file() {
  local file=$1
  if [ -f "$file" ]; then
    echo "🗑️  Suppression: $file"
    rm "$file"
    echo "   ✅ Supprimé"
  else
    echo "⚠️  Fichier non trouvé: $file"
  fi
}

# Suppression des fichiers
for file in "${OBSOLETE_FILES[@]}"; do
  remove_file "$file"
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Cleanup terminé !"
echo ""
echo "Fichiers supprimés: ${#OBSOLETE_FILES[@]}"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifier compilation TypeScript: pnpm tsc --noEmit"
echo "2. Vérifier imports cassés"
echo "3. Tester l'application"
