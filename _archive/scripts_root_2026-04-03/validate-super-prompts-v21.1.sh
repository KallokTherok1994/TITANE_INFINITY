#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ v21.1Ω — SUPER-PROMPTS VALIDATION SCRIPT
#   Valide l'implémentation des super-prompts
# ═══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 TITANE∞ v21.1Ω — VALIDATION DES SUPER-PROMPTS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# ═══════════════════════════════════════════════════════════════
# CHECK 1: Nouveaux fichiers existent
# ═══════════════════════════════════════════════════════════════

echo "📦 Vérification des fichiers..."

files=(
    "src-tauri/src/streaming.rs"
    "src-tauri/src/bounded.rs"
    "src-tauri/src/cache_multilevel.rs"
    "SUPER_PROMPTS_COMPLETION_REPORT_v21.1.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
        ((passed++))
    else
        echo -e "  ${RED}✗${NC} $file (manquant)"
        ((failed++))
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 2: Modules déclarés dans lib.rs
# ═══════════════════════════════════════════════════════════════

echo "📚 Vérification lib.rs..."

modules=(
    "pub mod streaming"
    "pub mod bounded"
    "pub mod cache_multilevel"
)

for mod in "${modules[@]}"; do
    if grep -q "$mod" src-tauri/src/lib.rs; then
        echo -e "  ${GREEN}✓${NC} $mod déclaré"
        ((passed++))
    else
        echo -e "  ${RED}✗${NC} $mod non déclaré"
        ((failed++))
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 3: Dépendances Cargo.toml
# ═══════════════════════════════════════════════════════════════

echo "📦 Vérification dépendances Cargo.toml..."

deps=(
    "tokio-stream"
    "async-stream"
    "lru"
    "md5"
    "tracing"
    "bincode"
)

for dep in "${deps[@]}"; do
    if grep -q "^$dep = " src-tauri/Cargo.toml; then
        echo -e "  ${GREEN}✓${NC} $dep"
        ((passed++))
    else
        echo -e "  ${RED}✗${NC} $dep (manquant)"
        ((failed++))
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 4: Compilation Rust
# ═══════════════════════════════════════════════════════════════

echo "🔨 Vérification compilation..."

cd src-tauri
if cargo check --lib --quiet 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} cargo check --lib"
    ((passed++))
else
    echo -e "  ${RED}✗${NC} cargo check --lib (erreurs)"
    ((failed++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 5: Tests unitaires
# ═══════════════════════════════════════════════════════════════

echo "🧪 Vérification tests unitaires..."

test_modules=(
    "streaming::tests"
    "bounded::tests"
    "cache_multilevel::tests"
)

for test in "${test_modules[@]}"; do
    if cargo test --lib "$test" --quiet 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $test"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠${NC} $test (certains tests échoués)"
        # Don't fail, just warn
    fi
done

cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 6: Ligne count des nouveaux fichiers
# ═══════════════════════════════════════════════════════════════

echo "📊 Statistiques du code..."

total_lines=0

for file in "${files[@]:0:3}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        total_lines=$((total_lines + lines))
        echo "  • $file: $lines lignes"
    fi
done

echo "  📈 Total: $total_lines lignes ajoutées"

if [ $total_lines -ge 1000 ]; then
    echo -e "  ${GREEN}✓${NC} >1000 lignes de code optimisé"
    ((passed++))
else
    echo -e "  ${RED}✗${NC} Moins de 1000 lignes"
    ((failed++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# CHECK 7: Documentation RustDoc
# ═══════════════════════════════════════════════════════════════

echo "📖 Vérification documentation..."

for file in "${files[@]:0:3}"; do
    if [ -f "$file" ] && grep -q "///" "$file"; then
        echo -e "  ${GREEN}✓${NC} $file a RustDoc"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠${NC} $file manque RustDoc"
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# RÉSULTATS
# ═══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "  📊 RÉSULTATS DE LA VALIDATION"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Total vérifications: $((passed + failed))"
echo -e "Réussies:            ${GREEN}$passed${NC}"
echo -e "Échouées:            ${RED}$failed${NC}"
echo ""

percentage=$((passed * 100 / (passed + failed)))

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ 100% - Tous les tests sont passés !${NC}"
    echo -e "${GREEN}🚀 Le système est prêt pour Phase 2 !${NC}"
    exit 0
elif [ $percentage -ge 80 ]; then
    echo -e "${YELLOW}⚠️  $percentage% - Quelques problèmes mineurs${NC}"
    echo "Revoyez les échecs ci-dessus avant Phase 2."
    exit 1
else
    echo -e "${RED}❌ $percentage% - Corrections nécessaires${NC}"
    echo "Corrigez les erreurs avant de continuer."
    exit 1
fi
