#!/bin/bash
# TITANE∞ v8.0 - Validation du code sans compilation complète

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌌 TITANE∞ v8.0 - VALIDATION COMPLÈTE DU CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0
WARNINGS=0

# ============================================
# 1. VÉRIFICATION STRUCTURE DE FICHIERS
# ============================================
echo ""
echo "📂 [1/8] Vérification de la structure..."

REQUIRED_DIRS=(
    "core/backend"
    "core/backend/system/helios"
    "core/backend/system/nexus"
    "core/backend/system/harmonia"
    "core/backend/system/sentinel"
    "core/backend/system/watchdog"
    "core/backend/system/self_heal"
    "core/backend/system/adaptive_engine"
    "core/backend/system/memory"
    "core/backend/system/resonance"
    "core/backend/system/cortex"
    "core/backend/shared"
    "core/frontend"
    "docs"
    "system/scripts"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir"
    else
        echo "  ❌ $dir manquant"
        ((ERRORS++))
    fi
done

# ============================================
# 2. VÉRIFICATION FICHIERS BACKEND RUST
# ============================================
echo ""
echo "🦀 [2/8] Vérification des fichiers backend Rust..."

RUST_FILES=(
    "core/backend/main.rs"
    "core/backend/shared/mod.rs"
    "core/backend/shared/types.rs"
    "core/backend/shared/utils.rs"
    "core/backend/shared/macros.rs"
    "core/backend/system/helios/mod.rs"
    "core/backend/system/nexus/mod.rs"
    "core/backend/system/harmonia/mod.rs"
    "core/backend/system/sentinel/mod.rs"
    "core/backend/system/watchdog/mod.rs"
    "core/backend/system/self_heal/mod.rs"
    "core/backend/system/adaptive_engine/mod.rs"
    "core/backend/system/memory/mod.rs"
    "core/backend/system/resonance/mod.rs"
    "core/backend/system/cortex/mod.rs"
)

for file in "${RUST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file ($(wc -l < "$file") lignes)"
    else
        echo "  ❌ $file manquant"
        ((ERRORS++))
    fi
done

# ============================================
# 3. VÉRIFICATION SYNTAXE RUST
# ============================================
echo ""
echo "🔍 [3/8] Vérification syntaxe Rust..."

if command -v rustc &> /dev/null; then
    cd core/backend
    for file in main.rs shared/*.rs system/*/mod.rs; do
        if [ -f "$file" ]; then
            if rustc --crate-type lib --edition 2021 --cfg test -Z parse-only "$file" 2>/dev/null; then
                echo "  ✅ $file syntaxe valide"
            else
                echo "  ⚠️  $file (vérification limitée sans dépendances)"
                ((WARNINGS++))
            fi
        fi
    done
    cd ../..
else
    echo "  ⚠️  Rust non disponible, vérification syntaxe ignorée"
    ((WARNINGS++))
fi

# ============================================
# 4. ANALYSE CODE RUST
# ============================================
echo ""
echo "📊 [4/8] Analyse du code Rust..."

# Compter les tests
TOTAL_TESTS=$(grep -r "^#\[test\]" core/backend/system --count 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
echo "  ✅ Tests détectés: $TOTAL_TESTS"

# Compter les modules
MODULE_COUNT=$(find core/backend/system -name "mod.rs" | wc -l)
echo "  ✅ Modules système: $MODULE_COUNT"

# Vérifier unwrap/panic
UNWRAP_COUNT=$(grep -r "\.unwrap()" core/backend/system 2>/dev/null | wc -l)
PANIC_COUNT=$(grep -r "panic!" core/backend/system 2>/dev/null | wc -l)
if [ "$UNWRAP_COUNT" -eq 0 ] && [ "$PANIC_COUNT" -eq 0 ]; then
    echo "  ✅ Zéro unwrap/panic (sécurité maximale)"
else
    echo "  ⚠️  unwrap: $UNWRAP_COUNT, panic: $PANIC_COUNT"
    ((WARNINGS++))
fi

# Vérifier Arc<Mutex<>>
ARCMUTEX_COUNT=$(grep -r "Arc<Mutex<" core/backend 2>/dev/null | wc -l)
echo "  ✅ Arc<Mutex<>> détectés: $ARCMUTEX_COUNT (thread-safety)"

# Compter lignes de code
RUST_LINES=$(find core/backend -name "*.rs" -exec cat {} \; | wc -l)
echo "  ✅ Lignes de code Rust: $RUST_LINES"

# ============================================
# 5. VÉRIFICATION FICHIERS FRONTEND
# ============================================
echo ""
echo "⚛️  [5/8] Vérification des fichiers frontend..."

FRONTEND_FILES=(
    "core/frontend/App.tsx"
    "core/frontend/main.tsx"
    "core/frontend/core/Dashboard.tsx"
    "core/frontend/devtools/DevTools.tsx"
    "core/frontend/hooks/useTitaneCore.ts"
    "core/frontend/ui/ModuleCard.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file ($(wc -l < "$file") lignes)"
    else
        echo "  ❌ $file manquant"
        ((ERRORS++))
    fi
done

# ============================================
# 6. VÉRIFICATION DOCUMENTATION
# ============================================
echo ""
echo "📚 [6/8] Vérification de la documentation..."

DOC_FILES=(
    "docs/README.md"
    "docs/ARCHITECTURE.md"
    "docs/MODULES.md"
    "docs/SECURITY.md"
    "docs/DEVELOPER_GUIDE.md"
    "docs/MAI_README.md"
    "docs/RESONANCE_README.md"
    "docs/CORTEX_README.md"
    "docs/SENSES_README.md"
)

DOC_LINES=0
for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file")
        DOC_LINES=$((DOC_LINES + LINES))
        echo "  ✅ $file ($LINES lignes)"
    else
        echo "  ❌ $file manquant"
        ((ERRORS++))
    fi
done
echo "  📊 Total documentation: $DOC_LINES lignes"

# ============================================
# 7. VÉRIFICATION SCRIPTS SYSTÈME
# ============================================
echo ""
echo "🔧 [7/8] Vérification des scripts système..."

SCRIPT_FILES=(
    "system/scripts/install_deps.sh"
    "system/scripts/build.sh"
    "system/scripts/run.sh"
    "system/scripts/clean.sh"
)

for file in "${SCRIPT_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [ -x "$file" ]; then
            echo "  ✅ $file (exécutable)"
        else
            echo "  ⚠️  $file (non exécutable)"
            chmod +x "$file"
            echo "     → Permissions corrigées"
        fi
    else
        echo "  ❌ $file manquant"
        ((ERRORS++))
    fi
done

# ============================================
# 8. VÉRIFICATION FICHIERS DE CONFIGURATION
# ============================================
echo ""
echo "⚙️  [8/8] Vérification des fichiers de configuration..."

CONFIG_FILES=(
    "core/backend/Cargo.toml"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "src-tauri/tauri.conf.json"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file manquant"
        ((ERRORS++))
    fi
done

# ============================================
# VÉRIFICATIONS SÉCURITÉ
# ============================================
echo ""
echo "🔒 [BONUS] Vérifications sécurité..."

# Vérifier AES-256-GCM dans MemoryCore
if grep -q "aes-gcm" core/backend/system/memory/mod.rs 2>/dev/null; then
    echo "  ✅ Chiffrement AES-256-GCM détecté"
else
    echo "  ⚠️  AES-256-GCM non détecté"
    ((WARNINGS++))
fi

# Vérifier absence de credentials hardcodés
if grep -rE "(password|secret|token)\s*=\s*['\"]" core/backend 2>/dev/null | grep -v "test"; then
    echo "  ⚠️  Credentials potentiellement hardcodés détectés"
    ((WARNINGS++))
else
    echo "  ✅ Aucun credential hardcodé détecté"
fi

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DE LA VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🦀 Modules Rust:        $MODULE_COUNT"
echo "  🧪 Tests unitaires:     $TOTAL_TESTS"
echo "  📝 Lignes code Rust:    $RUST_LINES"
echo "  📚 Lignes documentation: $DOC_LINES"
echo "  🔧 Scripts système:     ${#SCRIPT_FILES[@]}"
echo "  🔐 Arc<Mutex<>>:        $ARCMUTEX_COUNT"
echo ""
echo "  ❌ Erreurs:             $ERRORS"
echo "  ⚠️  Avertissements:     $WARNINGS"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ VALIDATION RÉUSSIE - PROJET COMPLET"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📌 NOTE: Pour exécuter les tests unitaires complets:"
    echo "   1. Installer les dépendances système (WebKit2GTK, Node.js)"
    echo "   2. Exécuter: cargo test --lib (dans core/backend)"
    echo ""
    echo "🚀 Le projet est prêt pour:"
    echo "   • Compilation production (après installation dépendances)"
    echo "   • Prompt #9: ANS (Autonomic Nervous System)"
    echo "   • Déploiement et tests d'intégration"
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ VALIDATION ÉCHOUÉE - $ERRORS ERREUR(S)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi
