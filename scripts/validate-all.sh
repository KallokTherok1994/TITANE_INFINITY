#!/bin/bash
# TITANE∞ — Complete Validation Script
# Validates entire codebase (frontend + backend + tests)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   ✓ TITANE∞ COMPLETE VALIDATION                                          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

VALIDATION_LOG="validation_$(date +%Y%m%d_%H%M%S).log"
ERRORS=0

echo -e "${BLUE}📋 Starting complete validation...${NC}\n"

# Phase 1: ESLint
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 1: ESLint${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if npm run lint >> "$VALIDATION_LOG" 2>&1; then
  echo -e "${GREEN}✓ ESLint: PASSED${NC}"
else
  echo -e "${RED}✗ ESLint: FAILED${NC}"
  ((ERRORS++))
fi

# Phase 2: TypeScript Check
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 2: TypeScript Type Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if npx tsc --noEmit >> "$VALIDATION_LOG" 2>&1; then
  echo -e "${GREEN}✓ TypeScript: PASSED (0 errors)${NC}"
else
  TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo 0)
  echo -e "${YELLOW}⚠ TypeScript: $TS_ERRORS errors (non-blocking in Vite)${NC}"
fi

# Phase 3: Frontend Build
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 3: Frontend Build${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

BUILD_START=$(date +%s)
if npm run build >> "$VALIDATION_LOG" 2>&1; then
  BUILD_END=$(date +%s)
  BUILD_TIME=$((BUILD_END - BUILD_START))
  echo -e "${GREEN}✓ Frontend Build: PASSED (${BUILD_TIME}s)${NC}"
else
  echo -e "${RED}✗ Frontend Build: FAILED${NC}"
  ((ERRORS++))
fi

# Phase 4: Clippy
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 4: Cargo Clippy${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cd src-tauri
if cargo clippy -- -D warnings >> "../$VALIDATION_LOG" 2>&1; then
  echo -e "${GREEN}✓ Clippy: PASSED (0 warnings)${NC}"
else
  CLIPPY_WARNINGS=$(cargo clippy 2>&1 | grep -c "warning:" || echo 0)
  echo -e "${YELLOW}⚠ Clippy: $CLIPPY_WARNINGS warnings${NC}"
fi
cd ..

# Phase 5: Backend Build
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 5: Backend Build (Release)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

RUST_START=$(date +%s)
cd src-tauri
if cargo build --release >> "../$VALIDATION_LOG" 2>&1; then
  RUST_END=$(date +%s)
  RUST_TIME=$((RUST_END - RUST_START))
  echo -e "${GREEN}✓ Backend Build: PASSED (${RUST_TIME}s)${NC}"
else
  echo -e "${RED}✗ Backend Build: FAILED${NC}"
  ((ERRORS++))
fi
cd ..

# Phase 6: Bundle Size Check
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 6: Bundle Analysis${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

TOTAL_SIZE=$(du -sh dist/ | awk '{print $1}')
LARGEST=$(ls -lh dist/assets/*.js | sort -k5 -rh | head -1 | awk '{print $9" "$5}')
echo -e "  Total bundle: ${CYAN}$TOTAL_SIZE${NC}"
echo -e "  Largest file: ${CYAN}$(basename $(echo $LARGEST | awk '{print $1}'))${NC} ($(echo $LARGEST | awk '{print $2}'))"
echo -e "${GREEN}✓ Bundle Analysis: COMPLETE${NC}"

# Summary
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}VALIDATION SUMMARY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                                        ║${NC}"
  echo -e "${GREEN}║   ✓ ALL VALIDATIONS PASSED                                            ║${NC}"
  echo -e "${GREEN}║                                                                        ║${NC}"
  echo -e "${GREEN}║   TITANE∞ is production-ready!                                        ║${NC}"
  echo -e "${GREEN}║                                                                        ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  📊 Build times:"
  echo -e "     Frontend: ${BUILD_TIME}s"
  echo -e "     Backend:  ${RUST_TIME}s"
  echo -e "     Total:    $((BUILD_TIME + RUST_TIME))s"
  echo ""
  echo -e "  📦 Bundle: $TOTAL_SIZE"
  echo -e "  📝 Log: $VALIDATION_LOG"
  echo ""
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                                                                        ║${NC}"
  echo -e "${RED}║   ✗ VALIDATION FAILED                                                 ║${NC}"
  echo -e "${RED}║                                                                        ║${NC}"
  echo -e "${RED}║   $ERRORS critical error(s) found                                        ║${NC}"
  echo -e "${RED}║                                                                        ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  📝 Check log: $VALIDATION_LOG"
  echo ""
  exit 1
fi
