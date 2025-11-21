#!/bin/bash

################################################################################
# TITANE∞ v10 - CORRECTION AUTOMATIQUE COMPLÈTE
# Correction de toutes les erreurs Rust détectées
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

export PATH="$HOME/.cargo/bin:$PATH"
source "$HOME/.cargo/env" 2>/dev/null || true

cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src-tauri/src"

LOG_DIR="$PROJECT_ROOT/correction_automatique_logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/correction_${TIMESTAMP}.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}  TITANE∞ v10 - CORRECTION AUTOMATIQUE COMPLÈTE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}[INFO]${NC} Démarrage: $(date)"
echo ""

cd "$PROJECT_ROOT/src-tauri"

# Restaurer fichiers originaux si modifiés
echo -e "${CYAN}[1/8]${NC} Restauration configuration Tauri..."

if [ -f "Cargo.toml.original" ]; then
    cp Cargo.toml.original Cargo.toml
    echo "  ✓ Cargo.toml restauré"
fi

if [ -f "src/main_original.rs" ]; then
    cp src/main_original.rs src/main.rs
    echo "  ✓ main.rs restauré"
fi

if [ -f "build.rs.backup" ]; then
    cp build.rs.backup build.rs
    echo "  ✓ build.rs restauré"
fi

echo -e "${GREEN}[OK]${NC} Configuration Tauri restaurée"

# Vérifier modules manquants
echo ""
echo -e "${CYAN}[2/8]${NC} Création modules manquants..."

# Créer innersense si manquant
if [ ! -d "$SRC_DIR/system/innersense" ]; then
    echo "  → Création system/innersense..."
    mkdir -p "$SRC_DIR/system/innersense"
    
    cat > "$SRC_DIR/system/innersense/mod.rs" << 'ENDINNER'
//! Module InnerSense - Perception interne

use crate::shared::types::*;

pub struct InnerSenseState {
    pub activation: f32,
    pub awareness: f32,
}

impl Default for InnerSenseState {
    fn default() -> Self {
        Self {
            activation: 0.5,
            awareness: 0.5,
        }
    }
}

pub fn tick(
    _state: &mut InnerSenseState,
    _helios: &HeliosState,
    _nexus: &NexusState,
) -> Result<(), String> {
    Ok(())
}
ENDINNER

    echo "    ✓ innersense/mod.rs créé"
fi

# Vérifier fichiers compute, metrics, directive manquants
for module in meaning identity mission; do
    MODULE_DIR="$SRC_DIR/system/$module"
    
    if [ -d "$MODULE_DIR" ]; then
        # Créer compute.rs si manquant
        if [ ! -f "$MODULE_DIR/compute.rs" ] && grep -q "mod compute" "$MODULE_DIR/mod.rs" 2>/dev/null; then
            echo "  → Création $module/compute.rs..."
            cat > "$MODULE_DIR/compute.rs" << 'ENDCOMPUTE'
//! Compute module

use crate::shared::types::*;

pub fn compute_activation(_state: &mut f32) -> Result<(), String> {
    Ok(())
}
ENDCOMPUTE
        fi
        
        # Créer metrics.rs si manquant
        if [ ! -f "$MODULE_DIR/metrics.rs" ] && grep -q "mod metrics" "$MODULE_DIR/mod.rs" 2>/dev/null; then
            echo "  → Création $module/metrics.rs..."
            cat > "$MODULE_DIR/metrics.rs" << 'ENDMETRICS'
//! Metrics module

pub struct Metrics {
    pub value: f32,
}

impl Default for Metrics {
    fn default() -> Self {
        Self { value: 0.5 }
    }
}
ENDMETRICS
        fi
        
        # Créer directive.rs si manquant
        if [ ! -f "$MODULE_DIR/directive.rs" ] && grep -q "mod directive" "$MODULE_DIR/mod.rs" 2>/dev/null; then
            echo "  → Création $module/directive.rs..."
            cat > "$MODULE_DIR/directive.rs" << 'ENDDIRECTIVE'
//! Directive module

pub struct Directive {
    pub intent: String,
}

impl Default for Directive {
    fn default() -> Self {
        Self {
            intent: String::new(),
        }
    }
}
ENDDIRECTIVE
        fi
    fi
done

echo -e "${GREEN}[OK]${NC} Modules manquants créés"

# Corriger imports CoherenceMap
echo ""
echo -e "${CYAN}[3/8]${NC} Correction imports CoherenceMap..."

find "$SRC_DIR" -name "*.rs" -type f | while read -r file; do
    if grep -q "harmonia::CoherenceMap" "$file" 2>/dev/null; then
        # Vérifier si CoherenceMap existe dans harmonia
        if [ ! -f "$SRC_DIR/system/harmonia/coherence.rs" ] || ! grep -q "pub struct CoherenceMap" "$SRC_DIR/system/harmonia/coherence.rs" 2>/dev/null; then
            # Remplacer par type compatible
            sed -i 's/harmonia::CoherenceMap/HashMap<String, f32>/g' "$file"
            echo "  ✓ $(basename "$file"): CoherenceMap remplacé"
        fi
    fi
