#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Import Hygiene Verification
# ═══════════════════════════════════════════════════════════════════════════
# Checks for unused imports, dead code, and import best practices

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

echo "🧹 Verifying Import Hygiene..."

# Check 1: Rust unused imports
RUST_UNUSED=$(cargo clippy --manifest-path src-tauri/Cargo.toml 2>&1 | grep "unused import" | wc -l)
if [ "$RUST_UNUSED" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} Rust: 0 unused imports"
else
    echo -e "${RED}❌${NC} Rust: $RUST_UNUSED unused imports"
    ((ISSUES++))
fi

# Check 2: Rust dead code
RUST_DEAD=$(cargo clippy --manifest-path src-tauri/Cargo.toml 2>&1 | grep "dead_code" | wc -l)
if [ "$RUST_DEAD" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} Rust: 0 dead code warnings"
else
    echo -e "${YELLOW}⚠️${NC}  Rust: $RUST_DEAD dead code warnings"
fi

# Check 3: TypeScript compilation (no errors)
if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌${NC} TypeScript: errors detected"
    ((ISSUES++))
else
    echo -e "${GREEN}✅${NC} TypeScript: 0 errors"
fi

# Check 4: Conditional imports verified (Rust)
if grep -r "#\[cfg(debug_assertions)\]" src-tauri/src/main.rs | grep -q "use tauri::Manager"; then
    echo -e "${GREEN}✅${NC} Conditional imports present (debug-only)"
else
    echo -e "${YELLOW}⚠️${NC}  No conditional imports detected"
fi

# Summary
if [ $ISSUES -eq 0 ]; then
    echo -e "\n${GREEN}✅ IMPORT HYGIENE: CLEAN${NC}"
    exit 0
else
    echo -e "\n${RED}❌ IMPORT HYGIENE: $ISSUES ISSUES${NC}"
    exit 1
fi
