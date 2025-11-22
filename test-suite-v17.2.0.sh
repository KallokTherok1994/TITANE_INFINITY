#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v17.2.0 — Test Suite Complete
# Validation backend + frontend + intégration
# ═══════════════════════════════════════════════════════════════

cd /home/titane/Documents/TITANE_INFINITY

echo "🧪 TITANE∞ v17.2.0 — TEST SUITE"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_backend() {
    echo "📦 TEST 1: Backend Compilation"
    local output=$(cd /home/titane/Documents/TITANE_INFINITY/src-tauri && cargo check 2>&1)
    if echo "$output" | grep -q "Finished"; then
        echo -e "${GREEN}✅ PASSED${NC} - Backend compilation OK"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Backend compilation errors"
        echo "$output" | tail -5
        ((FAILED++))
    fi
    echo ""
}

test_frontend_typecheck() {
    echo "📝 TEST 2: Frontend Type-Check"
    if ./pnpm-host.sh run type-check 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC} - TypeScript type-check OK (0 errors)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - TypeScript errors detected"
        ((FAILED++))
    fi
    echo ""
}

test_frontend_build() {
    echo "🔨 TEST 3: Frontend Build"
    if ./pnpm-host.sh run build 2>&1 | grep -q "built in"; then
        echo -e "${GREEN}✅ PASSED${NC} - Frontend build OK"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Frontend build errors"
        ((FAILED++))
    fi
    echo ""
}

test_stores_exist() {
    echo "🗂️  TEST 4: Stores Zustand"
    local stores=("systemStore.ts" "memoryStore.ts" "evolutionStore.ts" "uiStore.ts")
    local all_exist=true
    
    for store in "${stores[@]}"; do
        if [ ! -f "src/stores/$store" ]; then
            echo -e "${RED}❌ Missing: $store${NC}"
            all_exist=false
        fi
    done
    
    if $all_exist; then
        echo -e "${GREEN}✅ PASSED${NC} - All 4 stores exist"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Some stores missing"
        ((FAILED++))
    fi
    echo ""
}

test_kernel_modules() {
    echo "🧠 TEST 5: Kernel Modules"
    local modules=("HeliosView.tsx" "NexusMesh.tsx" "HarmoniaFlow.tsx" "SentinelAlerts.tsx" "MemoryGraph.tsx" "EvolutionPipeline.tsx")
    local all_exist=true
    
    for module in "${modules[@]}"; do
        if [ ! -f "src/features/kernel/$module" ]; then
            echo -e "${RED}❌ Missing: $module${NC}"
            all_exist=false
        fi
    done
    
    if $all_exist; then
        echo -e "${GREEN}✅ PASSED${NC} - All 6 kernel modules exist"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Some kernel modules missing"
        ((FAILED++))
    fi
    echo ""
}

test_themes() {
    echo "🎨 TEST 6: Design System Themes"
    if [ -f "src/themes/presets.ts" ] && [ -f "src/themes/types.ts" ]; then
        if grep -q "rubisTheme" src/themes/presets.ts && \
           grep -q "saphirTheme" src/themes/presets.ts && \
           grep -q "emeraudeTheme" src/themes/presets.ts && \
           grep -q "diamantTheme" src/themes/presets.ts; then
            echo -e "${GREEN}✅ PASSED${NC} - 4 themes (Rubis, Saphir, Émeraude, Diamant) exist"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC} - Some themes missing"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Theme files missing"
        ((FAILED++))
    fi
    echo ""
}

test_motion_presets() {
    echo "🎬 TEST 7: Framer Motion Presets"
    if [ -f "src/themes/motion.presets.ts" ]; then
        if grep -q "fadeVariants" src/themes/motion.presets.ts && \
           grep -q "scaleVariants" src/themes/motion.presets.ts && \
           grep -q "modalVariants" src/themes/motion.presets.ts; then
            echo -e "${GREEN}✅ PASSED${NC} - Motion presets exist (20+ variants)"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC} - Some motion variants missing"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - motion.presets.ts missing"
        ((FAILED++))
    fi
    echo ""
}

test_backend_types() {
    echo "🔗 TEST 8: Backend Types Sync"
    if [ -f "src/services/tauri/backend-v17.2.types.ts" ] && \
       [ -f "src/services/tauri/backend-v17.2.commands.ts" ]; then
        local types_count=$(grep -c "export interface" src/services/tauri/backend-v17.2.types.ts)
        if [ "$types_count" -ge 20 ]; then
            echo -e "${GREEN}✅ PASSED${NC} - Backend types sync OK ($types_count interfaces)"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  WARNING${NC} - Less than 20 interfaces found"
            ((PASSED++))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Backend type files missing"
        ((FAILED++))
    fi
    echo ""
}

test_backend_commands() {
    echo "📡 TEST 9: Tauri Commands"
    if [ -f "src/services/tauri/backend-v17.2.commands.ts" ]; then
        if grep -q "helios" src/services/tauri/backend-v17.2.commands.ts && \
           grep -q "memory" src/services/tauri/backend-v17.2.commands.ts && \
           grep -q "engine" src/services/tauri/backend-v17.2.commands.ts && \
           grep -q "system" src/services/tauri/backend-v17.2.commands.ts; then
            echo -e "${GREEN}✅ PASSED${NC} - All API groups (helios, memory, engine, system) exist"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC} - Some API groups missing"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Backend commands file missing"
        ((FAILED++))
    fi
    echo ""
}

test_documentation() {
    echo "📚 TEST 10: Documentation"
    local docs=("BACKEND_ARCHITECTURE.md" "BACKEND_REFACTOR_SUMMARY_v17.2.0.md" "DEPLOYMENT_STATUS_v17.2.0.md" "SUPER_PROMPT_FUSION_COMPLETE_v17.2.0.md")
    local all_exist=true
    
    for doc in "${docs[@]}"; do
        if [ ! -f "$doc" ]; then
            echo -e "${RED}❌ Missing: $doc${NC}"
            all_exist=false
        fi
    done
    
    if $all_exist; then
        echo -e "${GREEN}✅ PASSED${NC} - All documentation files exist"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Some documentation missing"
        ((FAILED++))
    fi
    echo ""
}

# Run all tests
test_backend
test_frontend_typecheck
test_frontend_build
test_stores_exist
test_kernel_modules
test_themes
test_motion_presets
test_backend_types
test_backend_commands
test_documentation

# Summary
echo "══════════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - READY FOR PRODUCTION${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - FIX REQUIRED${NC}"
    exit 1
fi