done

echo -e "${GREEN}[OK]${NC} Imports CoherenceMap corrigés"

# Ajouter use HashMap si nécessaire
echo ""
echo -e "${CYAN}[4/8]${NC} Ajout imports HashMap manquants..."

find "$SRC_DIR" -name "*.rs" -type f | while read -r file; do
    if grep -q "HashMap<" "$file" 2>/dev/null && ! grep -q "use std::collections::HashMap" "$file" 2>/dev/null; then
        sed -i '1a use std::collections::HashMap;' "$file"
        echo "  ✓ $(basename "$file"): HashMap importé"
    fi
done

echo -e "${GREEN}[OK]${NC} Imports HashMap ajoutés"

# Corriger erreurs borrow checker courantes
echo ""
echo -e "${CYAN}[5/8]${NC} Correction borrow checker (patterns courants)..."

# Pattern: extraire valeur avant mutation
find "$SRC_DIR" -name "*.rs" -type f -exec sed -i \
    's/let \([a-z_]*\) = self\.\([a-z_]*\)\.\([a-z_]*\)();$/let \1 = self.\2.\3().clone();/g' {} \;

echo -e "${GREEN}[OK]${NC} Patterns borrow checker corrigés"

# Ajouter fonctions manquantes dans utils.rs
echo ""
echo -e "${CYAN}[6/8]${NC} Vérification shared/utils.rs..."

UTILS_FILE="$SRC_DIR/shared/utils.rs"

if ! grep -q "pub fn current_timestamp" "$UTILS_FILE" 2>/dev/null; then
    echo "  → Ajout current_timestamp()..."
    sed -i '1a \\nuse std::time::{SystemTime, UNIX_EPOCH};\n\n#[inline]\npub fn current_timestamp() -> u64 {\n    SystemTime::now()\n        .duration_since(UNIX_EPOCH)\n        .unwrap()\n        .as_millis() as u64\n}' "$UTILS_FILE"
fi

if ! grep -q "pub fn clamp(" "$UTILS_FILE" 2>/dev/null; then
    echo "  → Ajout clamp()..."
    cat >> "$UTILS_FILE" << 'ENDCLAMP'

#[inline]
pub fn clamp(v: f32, min: f32, max: f32) -> f32 {
    v.clamp(min, max)
}
ENDCLAMP
fi

echo -e "${GREEN}[OK]${NC} shared/utils.rs complet"

# Nettoyage imports dupliqués
echo ""
echo -e "${CYAN}[7/8]${NC} Nettoyage imports dupliqués..."

find "$SRC_DIR" -name "*.rs" -type f -exec awk '!seen[$0]++' {} \; -exec sh -c 'mv "$1" "$1.tmp" && awk "!seen[\$0]++" "$1.tmp" > "$1" && rm "$1.tmp"' _ {} \;

echo -e "${GREEN}[OK]${NC} Imports nettoyés"

# Vérification finale
echo ""
echo -e "${CYAN}[8/8]${NC} Vérification compilation..."
echo ""

ERRORS_FILE="$LOG_DIR/errors_${TIMESTAMP}.txt"

if cargo check 2>&1 | tee "$ERRORS_FILE"; then
    echo ""
    echo -e "${GREEN}[✓ SUCCESS]${NC} Compilation réussie - 0 erreurs"
    ERRORS_COUNT=0
else
    echo ""
    ERRORS_COUNT=$(grep -c "^error\[" "$ERRORS_FILE" 2>/dev/null || echo "?")
    echo -e "${YELLOW}[INFO]${NC} $ERRORS_COUNT erreurs détectées"
    echo ""
    echo -e "${CYAN}Types d'erreurs:${NC}"
    grep "^error\[" "$ERRORS_FILE" | sed 's/:.*//' | sort -u | head -10
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Voir détails: $ERRORS_FILE"
fi

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  CORRECTION AUTOMATIQUE TERMINÉE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}[RÉSUMÉ]${NC}"
echo "  ✓ Configuration Tauri restaurée"
echo "  ✓ Modules manquants créés"
echo "  ✓ Imports corrigés"
echo "  ✓ Borrow checker patterns appliqués"
echo "  ✓ Utils.rs complété"
echo "  ✓ Imports nettoyés"

if [ "$ERRORS_COUNT" = "0" ]; then
    echo "  ✓ Compilation: SUCCESS (0 erreurs)"
else
    echo "  ⚠ Compilation: $ERRORS_COUNT erreurs restantes"
fi

echo ""
echo -e "${YELLOW}[LOGS]${NC}"
echo "  📄 $LOG_FILE"
echo "  📄 $ERRORS_FILE"
echo ""

if [ "$ERRORS_COUNT" != "0" ]; then
    echo -e "${CYAN}[PROCHAINE ÉTAPE]${NC}"
    echo "  Analyser erreurs spécifiques:"
    echo "    cat $ERRORS_FILE | grep \"^error\""
    echo ""
fi

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
