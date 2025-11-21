#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v8.0 - MemoryCore Verification Script                               ║
# ║ Script de vérification de l'installation complète du MemoryCore             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

echo "🔍 TITANE∞ v8.0 - Vérification MemoryCore"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de vérification
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description - MANQUANT: $file"
        ((FAILED++))
    fi
}

check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description - MANQUANT: $dir"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📂 Vérification de la Structure Backend${NC}"
echo "----------------------------------------"
check_file "core/backend/Cargo.toml" "Cargo.toml présent"
check_file "core/backend/main.rs" "main.rs présent"
check_dir "core/backend/system/memory" "Répertoire memory/"
check_file "core/backend/system/memory/mod.rs" "mod.rs (module principal)"
check_file "core/backend/system/memory/crypto.rs" "crypto.rs (AES-256-GCM)"
check_file "core/backend/system/memory/storage.rs" "storage.rs (persistence)"
check_file "core/backend/system/memory/types.rs" "types.rs (structures)"
check_file "core/backend/system/memory/tests.rs" "tests.rs (tests intégration)"
echo ""

echo -e "${BLUE}🎨 Vérification de la Structure Frontend${NC}"
echo "----------------------------------------"
check_dir "core/frontend/hooks" "Répertoire hooks/"
check_file "core/frontend/hooks/useMemoryCore.ts" "useMemoryCore.ts (hook React)"
check_dir "core/frontend/devtools/panels" "Répertoire panels/"
check_file "core/frontend/devtools/panels/MemoryPanel.tsx" "MemoryPanel.tsx (composant)"
check_file "core/frontend/devtools/panels/MemoryPanel.css" "MemoryPanel.css (styles)"
echo ""

echo -e "${BLUE}📚 Vérification de la Documentation${NC}"
echo "------------------------------------"
check_file "MEMORYCORE_COMPLETE.md" "Documentation complète"
check_file "MEMORYCORE_USAGE.md" "Guide d'utilisation"
echo ""

echo -e "${BLUE}🔍 Vérification du Contenu${NC}"
echo "---------------------------"

# Vérifier les dépendances dans Cargo.toml
if grep -q "aes-gcm" core/backend/Cargo.toml && \
   grep -q "sha2" core/backend/Cargo.toml && \
   grep -q "hex" core/backend/Cargo.toml; then
    echo -e "${GREEN}✓${NC} Dépendances crypto présentes dans Cargo.toml"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Dépendances crypto manquantes dans Cargo.toml"
    ((FAILED++))
fi

# Vérifier les commandes Tauri dans main.rs
if grep -q "system::memory::save_entry" core/backend/main.rs && \
   grep -q "system::memory::load_entries" core/backend/main.rs && \
   grep -q "system::memory::clear_memory" core/backend/main.rs && \
   grep -q "system::memory::get_memory_state" core/backend/main.rs; then
    echo -e "${GREEN}✓${NC} Commandes Tauri enregistrées dans main.rs"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Commandes Tauri manquantes dans main.rs"
    ((FAILED++))
fi

# Vérifier que mod.rs contient les fonctions de chiffrement
if grep -q "fn encrypt" core/backend/system/memory/crypto.rs && \
   grep -q "fn decrypt" core/backend/system/memory/crypto.rs && \
   grep -q "derive_key_from_passphrase" core/backend/system/memory/crypto.rs; then
    echo -e "${GREEN}✓${NC} Fonctions crypto implémentées"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Fonctions crypto manquantes"
    ((FAILED++))
fi

# Vérifier que storage.rs contient les fonctions de persistance
if grep -q "fn save_bytes" core/backend/system/memory/storage.rs && \
   grep -q "fn load_bytes" core/backend/system/memory/storage.rs && \
   grep -q "fn clear_storage" core/backend/system/memory/storage.rs; then
    echo -e "${GREEN}✓${NC} Fonctions storage implémentées"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Fonctions storage manquantes"
    ((FAILED++))
fi

# Vérifier les structures de données
if grep -q "struct MemoryEntry" core/backend/system/memory/types.rs && \
   grep -q "struct MemoryCollection" core/backend/system/memory/types.rs; then
    echo -e "${GREEN}✓${NC} Structures de données définies"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Structures de données manquantes"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}📊 Résumé${NC}"
echo "--------"
TOTAL=$((PASSED + FAILED))
echo -e "Tests réussis: ${GREEN}${PASSED}${NC}/${TOTAL}"
echo -e "Tests échoués: ${RED}${FAILED}${NC}/${TOTAL}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ MEMORYCORE COMPLET ET VALIDÉ !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "1. Compiler le backend : cd core/backend && cargo build"
    echo "2. Lancer les tests : cargo test"
    echo "3. Intégrer le MemoryPanel dans le frontend"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VÉRIFICATION ÉCHOUÉE${NC}"
    echo "Veuillez vérifier les fichiers manquants ci-dessus."
    echo ""
    exit 1
fi
