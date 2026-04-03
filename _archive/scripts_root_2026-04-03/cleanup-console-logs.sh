#!/bin/bash
# TITANE∞ - Console.log Cleanup Script
# Remplace les console.log par le logger centralisé

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   TITANE∞ - Console.log Cleanup Automation          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

# Compte initial
INITIAL_COUNT=$(grep -r "console\.\(log\|warn\|error\)" src/hooks --include="*.ts" --include="*.tsx" | wc -l)
echo -e "\n${YELLOW}📊 Console.log initiaux: ${INITIAL_COUNT}${NC}"

# Liste des fichiers à nettoyer (sans logger)
FILES_TO_CLEAN=$(grep -r "console\.\(log\|warn\|error\)" src/hooks --include="*.ts" --include="*.tsx" -l | \
  while read file; do
    if ! grep -q "createLogger\|from '@/utils/logger'" "$file"; then
      echo "$file"
    fi
  done)

COUNT=0
for FILE in $FILES_TO_CLEAN; do
  BASENAME=$(basename "$FILE" .ts)
  BASENAME=$(basename "$BASENAME" .tsx)

  # Convertir kebab-case ou snake_case en PascalCase pour le logger
  LOGGER_NAME=$(echo "$BASENAME" | sed -E 's/^use//; s/(^|_|-)([a-z])/\U\2/g')

  echo -e "\n${YELLOW}[$(( COUNT + 1 ))] Cleaning: $FILE${NC}"
  echo -e "   Logger name: ${GREEN}$LOGGER_NAME${NC}"

  # Vérifier si le fichier a déjà un logger
  if grep -q "createLogger\|from '@/utils/logger'" "$FILE"; then
    echo -e "   ${GREEN}✓${NC} Already has logger, skipping import"
  else
    # Ajouter l'import du logger après les derniers imports React
    sed -i "/^import.*from 'react';$/a\\import { createLogger } from '@/utils/logger';\n\nconst logger = createLogger('$LOGGER_NAME');" "$FILE"
    echo -e "   ${GREEN}✓${NC} Added logger import"
  fi

  COUNT=$(( COUNT + 1 ))
done

FINAL_COUNT=$(grep -r "console\.\(log\|warn\|error\)" src/hooks --include="*.ts" --include="*.tsx" | wc -l)
CLEANED=$(( INITIAL_COUNT - FINAL_COUNT ))

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Cleanup Summary                                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}Files processed: ${COUNT}${NC}"
echo -e "${YELLOW}Initial console.log: ${INITIAL_COUNT}${NC}"
echo -e "${YELLOW}Final console.log: ${FINAL_COUNT}${NC}"
echo -e "${GREEN}Cleaned: ${CLEANED}${NC}"

echo -e "\n${GREEN}✅ Cleanup complete!${NC}"
echo -e "${YELLOW}Note: Manual replacements still needed (console.log → logger.debug, etc.)${NC}"
