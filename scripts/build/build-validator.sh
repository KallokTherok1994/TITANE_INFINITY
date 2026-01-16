#!/bin/bash
set -euo pipefail

# ==============================================================================
# 🧪 [BUILD-VALIDATOR] TITANE∞ Build Config Validation (P3 Simulation)
# Valide configuration build sans lancer le build complet (20min)
# ==============================================================================

echo "🧪 [BUILD-VALIDATOR] TITANE∞ Build Config Validation"
echo "===================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")" && cd ../.. && pwd)"
STABLE_DIR="$PROJECT_ROOT/runtime/stable"
TAURI_DIR="$PROJECT_ROOT/src-tauri"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence/p3-build"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$EVIDENCE_DIR"

echo "📋 Phase 1: Validation configuration build..."

# Vérifier fichiers critiques
MISSING_FILES=0

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ MANQUANT: package.json"
    MISSING_FILES=$((MISSING_FILES + 1))
else
    echo "✅ package.json présent"
fi

if [ ! -f "$TAURI_DIR/Cargo.toml" ]; then
    echo "❌ MANQUANT: src-tauri/Cargo.toml"
    MISSING_FILES=$((MISSING_FILES + 1))
else
    echo "✅ Cargo.toml présent"
fi

if [ ! -f "$STABLE_DIR/tauri.conf.json" ]; then
    echo "❌ MANQUANT: runtime/stable/tauri.conf.json"
    MISSING_FILES=$((MISSING_FILES + 1))
else
    echo "✅ tauri.conf.json stable présent"
fi

echo "📋 Phase 2: Validation outils build..."

MISSING_TOOLS=0

if ! command -v pnpm >/dev/null 2>&1; then
    echo "❌ MANQUANT: pnpm"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
else
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm $PNPM_VERSION présent"
fi

if ! command -v cargo >/dev/null 2>&1; then
    echo "❌ MANQUANT: cargo"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
else
    CARGO_VERSION=$(cargo --version)
    echo "✅ $CARGO_VERSION présent"
fi

if ! command -v node >/dev/null 2>&1; then
    echo "❌ MANQUANT: node"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
else
    NODE_VERSION=$(node --version)
    echo "✅ node $NODE_VERSION présent"
fi

echo "📋 Phase 3: Validation configuration stable..."

CONFIG_ERRORS=0

if [ -f "$STABLE_DIR/tauri.conf.json" ]; then
    # Vérifier JSON valide
    if ! jq empty "$STABLE_DIR/tauri.conf.json" >/dev/null 2>&1; then
        echo "❌ CONFIG: tauri.conf.json JSON invalide"
        CONFIG_ERRORS=$((CONFIG_ERRORS + 1))
    else
        echo "✅ tauri.conf.json JSON valide"
        
        # Vérifier champs critiques
        BUNDLE_TYPE=$(jq -r '.bundle.targets // "null"' "$STABLE_DIR/tauri.conf.json" 2>/dev/null)
        if [ "$BUNDLE_TYPE" = "null" ]; then
            echo "⚠️ WARNING: bundle.targets non défini"
        else
            echo "✅ Bundle targets: $BUNDLE_TYPE"
        fi
        
        APP_NAME=$(jq -r '.productName // "null"' "$STABLE_DIR/tauri.conf.json" 2>/dev/null)
        if [ "$APP_NAME" = "null" ]; then
            echo "❌ CONFIG: productName manquant"
            CONFIG_ERRORS=$((CONFIG_ERRORS + 1))
        else
            echo "✅ Product name: $APP_NAME"
        fi
    fi
fi

echo "📋 Phase 4: Validation dépendances..."

DEP_ERRORS=0

cd "$PROJECT_ROOT"

# Vérifier pnpm.lock
if [ ! -f "pnpm-lock.yaml" ]; then
    echo "❌ DEPS: pnpm-lock.yaml manquant"
    DEP_ERRORS=$((DEP_ERRORS + 1))
else
    echo "✅ pnpm-lock.yaml présent"
fi

# Vérifier Cargo.lock
cd "$TAURI_DIR"
if [ ! -f "Cargo.lock" ]; then
    echo "❌ DEPS: Cargo.lock manquant"
    DEP_ERRORS=$((DEP_ERRORS + 1))
else
    echo "✅ Cargo.lock présent"
fi

echo "📋 Phase 5: Génération rapport validation..."

TOTAL_ERRORS=$((MISSING_FILES + MISSING_TOOLS + CONFIG_ERRORS + DEP_ERRORS))

# Rapport de validation
VALIDATION_REPORT="$EVIDENCE_DIR/P3_build_validation_$TIMESTAMP.txt"
{
    echo "TIMESTAMP: $(date -Iseconds)"
    echo "PHASE: P3 BUILD VALIDATION (SIMULATION)"
    if [ "$TOTAL_ERRORS" -eq 0 ]; then
        echo "STATUS: PASS"
    else
        echo "STATUS: FAIL"
    fi
    echo ""
    echo "=== RÉSUMÉ ==="
    echo "Fichiers manquants: $MISSING_FILES"
    echo "Outils manquants: $MISSING_TOOLS"
    echo "Erreurs config: $CONFIG_ERRORS"
    echo "Erreurs dépendances: $DEP_ERRORS"
    echo "Total erreurs: $TOTAL_ERRORS"
    echo ""
    echo "=== ENVIRONNEMENT ==="
    echo "OS: $(uname -a)"
    echo "PWD: $PROJECT_ROOT"
    echo "Node: $(node --version 2>/dev/null || echo "N/A")"
    echo "PNPM: $(pnpm --version 2>/dev/null || echo "N/A")"
    echo "Cargo: $(cargo --version 2>/dev/null || echo "N/A")"
    echo ""
    echo "=== NEXT ACTION ==="
    if [ "$TOTAL_ERRORS" -eq 0 ]; then
        echo "✅ Ready for: ./scripts/build/build-guard.sh (full build 20min)"
        echo "Command: cargo tauri build --config runtime/stable/tauri.conf.json"
    else
        echo "❌ Fix errors above before build"
    fi
} > "$VALIDATION_REPORT"

echo ""
if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "✅ BUILD-VALIDATOR: PASS - Configuration build prête"
    echo "🔧 Prêt pour build complet (20min avec build-guard.sh)"
else
    echo "❌ BUILD-VALIDATOR: FAIL - $TOTAL_ERRORS erreurs détectées"
    echo "🔧 Corriger erreurs avant build"
fi

echo "📄 Validation: $(basename "$VALIDATION_REPORT")"

exit "$TOTAL_ERRORS"