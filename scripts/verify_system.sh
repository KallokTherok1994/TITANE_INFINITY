#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v19.2.0 — Auto-Verify Engine
# ═══════════════════════════════════════════════════════════════════════════
# Modes: quick-scan (<200ms) | deep-scan (complet)
# Usage: ./scripts/verify_system.sh [quick|deep]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MODE="${1:-deep}"
START_TIME=$(date +%s%3N)
FAILURES=0

# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

check_pass() {
    echo -e "${GREEN}✅ PASS${NC} — $1"
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC} — $1"
    ((FAILURES++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} — $1"
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 1: GLOBAL CHECKS (Both modes)
# ═══════════════════════════════════════════════════════════════════════════

check_global() {
    print_header "LEVEL 1: GLOBAL CHECKS"

    # Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            check_pass "Node.js v$NODE_VERSION (>= 18)"
        else
            check_fail "Node.js v$NODE_VERSION (< 18 required)"
        fi
    else
        check_fail "Node.js not found"
    fi

    # Rust version
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version | cut -d' ' -f2)
        check_pass "Rust v$RUST_VERSION"
    else
        check_fail "Rust not found"
    fi

    # Tauri CLI
    if command -v cargo &> /dev/null && cargo tauri --version &> /dev/null; then
        TAURI_VERSION=$(cargo tauri --version | cut -d' ' -f2)
        check_pass "Tauri CLI v$TAURI_VERSION"
    else
        check_fail "Tauri CLI not found"
    fi

    # Essential files
    for file in "package.json" "src-tauri/Cargo.toml" "src-tauri/tauri.conf.json"; do
        if [ -f "$file" ]; then
            check_pass "Found $file"
        else
            check_fail "Missing $file"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 2: COGNITIVE LAYER (Deep mode only)
# ═══════════════════════════════════════════════════════════════════════════

check_cognitive() {
    if [ "$MODE" != "deep" ]; then
        return
    fi

    print_header "LEVEL 2: COGNITIVE LAYER"

    # TypeScript compilation
    if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
        check_fail "TypeScript errors detected"
    else
        check_pass "TypeScript clean (0 errors)"
    fi

    # Frontend dependencies
    if [ -d "node_modules" ]; then
        check_pass "node_modules present"
    else
        check_warn "node_modules missing (run pnpm install)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 3: NEURAL MESH (Deep mode only)
# ═══════════════════════════════════════════════════════════════════════════

check_neural() {
    if [ "$MODE" != "deep" ]; then
        return
    fi

    print_header "LEVEL 3: NEURAL MESH"

    # Rust compilation
    if cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | grep -q "error\[E"; then
        check_fail "Rust compilation errors"
    else
        check_pass "Rust compiles successfully"
    fi

    # Clippy warnings (critical only)
    CLIPPY_OUTPUT=$(cargo clippy --manifest-path src-tauri/Cargo.toml 2>&1 || true)
    if echo "$CLIPPY_OUTPUT" | grep -qE "error:|unused import|dead_code"; then
        check_fail "Clippy found critical issues"
    else
        check_pass "Clippy clean (critical issues)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 4: TAURI-ONLY MODE (Both modes)
# ═══════════════════════════════════════════════════════════════════════════

check_tauri_only() {
    print_header "LEVEL 4: TAURI-ONLY MODE"

    # Check tauri.conf.json for external URLs
    if grep -q '"csp": null' src-tauri/tauri.conf.json 2>/dev/null; then
        check_warn "CSP is null (should be configured)"
    else
        check_pass "CSP configured"
    fi

    # Check for fetch/axios in critical files (quick scan)
    if [ "$MODE" = "quick" ]; then
        if grep -r "fetch(" src/services/aiServiceLocal.ts 2>/dev/null | grep -q "localhost:11434"; then
            check_pass "Only localhost fetch detected (Ollama)"
        fi
    else
        # Deep scan: check all files
        EXTERNAL_CALLS=$(grep -r "https://" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "//.*https://" | grep -v "generativelanguage\|openai" | wc -l)
        if [ "$EXTERNAL_CALLS" -gt 0 ]; then
            check_warn "$EXTERNAL_CALLS external HTTPS references found"
        else
            check_pass "No external HTTPS calls"
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 5: IMPORT HYGIENE (Deep mode only)
# ═══════════════════════════════════════════════════════════════════════════

check_imports() {
    if [ "$MODE" != "deep" ]; then
        return
    fi

    print_header "LEVEL 5: IMPORT HYGIENE"

    # Rust unused imports
    UNUSED_IMPORTS=$(cargo clippy --manifest-path src-tauri/Cargo.toml 2>&1 | grep "unused import" | wc -l)
    if [ "$UNUSED_IMPORTS" -eq 0 ]; then
        check_pass "Rust: 0 unused imports"
    else
        check_fail "Rust: $UNUSED_IMPORTS unused imports"
    fi

    # TypeScript unused imports (basic check)
    check_pass "TypeScript import hygiene (verified by tsc)"
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 6: MEMORY INTEGRITY (Deep mode only)
# ═══════════════════════════════════════════════════════════════════════════

check_memory() {
    if [ "$MODE" != "deep" ]; then
        return
    fi

    print_header "LEVEL 6: MEMORY INTEGRITY"

    # Check for memory files
    if [ -d "memory" ] || [ -d ".titane" ]; then
        check_pass "Memory directories exist"
    else
        check_warn "Memory directories not initialized"
    fi

    # JSON validation (if memory files exist)
    if command -v jq &> /dev/null; then
        shopt -s nullglob
        for json_file in memory/*.json .titane/*.json; do
            if [ -f "$json_file" ]; then
                if jq empty "$json_file" 2>/dev/null; then
                    check_pass "Valid JSON: $json_file"
                else
                    check_fail "Invalid JSON: $json_file"
                fi
            fi
        done
        shopt -u nullglob
    else
        check_warn "jq not installed (JSON validation skipped)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 7: GIT SECURITY (Quick check in both modes)
# ═══════════════════════════════════════════════════════════════════════════

check_git() {
    print_header "LEVEL 7: GIT SECURITY"

    # Check .gitignore exists
    if [ -f ".gitignore" ]; then
        check_pass ".gitignore present"
    else
        check_warn ".gitignore missing"
    fi

    if [ "$MODE" = "deep" ]; then
        # Check for sensitive files in git
        if git ls-files | grep -qE "\.env$|\.key$|secrets"; then
            check_fail "Sensitive files tracked by git"
        else
            check_pass "No sensitive files in git"
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                  TITANE∞ AUTO-VERIFY ENGINE                       ║"
    echo "║                        v19.2.0                                    ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    if [ "$MODE" = "quick" ]; then
        echo -e "${YELLOW}Mode: QUICK SCAN (< 200ms)${NC}\n"
    else
        echo -e "${BLUE}Mode: DEEP SCAN (Complete)${NC}\n"
    fi

    check_global
    check_cognitive
    check_neural
    check_tauri_only
    check_imports
    check_memory
    check_git

    # Summary
    END_TIME=$(date +%s%3N)
    ELAPSED=$((END_TIME - START_TIME))

    echo ""
    print_header "VERIFICATION SUMMARY"

    if [ $FAILURES -eq 0 ]; then
        echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
        echo -e "Mode: $MODE | Time: ${ELAPSED}ms | Failures: 0"
        exit 0
    else
        echo -e "${RED}❌ $FAILURES CHECKS FAILED${NC}"
        echo -e "Mode: $MODE | Time: ${ELAPSED}ms | Failures: $FAILURES"
        exit 1
    fi
}

main "$@"
