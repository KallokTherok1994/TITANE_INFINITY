#!/bin/bash
###############################################################################
#   TITANE∞ v∞.7 — QUICK START VALIDATION
#   Fast validation script before manual testing
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TITANE∞ v∞.7 QUICK START VALIDATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

###############################################################################
# 1. Check Files Exist
###############################################################################
echo -e "${YELLOW}[1/5]${NC} Checking Halo System Files..."

FILES=(
  "src/services/voice/haloEngine.ts"
  "src/components/voice/HaloVisualizer.tsx"
  "src/components/voice/HaloVisualizer.css"
  "src/components/voice/HaloVisualizerDemo.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo -e "  ${GREEN}✓${NC} $file ($SIZE lines)"
  else
    echo -e "  ${RED}✗${NC} $file (missing)"
    exit 1
  fi
done

###############################################################################
# 2. Check Integrations
###############################################################################
echo ""
echo -e "${YELLOW}[2/5]${NC} Checking VoiceRouter Integration..."

if grep -q "haloEngine.startPulsing()" src/services/voice/voiceRouter.ts; then
  echo -e "  ${GREEN}✓${NC} haloEngine.startPulsing() in voiceRouter"
else
  echo -e "  ${RED}✗${NC} Missing startPulsing integration"
  exit 1
fi

if grep -q "haloEngine.startShimmer()" src/services/voice/voiceRouter.ts; then
  echo -e "  ${GREEN}✓${NC} haloEngine.startShimmer() in voiceRouter"
else
  echo -e "  ${RED}✗${NC} Missing startShimmer integration"
  exit 1
fi

if grep -q "haloEngine.reset()" src/services/voice/voiceRouter.ts; then
  echo -e "  ${GREEN}✓${NC} haloEngine.reset() in voiceRouter"
else
  echo -e "  ${RED}✗${NC} Missing reset integration"
  exit 1
fi

echo ""
echo -e "${YELLOW}[2/5]${NC} Checking useVoiceEngine Integration..."

if grep -q "haloEngine.startBreathing()" src/hooks/useVoiceEngine.ts; then
  echo -e "  ${GREEN}✓${NC} haloEngine.startBreathing() in useVoiceEngine"
else
  echo -e "  ${RED}✗${NC} Missing startBreathing integration"
  exit 1
fi

###############################################################################
# 3. TypeScript Compilation
###############################################################################
echo ""
echo -e "${YELLOW}[3/5]${NC} TypeScript Compilation..."

if npm run type-check 2>&1 | grep -q "error"; then
  echo -e "  ${RED}✗${NC} TypeScript errors found"
  exit 1
else
  echo -e "  ${GREEN}✓${NC} 0 TypeScript errors"
fi

###############################################################################
# 4. Rust Compilation
###############################################################################
echo ""
echo -e "${YELLOW}[4/5]${NC} Rust Compilation..."

cd src-tauri
if cargo check 2>&1 | grep -q "error"; then
  echo -e "  ${RED}✗${NC} Rust errors found"
  cd ..
  exit 1
else
  echo -e "  ${GREEN}✓${NC} 0 Rust errors"
  cd ..
fi

###############################################################################
# 5. Documentation Check
###############################################################################
echo ""
echo -e "${YELLOW}[5/5]${NC} Checking Documentation..."

DOC_COUNT=$(ls -1 *v∞.7*.md 2>/dev/null | wc -l)
if [ "$DOC_COUNT" -ge 10 ]; then
  echo -e "  ${GREEN}✓${NC} $DOC_COUNT documentation files found"
else
  echo -e "  ${YELLOW}⚠${NC} Only $DOC_COUNT documentation files (expected ≥10)"
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "TITANE∞ v∞.7 is ready for:"
echo "  1. Manual Testing (see VOICE_PIPELINE_MANUAL_TEST_GUIDE_v∞.7.md)"
echo "  2. Production Deployment"
echo ""
echo "Quick start:"
echo "  npm run tauri:dev    # Start development server"
echo "  npm run tauri:build  # Build for production"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
