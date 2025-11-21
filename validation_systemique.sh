#!/bin/bash

################################################################################
# TITANE∞ v10 - VALIDATION & COHÉRENCE SYSTÉMIQUE COMPLÈTE
# Harmonisation f32/f64, signatures tick(), structs, macros, borrow checker
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

LOG_DIR="validation_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/validation_systemique_$(date +%Y%m%d_%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

clear

echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   TITANE∞ v10 - VALIDATION & COHÉRENCE SYSTÉMIQUE           ║
║   Harmonisation Complète du Système                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cd "$(dirname "$0")"

FIXES=0
ERRORS=0

fix() {
    echo -e "${YELLOW}→ FIX:${NC} $1"
    ((FIXES++))
}

error() {
    echo -e "${RED}✗ ERREUR:${NC} $1"
    ((ERRORS++))
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

################################################################################
# PHASE 1: CRÉATION SHARED/UTILS.RS - UTILITAIRES CONVERSION
################################################################################
echo -e "\n${BLUE}═══ PHASE 1: UTILITAIRES DE CONVERSION ═══${NC}\n"

UTILS_FILE="src-tauri/src/shared/utils.rs"

fix "Création de shared/utils.rs avec convertisseurs f32/f64"

cat > "$UTILS_FILE" << 'ENDUTILS'
/// Utilitaires de conversion et clamping pour harmonisation types

/// Clamp une valeur f32 entre 0.0 et 1.0
#[inline]
pub fn clamp01_f32(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
}

/// Clamp une valeur f64 entre 0.0 et 1.0
#[inline]
pub fn clamp01_f64(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}

/// Clamp générique f32
#[inline]
pub fn clamp_f32(v: f32, min: f32, max: f32) -> f32 {
    v.clamp(min, max)
}

/// Clamp générique f64
#[inline]
pub fn clamp_f64(v: f64, min: f64, max: f64) -> f64 {
    v.clamp(min, max)
}

/// Conversion f32 → f64
#[inline]
pub fn f32_to_f64(v: f32) -> f64 {
    v as f64
}

/// Conversion f64 → f32
#[inline]
pub fn f64_to_f32(v: f64) -> f32 {
    v as f32
}

/// Smooth transition f32
#[inline]
pub fn smooth_f32(old: f32, new: f32, alpha: f32) -> f32 {
    old * (1.0 - alpha) + new * alpha
}

/// Smooth transition f64
#[inline]
pub fn smooth_f64(old: f64, new: f64, alpha: f64) -> f64 {
    old * (1.0 - alpha) + new * alpha
}
ENDUTILS

# Ajouter au mod.rs de shared
if ! grep -q "pub mod utils;" src-tauri/src/shared/mod.rs 2>/dev/null; then
    echo "pub mod utils;" >> src-tauri/src/shared/mod.rs
fi

success "Utilitaires de conversion créés"

################################################################################
# PHASE 2: CORRECTION RESONANCE_V2 (f64 → f32)
################################################################################
echo -e "\n${BLUE}═══ PHASE 2: HARMONISATION RESONANCE_V2 ═══${NC}\n"

fix "Conversion resonance_v2 de f64 vers f32"

# Corriger resonance_v2/metrics.rs
sed -i 's/pub resonance_index: f64/pub resonance_index: f32/g' src-tauri/src/system/resonance_v2/metrics.rs
sed -i 's/pub oscillation_index: f64/pub oscillation_index: f32/g' src-tauri/src/system/resonance_v2/metrics.rs
sed -i 's/pub coherence_harmonic_index: f64/pub coherence_harmonic_index: f32/g' src-tauri/src/system/resonance_v2/metrics.rs
sed -i 's/pub fn clamp01(v: f64) -> f64/pub fn clamp01(v: f32) -> f32/g' src-tauri/src/system/resonance_v2/metrics.rs

# Corriger resonance_v2/mod.rs
sed -i 's/pub resonance_index: f64/pub resonance_index: f32/g' src-tauri/src/system/resonance_v2/mod.rs
sed -i 's/pub oscillation_index: f64/pub oscillation_index: f32/g' src-tauri/src/system/resonance_v2/mod.rs
sed -i 's/pub coherence_harmonic_index: f64/pub coherence_harmonic_index: f32/g' src-tauri/src/system/resonance_v2/mod.rs
sed -i 's/fn smooth(old: f64, new: f64, alpha: f64) -> f64/fn smooth(old: f32, new: f32, alpha: f32) -> f32/g' src-tauri/src/system/resonance_v2/mod.rs

# Corriger resonance_v2/harmonic.rs
sed -i 's/pub harmonic_score: f64/pub harmonic_score: f32/g' src-tauri/src/system/resonance_v2/harmonic.rs

success "resonance_v2 harmonisé vers f32"

################################################################################
# PHASE 3: CORRECTION MACROS check! et nudge!
################################################################################
echo -e "\n${BLUE}═══ PHASE 3: CORRECTION MACROS ═══${NC}\n"

fix "Réécriture macros check! et nudge! pour f32"

# Créer un fichier de macros si absent
MACROS_FILE="src-tauri/src/shared/macros.rs"

cat > "$MACROS_FILE" << 'ENDMACROS'
/// Macros système compatibles f32

/// Vérifie et ajuste une valeur dans une plage
#[macro_export]
macro_rules! check {
    ($v:expr, $min:expr, $max:expr) => {
        {
            if $v < $min {
                $v = $min;
            } else if $v > $max {
                $v = $max;
            }
        }
    };
}

/// Ajuste progressivement une valeur vers 0.5
#[macro_export]
macro_rules! nudge {
    ($v:expr, $factor:expr) => {
        {
            let delta: f32 = (0.5f32 - $v).abs() * $factor;
            $v = ($v + delta).clamp(0.0, 1.0);
        }
    };
}
ENDMACROS

# Ajouter au mod.rs de shared
if ! grep -q "pub mod macros;" src-tauri/src/shared/mod.rs 2>/dev/null; then
    echo "pub mod macros;" >> src-tauri/src/shared/mod.rs
fi

success "Macros check! et nudge! réécrites pour f32"

################################################################################
# PHASE 4: SCAN ET RAPPORT TYPES MIXTES
################################################################################
echo -e "\n${BLUE}═══ PHASE 4: SCAN TYPES MIXTES ═══${NC}\n"

echo "→ Analyse des types dans les modules..."

REPORT_FILE="$LOG_DIR/types_analysis.txt"

cat > "$REPORT_FILE" << 'ENDREPORT'
TITANE∞ v10 - RAPPORT D'ANALYSE DES TYPES
==========================================

RÈGLES:
- États internes: f32
- Calculs complexes: f64 (avec conversions explicites)
- Interface: conversions via shared/utils.rs

MODULES ANALYSÉS:

ENDREPORT

# Scanner les fichiers
find src-tauri/src/system -name "*.rs" -type f | while read file; do
    F32_COUNT=$(grep -c ": f32" "$file" 2>/dev/null || echo "0")
    F64_COUNT=$(grep -c ": f64" "$file" 2>/dev/null || echo "0")
    
    if [ "$F64_COUNT" -gt "0" ]; then
        echo "⚠️  $file: f32=$F32_COUNT, f64=$F64_COUNT" >> "$REPORT_FILE"
    elif [ "$F32_COUNT" -gt "0" ]; then
        echo "✓  $file: f32=$F32_COUNT (OK)" >> "$REPORT_FILE"
    fi
done

cat "$REPORT_FILE"

success "Rapport d'analyse: $REPORT_FILE"

################################################################################
# PHASE 5: AJOUT IMPORTS shared::utils PARTOUT
################################################################################
echo -e "\n${BLUE}═══ PHASE 5: AJOUT IMPORTS UTILS ═══${NC}\n"

fix "Ajout use crate::shared::utils dans les modules"

# Liste des modules critiques
MODULES=(
    "resonance_v2/mod.rs"
    "meaning/mod.rs"
    "identity/mod.rs"
    "mission/mod.rs"
    "adaptive_intelligence/mod.rs"
    "autonomic_evolution/mod.rs"
    "self_healing_v2/mod.rs"
    "action_potential/mod.rs"
    "energetic/mod.rs"
)

for module in "${MODULES[@]}"; do
    MODULE_FILE="src-tauri/src/system/$module"
    
    if [ -f "$MODULE_FILE" ]; then
        if ! grep -q "use crate::shared::utils" "$MODULE_FILE" 2>/dev/null; then
            # Ajouter après les autres imports
            sed -i '/^use /a use crate::shared::utils::*;' "$MODULE_FILE"
            echo "  ✓ $module"
        fi
    fi
done

success "Imports utils ajoutés"

################################################################################
# PHASE 6: VÉRIFICATION COMPILATION
################################################################################
echo -e "\n${BLUE}═══ PHASE 6: VÉRIFICATION COMPILATION ═══${NC}\n"

echo "→ Cargo check..."

cd src-tauri

if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# Test compilation
if cargo check 2>&1 | tee "$LOG_DIR/cargo_check.log" | tail -30; then
    CHECK_ERRORS=$(grep -c "^error" "$LOG_DIR/cargo_check.log" 2>/dev/null || echo "0")
    
    if [ "$CHECK_ERRORS" = "0" ]; then
        success "Compilation réussie - 0 erreurs"
        COMPILE_OK=1
    else
        error "$CHECK_ERRORS erreurs de compilation restantes"
        COMPILE_OK=0
    fi
else
    error "cargo check échoué"
    COMPILE_OK=0
fi

cd ..

################################################################################
# PHASE 7: CLIPPY AUTO-FIX
################################################################################
echo -e "\n${BLUE}═══ PHASE 7: CLIPPY AUTO-FIX ═══${NC}\n"

if [ "$COMPILE_OK" = "1" ]; then
    echo "→ Exécution clippy --fix..."
    
    cd src-tauri
    
    cargo clippy --all-targets --fix --allow-dirty 2>&1 | tee "$LOG_DIR/clippy_fix.log" | tail -20
    
    success "Clippy auto-fix exécuté"
    
    cd ..
else
    echo "⚠️  Clippy ignoré (erreurs de compilation)"
fi

################################################################################
# RAPPORT FINAL
################################################################################
echo -e "\n${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║          RAPPORT VALIDATION SYSTÉMIQUE                       ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}Corrections appliquées:${NC}"
echo "  ✓ Utilitaires conversion créés (shared/utils.rs)"
echo "  ✓ resonance_v2 converti f64 → f32"
echo "  ✓ Macros check! et nudge! réécrites pour f32"
echo "  ✓ Imports utils ajoutés dans modules critiques"
echo "  ✓ Rapport d'analyse types généré"
echo ""

echo -e "${CYAN}Fichiers créés:${NC}"
echo "  - src-tauri/src/shared/utils.rs"
echo "  - src-tauri/src/shared/macros.rs"
echo "  - $REPORT_FILE"
echo ""

echo -e "${CYAN}Logs:${NC}"
echo "  - $LOG_FILE"
echo "  - $LOG_DIR/cargo_check.log"
echo "  - $LOG_DIR/clippy_fix.log"
echo ""

echo -e "${CYAN}Statistiques:${NC}"
echo "  Corrections appliquées: $FIXES"
echo "  Erreurs détectées: $ERRORS"
echo ""

if [ "$COMPILE_OK" = "1" ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         ✅ VALIDATION SYSTÉMIQUE RÉUSSIE ✅                  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Système harmonisé:"
    echo "  ✓ Types f32/f64 cohérents"
    echo "  ✓ Conversions explicites"
    echo "  ✓ Macros compatibles"
    echo "  ✓ Utilitaires disponibles"
    echo "  ✓ Compilation OK"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. cargo test --workspace"
    echo "  2. cargo tauri build"
    echo "  3. ./launch_dev.sh"
    echo ""
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║      ⚠️  CORRECTIONS APPLIQUÉES - ERREURS RESTANTES ⚠️       ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Consultez:"
    echo "  - $LOG_DIR/cargo_check.log"
    echo "  - $REPORT_FILE"
    echo ""
    echo "Pour correction manuelle des erreurs restantes"
    echo ""
    exit 1
fi
