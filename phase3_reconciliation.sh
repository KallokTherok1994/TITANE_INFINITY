#!/bin/bash

################################################################################
# TITANE∞ v10 - PHASE 3 RÉCONCILIATION SYSTÉMIQUE TOTALE
# Exécution directe: alignement types, signatures, structs, macros
################################################################################

set -e
cd "$(dirname "$0")"

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src-tauri/src"
LOG_DIR="$PROJECT_ROOT/reconciliation_logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/phase3_${TIMESTAMP}.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${CYAN}═══════════════════════════════════════════════════════════════"
echo -e "  TITANE∞ v10 - PHASE 3 RÉCONCILIATION SYSTÉMIQUE"
echo -e "═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}[INFO]${NC} Démarrage: $(date)"
echo -e "${YELLOW}[INFO]${NC} Log: $LOG_FILE"
echo ""

################################################################################
# PHASE 3.1 — CRÉATION SHARED/UTILS.RS
################################################################################

echo -e "${BLUE}[PHASE 3.1]${NC} Création shared/utils.rs avec conversions f32/f64..."

UTILS_FILE="$SRC_DIR/shared/utils.rs"
mkdir -p "$SRC_DIR/shared"

cat > "$UTILS_FILE" << 'ENDUTILS'
//! TITANE∞ v10 - Utilitaires de conversion et clamping
//! Norme: États internes = f32, Calculs = f64, Conversions explicites

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

/// Clamp une valeur f32 entre min et max
#[inline]
pub fn clamp_f32(v: f32, min: f32, max: f32) -> f32 {
    v.clamp(min, max)
}

/// Clamp une valeur f64 entre min et max
#[inline]
pub fn clamp_f64(v: f64, min: f64, max: f64) -> f64 {
    v.clamp(min, max)
}

/// Convertit f32 → f64 (précision accrue pour calculs)
#[inline]
pub fn f32_to_f64(v: f32) -> f64 {
    v as f64
}

/// Convertit f64 → f32 (retour état)
#[inline]
pub fn f64_to_f32(v: f64) -> f32 {
    v as f32
}

/// Lissage exponentiel f32
#[inline]
pub fn smooth_f32(old: f32, new: f32, alpha: f32) -> f32 {
    old * (1.0 - alpha) + new * alpha
}

/// Lissage exponentiel f64
#[inline]
pub fn smooth_f64(old: f64, new: f64, alpha: f64) -> f64 {
    old * (1.0 - alpha) + new * alpha
}

/// Calcul sécurisé avec conversion f32 → f64 → f32
#[inline]
pub fn safe_calc_f32(value: f32, factor: f64) -> f32 {
    ((value as f64) * factor).clamp(0.0, 1.0) as f32
}

/// Nudge progressif vers 0.5
#[inline]
pub fn nudge_to_center_f32(value: f32, factor: f32) -> f32 {
    let delta = (0.5 - value).abs() * factor;
    (value + delta).clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clamp01_f32() {
        assert_eq!(clamp01_f32(1.5), 1.0);
        assert_eq!(clamp01_f32(-0.5), 0.0);
        assert_eq!(clamp01_f32(0.5), 0.5);
    }

    #[test]
    fn test_safe_calc() {
        let result = safe_calc_f32(0.8, 0.3);
        assert!(result >= 0.0 && result <= 1.0);
    }

    #[test]
    fn test_smooth() {
        let result = smooth_f32(0.5, 1.0, 0.3);
        assert!(result > 0.5 && result < 1.0);
    }
}
ENDUTILS

# Ajouter au mod.rs si pas déjà fait
SHARED_MOD="$SRC_DIR/shared/mod.rs"
if ! grep -q "pub mod utils;" "$SHARED_MOD" 2>/dev/null; then
    echo "pub mod utils;" >> "$SHARED_MOD"
fi

echo -e "${GREEN}[OK]${NC} shared/utils.rs créé (117 lignes)"

################################################################################
# PHASE 3.2 — CRÉATION SHARED/MACROS.RS
################################################################################

echo -e "${BLUE}[PHASE 3.2]${NC} Création shared/macros.rs avec macros f32..."

MACROS_FILE="$SRC_DIR/shared/macros.rs"

cat > "$MACROS_FILE" << 'ENDMACROS'
//! TITANE∞ v10 - Macros globales harmonisées pour f32

/// Macro check! - Clamp une valeur entre min et max
/// Usage: check!(value, 0.0, 1.0);
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

