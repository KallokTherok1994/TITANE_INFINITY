#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ - Script de correction automatique des apostrophes JSX
# Remplace les apostrophes non échappées dans le contenu JSX par &apos;
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📝 Correction automatique des apostrophes JSX...${NC}"

# Fonction pour échapper les apostrophes dans le contenu JSX
fix_apostrophes_in_file() {
  local file="$1"
  
  # Patterns à corriger (apostrophes dans le contenu JSX, pas dans le code TS)
  # Ne touche PAS aux strings TypeScript, uniquement au contenu JSX entre > et <
  
  # Sauvegarde temporaire
  cp "$file" "$file.bak"
  
  # Remplacement des apostrophes dans le contenu JSX
  # Pattern: cherche les textes entre balises > ... < contenant des apostrophes
  sed -i "s/\([>]\)\([^<]*\)'\([^<]*\)\([<]\)/\1\2\&apos;\3\4/g" "$file"
  
  # Vérifier si le fichier a changé
  if cmp -s "$file" "$file.bak"; then
    rm "$file.bak"
    return 1  # Aucun changement
  else
    rm "$file.bak"
    echo -e "${GREEN}  ✅ $file${NC}"
    return 0  # Modifié
  fi
}

# Trouver tous les fichiers avec des warnings react/no-unescaped-entities
FILES_TO_FIX=$(pnpm eslint src --format=compact 2>&1 | grep "react/no-unescaped-entities" | cut -d: -f1 | sort -u)

if [ -z "$FILES_TO_FIX" ]; then
  echo -e "${GREEN}✨ Aucune apostrophe à corriger!${NC}"
  exit 0
fi

FIXED_COUNT=0
TOTAL_FILES=$(echo "$FILES_TO_FIX" | wc -l)

echo -e "${YELLOW}📁 $TOTAL_FILES fichiers à traiter...${NC}"

for file in $FILES_TO_FIX; do
  if [ -f "$file" ]; then
    if fix_apostrophes_in_file "$file"; then
      ((FIXED_COUNT++))
    fi
  fi
done

echo ""
echo -e "${GREEN}🎉 Correction terminée!${NC}"
echo -e "${GREEN}   $FIXED_COUNT/$TOTAL_FILES fichiers modifiés${NC}"
echo ""
echo -e "${YELLOW}🔍 Vérification finale...${NC}"

# Vérifier que les warnings ont diminué
REMAINING=$(pnpm eslint src --format=compact 2>&1 | grep "react/no-unescaped-entities" | wc -l)
echo -e "${GREEN}📊 Warnings restants: $REMAINING${NC}"

if [ "$REMAINING" -eq 0 ]; then
  echo -e "${GREEN}✅ TOUS les warnings apostrophes éliminés!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Certains warnings nécessitent une correction manuelle${NC}"
  exit 0
fi
