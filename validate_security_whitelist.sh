#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# TITANE∞ v16.2.2 - Security Whitelist Sync Validator
# Vérifie que les whitelists Rust et TypeScript sont synchronisées
# ═══════════════════════════════════════════════════════════════════

echo "🔐 Validation Synchronisation Whitelist Sécurité"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fichiers
RUST_SECURITY="src-tauri/src/commands/security.rs"
TS_SECURITY="src/lib/security.ts"

# Compteurs
PASS=0
FAIL=0
WARNINGS=0

# ───────────────────────────────────────────────────────────────────
# Test 1: Vérifier que les fichiers existent
# ───────────────────────────────────────────────────────────────────

echo "📋 Test 1: Fichiers de sécurité"

if [ -f "$RUST_SECURITY" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $RUST_SECURITY existe"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: $RUST_SECURITY manquant"
    ((FAIL++))
    exit 1
fi

if [ -f "$TS_SECURITY" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $TS_SECURITY existe"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: $TS_SECURITY manquant"
    ((FAIL++))
    exit 1
fi

echo ""

# ───────────────────────────────────────────────────────────────────
# Test 2: Extraire les commandes de chaque whitelist
# ───────────────────────────────────────────────────────────────────

echo "📋 Test 2: Extraction des commandes"

# Extraire commandes Rust (commands.insert("..."))
RUST_COMMANDS=$(grep -oP 'commands\.insert\("\K[^"]+' "$RUST_SECURITY" | sort)
RUST_COUNT=$(echo "$RUST_COMMANDS" | wc -l)

echo -e "${BLUE}ℹ️  Rust:${NC} $RUST_COUNT commandes trouvées"

# Extraire commandes TypeScript ('...',)
TS_COMMANDS=$(grep -oP "'\K[^']+(?=')" "$TS_SECURITY" | grep -E "^[a-z_]+$" | sort | uniq)
TS_COUNT=$(echo "$TS_COMMANDS" | wc -l)

echo -e "${BLUE}ℹ️  TypeScript:${NC} $TS_COUNT commandes trouvées"

echo ""

# ───────────────────────────────────────────────────────────────────
# Test 3: Vérifier les commandes Singularity Update
# ───────────────────────────────────────────────────────────────────

echo "📋 Test 3: Commandes Singularity Update"

SINGULARITY_UPDATE_COMMANDS=(
    "singularity_update_physical"
    "singularity_update_cognitive"
    "singularity_update_symbolic"
    "singularity_update_adaptive"
    "singularity_update_meta"
    "singularity_update_full_state"
    "singularity_save_state"
    "singularity_load_state"
)

for cmd in "${SINGULARITY_UPDATE_COMMANDS[@]}"; do
    RUST_HAS=$(echo "$RUST_COMMANDS" | grep -c "^$cmd$")
    TS_HAS=$(echo "$TS_COMMANDS" | grep -c "^$cmd$")
    
    if [ "$RUST_HAS" -eq 1 ] && [ "$TS_HAS" -eq 1 ]; then
        echo -e "${GREEN}✅ PASS${NC}: '$cmd' présent des deux côtés"
        ((PASS++))
    elif [ "$RUST_HAS" -eq 1 ] && [ "$TS_HAS" -eq 0 ]; then
        echo -e "${RED}❌ FAIL${NC}: '$cmd' présent en Rust mais MANQUANT en TypeScript"
        ((FAIL++))
    elif [ "$RUST_HAS" -eq 0 ] && [ "$TS_HAS" -eq 1 ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: '$cmd' présent en TypeScript mais MANQUANT en Rust"
        ((WARNINGS++))
    else
        echo -e "${RED}❌ FAIL${NC}: '$cmd' MANQUANT des deux côtés"
        ((FAIL++))
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────
# Test 4: Vérifier commandes critiques
# ───────────────────────────────────────────────────────────────────

echo "📋 Test 4: Commandes critiques système"

CRITICAL_COMMANDS=(
    "experience_get_state"
    "experience_update_state"
    "chat_send_message"
    "memory_ingest_file"
    "speak"
    "sync_singularity"
)

for cmd in "${CRITICAL_COMMANDS[@]}"; do
    RUST_HAS=$(echo "$RUST_COMMANDS" | grep -c "^$cmd$")
    TS_HAS=$(echo "$TS_COMMANDS" | grep -c "^$cmd$")
    
    if [ "$RUST_HAS" -eq 1 ] && [ "$TS_HAS" -eq 1 ]; then
        echo -e "${GREEN}✅ PASS${NC}: '$cmd' présent"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: '$cmd' manquant (Rust: $RUST_HAS, TS: $TS_HAS)"
        ((FAIL++))
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────
# Test 5: Détecter commandes orphelines
# ───────────────────────────────────────────────────────────────────

echo "📋 Test 5: Commandes orphelines (présentes d'un seul côté)"

ONLY_RUST=$(comm -23 <(echo "$RUST_COMMANDS") <(echo "$TS_COMMANDS") | grep -v "^$")
ONLY_TS=$(comm -13 <(echo "$RUST_COMMANDS") <(echo "$TS_COMMANDS") | grep -v "^$")

ORPHAN_RUST_COUNT=$(echo "$ONLY_RUST" | grep -c ".")
ORPHAN_TS_COUNT=$(echo "$ONLY_TS" | grep -c ".")

if [ "$ORPHAN_RUST_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Aucune commande orpheline en Rust"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: $ORPHAN_RUST_COUNT commande(s) orpheline(s) en Rust:"
    echo "$ONLY_RUST" | head -5
    ((WARNINGS++))
fi

if [ "$ORPHAN_TS_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Aucune commande orpheline en TypeScript"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: $ORPHAN_TS_COUNT commande(s) orpheline(s) en TypeScript:"
    echo "$ONLY_TS" | head -5
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────
# Résumé
# ───────────────────────────────────────────────────────────────────

echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ VALIDATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TOTAL=$((PASS + FAIL))
SUCCESS_RATE=$((PASS * 100 / TOTAL))

echo -e "${GREEN}✅ PASS${NC}: $PASS / $TOTAL tests"
echo -e "${RED}❌ FAIL${NC}: $FAIL / $TOTAL tests"
echo -e "${YELLOW}⚠️  WARN${NC}: $WARNINGS avertissements"
echo -e "${BLUE}📈 Success Rate${NC}: $SUCCESS_RATE%"
echo ""

echo -e "${BLUE}📦 Commandes whitelistées:${NC}"
echo "  - Rust: $RUST_COUNT commandes"
echo "  - TypeScript: $TS_COUNT commandes"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 VALIDATION RÉUSSIE${NC}"
    echo "✅ Les whitelists Rust et TypeScript sont synchronisées"
    echo "✅ Toutes les commandes critiques sont présentes"
    exit 0
else
    echo -e "${RED}❌ VALIDATION ÉCHOUÉE${NC}"
    echo "⚠️  Corriger les erreurs ci-dessus avant de continuer"
    exit 1
fi