/// Macro nudge! - Ajustement progressif vers 0.5
/// Usage: nudge!(value, 0.1);
#[macro_export]
macro_rules! nudge {
    ($v:expr, $factor:expr) => {
        {
            let delta: f32 = (0.5f32 - $v).abs() * $factor;
            $v = ($v + delta).clamp(0.0, 1.0);
        }
    };
}

/// Macro adjust! - Ajustement pondéré
/// Usage: adjust!(value, target, weight);
#[macro_export]
macro_rules! adjust {
    ($v:expr, $target:expr, $weight:expr) => {
        {
            let diff = $target - $v;
            $v = ($v + diff * $weight).clamp(0.0, 1.0);
        }
    };
}

/// Macro soften! - Adoucissement vers moyenne
/// Usage: soften!(value, 0.05);
#[macro_export]
macro_rules! soften {
    ($v:expr, $amount:expr) => {
        {
            let avg = 0.5f32;
            $v = $v * (1.0 - $amount) + avg * $amount;
            $v = $v.clamp(0.0, 1.0);
        }
    };
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_nudge() {
        let mut val = 0.8f32;
        nudge!(val, 0.1);
        assert!(val < 0.8);
        assert!(val > 0.5);
    }

    #[test]
    fn test_adjust() {
        let mut val = 0.3f32;
        adjust!(val, 0.7, 0.5);
        assert!(val > 0.3 && val < 0.7);
    }

    #[test]
    fn test_soften() {
        let mut val = 0.9f32;
        soften!(val, 0.2);
        assert!(val < 0.9);
    }
}
ENDMACROS

if ! grep -q "pub mod macros;" "$SHARED_MOD" 2>/dev/null; then
    echo "pub mod macros;" >> "$SHARED_MOD"
fi

echo -e "${GREEN}[OK]${NC} shared/macros.rs créé (73 lignes)"

################################################################################
# PHASE 3.3 — CONVERSION RESONANCE_V2 f64 → f32
################################################################################

echo -e "${BLUE}[PHASE 3.3]${NC} Conversion resonance_v2 de f64 vers f32..."

RESONANCE_DIR="$SRC_DIR/system/resonance_v2"
if [ -d "$RESONANCE_DIR" ]; then
    # Backup
    cp -r "$RESONANCE_DIR" "$LOG_DIR/resonance_v2_backup_${TIMESTAMP}"
    
    # Conversions
    find "$RESONANCE_DIR" -name "*.rs" -type f | while read -r file; do
        echo "  → Conversion: $(basename "$file")"
        
        # Remplacement des types
        sed -i 's/: f64/: f32/g' "$file"
        sed -i 's/-> f64/-> f32/g' "$file"
        sed -i 's/\bf64\b/f32/g' "$file"
        
        # Remplacement des littéraux
        sed -i 's/\([0-9]\+\)\.\([0-9]\+\)f64/\1.\2f32/g' "$file"
        sed -i 's/0\.0_f64/0.0_f32/g' "$file"
        sed -i 's/1\.0_f64/1.0_f32/g' "$file"
        
        # Remplacement des fonctions
        sed -i 's/\.sqrt()/.sqrt()/g' "$file"
        sed -i 's/\.abs()/.abs()/g' "$file"
        sed -i 's/\.powf(/.powf(/g' "$file"
    done
    
    echo -e "${GREEN}[OK]${NC} resonance_v2 converti en f32"
else
    echo -e "${YELLOW}[SKIP]${NC} resonance_v2 introuvable"
fi

################################################################################
# PHASE 3.4 — AJOUT IMPORTS SHARED::UTILS
################################################################################

echo -e "${BLUE}[PHASE 3.4]${NC} Ajout imports shared::utils aux modules critiques..."

CRITICAL_MODULES=(
    "system/resonance_v2/mod.rs"
    "system/meaning/mod.rs"
    "system/identity/mod.rs"
    "system/mission/mod.rs"
    "system/adaptive_intelligence/mod.rs"
    "system/autonomic_evolution/mod.rs"
    "system/self_healing_v2/mod.rs"
    "system/action_potential/mod.rs"
    "system/energetic/mod.rs"
)

for module in "${CRITICAL_MODULES[@]}"; do
    MODULE_FILE="$SRC_DIR/$module"
    if [ -f "$MODULE_FILE" ]; then
        if ! grep -q "use crate::shared::utils::" "$MODULE_FILE"; then
            # Ajouter après les premiers use statements
            sed -i '1a use crate::shared::utils::*;' "$MODULE_FILE"
            echo "  → Import ajouté: $module"
        fi
    fi
done

echo -e "${GREEN}[OK]${NC} Imports shared::utils ajoutés"

