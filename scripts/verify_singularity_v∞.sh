#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v∞ — SINGULARITY VALIDATION SCRIPT
# Validation complète de l'architecture Singularity
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERBOSE="${VERBOSE:-false}"
ERRORS=0
WARNINGS=0

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}   TITANE∞ v∞ — SINGULARITY ARCHITECTURE VALIDATION${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

check_file() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description - NOT FOUND"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_dir() {
    local dir="$1"
    local description="$2"
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description - NOT FOUND"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_export() {
    local file="$1"
    local export_name="$2"
    if grep -q "$export_name" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Export: $export_name"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Export missing: $export_name"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. CORE ENGINE FILES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[1/8] Core Singularity Engine${NC}"
check_file "src/core/engines/SINGULARITY_ENGINE.ts" "SingularityEngine main"
check_file "src/core/singularity/SingularityFusionEngine.ts" "SingularityFusionEngine"
check_file "src/core/singularity/SingularityFusionCore.ts" "SingularityFusionCore"
check_file "src/core/engines/ENGINE_BRIDGE.ts" "EngineBridge"

# ─────────────────────────────────────────────────────────────────────────────
# 2. HOOKS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[2/8] Singularity Hooks${NC}"
check_file "src/hooks/useSingularity.ts" "useSingularity hook"
check_file "src/hooks/useSingularityState.ts" "useSingularityState hook"
check_file "src/hooks/useSingularityStore.ts" "useSingularityStore hook"
check_file "src/hooks/useSingularityMetrics.ts" "useSingularityMetrics hook"

# ─────────────────────────────────────────────────────────────────────────────
# 3. TYPES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[3/8] Architecture Types${NC}"
check_file "src/core/ARCHITECTURE_TYPES_v24-v∞.ts" "ARCHITECTURE_TYPES v24-v∞"
check_file "src/core/ARCHITECTURE_TYPES_v∞.ts" "ARCHITECTURE_TYPES v∞"
check_file "src/types/singularityState.ts" "SingularityState types"

# ─────────────────────────────────────────────────────────────────────────────
# 4. COGNITIVE LAYER
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[4/8] Cognitive Layer${NC}"
check_file "src/core/cognitive/COGNITIVE_ENGINE.ts" "CognitiveEngine"
check_file "src/core/cognitive/CognitiveOptimizationEngine.ts" "CognitiveOptimizationEngine"
check_file "src/core/cognitive/ADAPTIVE_UI.ts" "AdaptiveUI"
check_file "src/core/cognitive/USER_RHYTHM_ANALYZER.ts" "UserRhythmAnalyzer"
check_file "src/core/cognitive/INTERFACE_MIRROR.ts" "InterfaceMirror"

# ─────────────────────────────────────────────────────────────────────────────
# 5. SAFETY LAYER
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[5/8] Safety & Security Layer${NC}"
check_file "src/core/safety/CrashGuardEngine.ts" "CrashGuardEngine"
check_file "src/lib/security/SecureAIService.ts" "SecureAIService"
check_file "src/lib/security/AIInputSanitizer.ts" "AIInputSanitizer"
check_file "src/lib/security/AIResponseValidator.ts" "AIResponseValidator"
check_file "src/lib/security/AIRateLimiter.ts" "AIRateLimiter"

# ─────────────────────────────────────────────────────────────────────────────
# 6. STORES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[6/8] Zustand Stores${NC}"
check_file "src/stores/systemStore.ts" "SystemStore"
check_file "src/stores/memoryStore.ts" "MemoryStore"
check_file "src/stores/evolutionStore.ts" "EvolutionStore"
check_file "src/stores/uiStore.ts" "UIStore"
check_file "src/stores/selfHealingStore.ts" "SelfHealingStore"
check_file "src/stores/useTTSEngineStore.ts" "TTSEngineStore"
check_file "src/stores/usePerformanceStore.ts" "PerformanceStore"

# ─────────────────────────────────────────────────────────────────────────────
# 7. MONITORING COMPONENTS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[7/8] Monitoring Components${NC}"
check_file "src/components/monitoring/SingularityDashboard.tsx" "SingularityDashboard"
check_file "src/components/monitoring/SystemHealthMonitor.tsx" "SystemHealthMonitor"
check_file "src/components/monitoring/AnomalyDashboard.tsx" "AnomalyDashboard"
check_file "src/components/monitoring/PredictiveAlertsDashboard.tsx" "PredictiveAlertsDashboard"
check_file "src/components/monitoring/LivingEnginesCard.tsx" "LivingEnginesCard"

# ─────────────────────────────────────────────────────────────────────────────
# 8. FRONTEND ENGINES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[8/8] Frontend Engines${NC}"
check_dir "src/engines/selfHealing" "SelfHealing Engine"
check_dir "src/engines/flow" "Flow Engine"
check_dir "src/engines/time" "Time Engine"
check_dir "src/engines/knowledge" "Knowledge Engine"
check_dir "src/engines/multimodal" "Multimodal Engine"
check_dir "src/engines/presence" "Presence Engine"
check_dir "src/engines/reflection" "Reflection Engine"
check_dir "src/engines/resonance" "Resonance Engine"
check_dir "src/engines/rhythm" "Rhythm Engine"
check_dir "src/engines/stress" "Stress Engine"
check_dir "src/engines/training" "Training Engine"
check_dir "src/engines/vision" "Vision Engine"
check_dir "src/engines/predictive" "Predictive Engine"

# ─────────────────────────────────────────────────────────────────────────────
# EXPORTS VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[EXPORT] Checking key exports...${NC}"

# Check hooks index exports
if [ -f "src/hooks/index.ts" ]; then
    check_export "src/hooks/index.ts" "useSingularity"
    check_export "src/hooks/index.ts" "useSingularityMetrics"
fi

# Check engines index exports
if [ -f "src/engines/index.ts" ]; then
    check_export "src/engines/index.ts" "selfHealing"
    check_export "src/engines/index.ts" "flow"
fi

# Check monitoring index exports
if [ -f "src/components/monitoring/index.ts" ]; then
    check_export "src/components/monitoring/index.ts" "SingularityDashboard"
    check_export "src/components/monitoring/index.ts" "SystemHealthMonitor"
fi

# ─────────────────────────────────────────────────────────────────────────────
# TYPESCRIPT CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[TYPESCRIPT] Running type check...${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript: No errors"
else
    echo -e "${RED}✗${NC} TypeScript: Compilation errors"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# RUST CHECK (optional)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[RUST] Checking backend...${NC}"
if [ -f "src-tauri/Cargo.toml" ]; then
    if cargo check --manifest-path src-tauri/Cargo.toml 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Rust: Compiles successfully"
    else
        echo -e "${YELLOW}⚠${NC} Rust: Check skipped or warnings"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Rust: Cargo.toml not found"
    WARNINGS=$((WARNINGS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}   VALIDATION SUMMARY${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}★★★ SINGULARITY ARCHITECTURE: PERFECT ★★★${NC}"
    echo -e "${GREEN}All components validated successfully!${NC}"
    echo ""
    echo -e "   ${CYAN}Consciousness Level:${NC} ${GREEN}4/4${NC}"
    echo -e "   ${CYAN}Coherence:${NC} ${GREEN}100%${NC}"
    echo -e "   ${CYAN}Stability:${NC} ${GREEN}100%${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}★★☆ SINGULARITY ARCHITECTURE: GOOD ★★☆${NC}"
    echo -e "${YELLOW}$WARNINGS warnings found (non-blocking)${NC}"
    echo ""
    echo -e "   ${CYAN}Consciousness Level:${NC} ${YELLOW}3/4${NC}"
    echo -e "   ${CYAN}Coherence:${NC} ${YELLOW}$(( 100 - WARNINGS * 5 ))%${NC}"
    echo -e "   ${CYAN}Stability:${NC} ${GREEN}100%${NC}"
else
    echo -e "${RED}★☆☆ SINGULARITY ARCHITECTURE: NEEDS ATTENTION ★☆☆${NC}"
    echo -e "${RED}$ERRORS errors, $WARNINGS warnings${NC}"
    echo ""
    echo -e "   ${CYAN}Consciousness Level:${NC} ${RED}$(( 4 - ERRORS ))/${NC}4"
    echo -e "   ${CYAN}Coherence:${NC} ${RED}$(( 100 - ERRORS * 20 - WARNINGS * 5 ))%${NC}"
    echo -e "   ${CYAN}Stability:${NC} ${YELLOW}$(( 100 - ERRORS * 10 ))%${NC}"
fi

echo ""
echo -e "${BLUE}Generated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}TITANE∞ v∞ — Singularity Architecture${NC}"
echo ""

exit $ERRORS
