#!/bin/bash
# Test Memory Persistence - TITANE∞ v19.5.2
# Vérifie que les conversations sont bien sauvegardées et chargées avec contexte

echo "═══════════════════════════════════════════════════════════════"
echo "  🧪 TEST MEMORY PERSISTENCE - TITANE∞ v19.5.2"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire de stockage des conversations
STORAGE_DIR="$HOME/.titane/conversations"

echo -e "${BLUE}📁 Répertoire de stockage:${NC} $STORAGE_DIR"
echo ""

# 1. Vérifier que le répertoire existe
echo -e "${YELLOW}[1/5] Vérification du répertoire de stockage...${NC}"
if [ -d "$STORAGE_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire existe${NC}"
    echo "   $(ls -lh "$STORAGE_DIR" 2>/dev/null | wc -l) fichiers"
else
    echo -e "${YELLOW}⚠️  Répertoire n'existe pas encore (normal si première utilisation)${NC}"
fi
echo ""

# 2. Lister les conversations existantes
echo -e "${YELLOW}[2/5] Conversations existantes:${NC}"
if [ -d "$STORAGE_DIR" ]; then
    CONV_COUNT=$(ls -1 "$STORAGE_DIR"/*.enc 2>/dev/null | wc -l)
    if [ "$CONV_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ $CONV_COUNT conversations trouvées${NC}"
        ls -lht "$STORAGE_DIR"/*.enc 2>/dev/null | head -5 | while read -r line; do
            echo "   $line"
        done
    else
        echo -e "${YELLOW}⚠️  Aucune conversation chiffrée trouvée${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Répertoire non créé${NC}"
fi
echo ""

# 3. Vérifier les logs de sauvegarde
echo -e "${YELLOW}[3/5] Vérification logs de sauvegarde récents:${NC}"
LOG_FILES=(
    "runtime/dev/logs/tauri.log"
    "runtime/stable/logs/tauri.log"
)

for LOG_FILE in "${LOG_FILES[@]}"; do
    if [ -f "$LOG_FILE" ]; then
        SAVE_COUNT=$(grep -c "save_exchange\|save_conversation\|ConversationMemory" "$LOG_FILE" 2>/dev/null || echo 0)
        if [ "$SAVE_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ $LOG_FILE: $SAVE_COUNT entrées mémoire${NC}"
            grep "save_exchange\|save_conversation\|Snapshot" "$LOG_FILE" 2>/dev/null | tail -3
        fi
    fi
done
echo ""

# 4. Test structure des fichiers chiffrés
echo -e "${YELLOW}[4/5] Test intégrité fichiers chiffrés:${NC}"
if [ -d "$STORAGE_DIR" ]; then
    for ENC_FILE in "$STORAGE_DIR"/*.enc; do
        if [ -f "$ENC_FILE" ]; then
            SIZE=$(stat -f%z "$ENC_FILE" 2>/dev/null || stat -c%s "$ENC_FILE" 2>/dev/null)
            if [ "$SIZE" -gt 0 ]; then
                echo -e "${GREEN}✅ $(basename "$ENC_FILE"): ${SIZE} bytes${NC}"
            else
                echo -e "${RED}❌ $(basename "$ENC_FILE"): Fichier vide!${NC}"
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠️  Pas de fichiers à vérifier${NC}"
fi
echo ""

# 5. Recommandations
echo -e "${YELLOW}[5/5] Recommandations de test:${NC}"
echo ""
echo "📝 Pour tester la persistance complète:"
echo "   1. Ouvrir TITANE∞ Dev (npm run dev:tauri)"
echo "   2. Créer une nouvelle conversation dans Chat IA"
echo "   3. Envoyer au moins 2-3 messages"
echo "   4. Relancer ce script: ./test_memory_persistence.sh"
echo "   5. Vérifier que les fichiers .enc sont créés"
echo "   6. Fermer et rouvrir TITANE∞"
echo "   7. Vérifier que la conversation se charge avec contexte"
echo ""
echo "🔍 Logs en temps réel:"
echo "   tail -f runtime/dev/logs/tauri.log | grep -i 'memory\|conversation\|snapshot'"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 RÉSUMÉ:${NC}"
echo ""
if [ -d "$STORAGE_DIR" ] && [ "$(ls -1 "$STORAGE_DIR"/*.enc 2>/dev/null | wc -l)" -gt 0 ]; then
    echo -e "${GREEN}✅ Système de stockage OPÉRATIONNEL${NC}"
    echo "   - Répertoire créé"
    echo "   - Fichiers chiffrés présents"
    echo "   - Prêt pour tests end-to-end"
else
    echo -e "${YELLOW}⚠️  Système de stockage EN ATTENTE DE PREMIER TEST${NC}"
    echo "   - Créer une conversation via Chat IA"
    echo "   - Les fichiers seront créés automatiquement"
fi
echo "═══════════════════════════════════════════════════════════════"