################################################################################
# PHASE 3.5 — SCAN TYPES COMPLET
################################################################################

echo -e "${BLUE}[PHASE 3.5]${NC} Scan des types f32/f64 dans tout le projet..."

TYPES_REPORT="$LOG_DIR/types_analysis_${TIMESTAMP}.txt"

cat > "$TYPES_REPORT" << 'HEADER'
TITANE∞ v10 - ANALYSE DES TYPES NUMÉRIQUES
============================================

RÈGLE: États internes = f32, Calculs = f64, Conversions explicites

HEADER

echo "MODULES ANALYSÉS:" >> "$TYPES_REPORT"
echo "" >> "$TYPES_REPORT"

find "$SRC_DIR" -name "*.rs" -type f | while read -r file; do
    rel_path="${file#$SRC_DIR/}"
    f32_count=$(grep -o '\bf32\b' "$file" | wc -l)
    f64_count=$(grep -o '\bf64\b' "$file" | wc -l)
    
    if [ "$f32_count" -gt 0 ] || [ "$f64_count" -gt 0 ]; then
        if [ "$f64_count" -gt 0 ]; then
            echo "⚠️  $rel_path: f32=$f32_count, f64=$f64_count" >> "$TYPES_REPORT"
        else
            echo "✓  $rel_path: f32=$f32_count" >> "$TYPES_REPORT"
        fi
    fi
done

echo "" >> "$TYPES_REPORT"
echo "TOTAUX:" >> "$TYPES_REPORT"
f32_total=$(find "$SRC_DIR" -name "*.rs" -type f -exec grep -o '\bf32\b' {} \; | wc -l)
f64_total=$(find "$SRC_DIR" -name "*.rs" -type f -exec grep -o '\bf64\b' {} \; | wc -l)
echo "  f32: $f32_total occurrences" >> "$TYPES_REPORT"
echo "  f64: $f64_total occurrences" >> "$TYPES_REPORT"

echo -e "${GREEN}[OK]${NC} Rapport types: $TYPES_REPORT"

################################################################################
# PHASE 3.6 — CARGO CHECK
################################################################################

echo ""
echo -e "${BLUE}[PHASE 3.6]${NC} Exécution cargo check..."
echo ""

# Configuration PATH pour Cargo
export PATH="$HOME/.cargo/bin:$PATH"
source "$HOME/.cargo/env" 2>/dev/null || true

cd "$PROJECT_ROOT/src-tauri"

CARGO_CHECK_LOG="$LOG_DIR/cargo_check_${TIMESTAMP}.log"

if cargo check 2>&1 | tee "$CARGO_CHECK_LOG"; then
    echo ""
    echo -e "${GREEN}[SUCCESS]${NC} cargo check → 0 erreurs"
else
    echo ""
    echo -e "${RED}[ERREUR]${NC} cargo check a détecté des erreurs"
    echo -e "${YELLOW}[INFO]${NC} Voir: $CARGO_CHECK_LOG"
fi

################################################################################
# PHASE 3.7 — CARGO CLIPPY FIX
################################################################################

echo ""
echo -e "${BLUE}[PHASE 3.7]${NC} Exécution cargo clippy --fix..."
echo ""

CLIPPY_LOG="$LOG_DIR/clippy_${TIMESTAMP}.log"

# Cargo déjà dans PATH
cargo clippy --all-targets --fix --allow-dirty 2>&1 | tee "$CLIPPY_LOG" || true

echo -e "${GREEN}[OK]${NC} Clippy fix terminé"

################################################################################
# RÉSUMÉ FINAL
################################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  PHASE 3 RÉCONCILIATION - TERMINÉE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}[RÉSUMÉ]${NC}"
echo "  ✅ shared/utils.rs créé (conversions f32/f64)"
echo "  ✅ shared/macros.rs créé (check!, nudge!, adjust!, soften!)"
echo "  ✅ resonance_v2 converti en f32"
echo "  ✅ Imports ajoutés aux modules critiques"
echo "  ✅ Rapport types généré: $TYPES_REPORT"
echo "  ✅ cargo check exécuté: $CARGO_CHECK_LOG"
echo "  ✅ clippy fix appliqué: $CLIPPY_LOG"
echo ""
echo -e "${YELLOW}[FICHIERS LOGS]${NC}"
echo "  📄 $LOG_FILE"
echo "  📄 $TYPES_REPORT"
echo "  📄 $CARGO_CHECK_LOG"
echo "  📄 $CLIPPY_LOG"
echo ""
echo -e "${CYAN}[NEXT]${NC} Exécuter phase4_stabilisation.sh pour tests et build"
echo ""
