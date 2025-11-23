#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — BACKEND REPAIR v1.0.0
#   Nettoie et reconstruit le backend complètement
# ═══════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 TITANE∞ Backend Repair${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 1: Clean Build Artifacts (10s)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[1/4]${NC} Cleaning build artifacts..."

cd src-tauri
if cargo clean; then
    echo -e "${GREEN}✓${NC} Cargo clean successful"
else
    echo -e "${RED}✗${NC} Cargo clean failed"
fi
cd ..

echo -e "Removing frontend artifacts..."
rm -rf dist .vite
echo -e "${GREEN}✓${NC} Frontend artifacts removed"

# ═══════════════════════════════════════════════════════════════
# STEP 2: Rebuild Backend (1-2 min)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[2/4]${NC} Rebuilding backend..."

cd src-tauri
if cargo build 2>&1 | tail -20; then
    echo -e "${GREEN}✓${NC} Backend rebuild successful"
else
    echo -e "${RED}✗${NC} Backend rebuild failed"
    echo -e "${YELLOW}Manual intervention required${NC}"
    exit 1
fi
cd ..

# ═══════════════════════════════════════════════════════════════
# STEP 3: Run SelfHeal (Optional - if app running)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[3/4]${NC} Checking SelfHeal..."

if pgrep -f "titane-infinity" > /dev/null; then
    echo -e "${YELLOW}⚠️${NC}  App is running"
    echo -e "   ${YELLOW}Manually run: invoke('run_evolution')${NC}"
else
    echo -e "${YELLOW}⚠️${NC}  App not running (skipping SelfHeal)"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 4: Verify Again (2 min)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[4/4]${NC} Running verification..."
echo ""

if ./verify_backend.sh --quick; then
    echo ""
    echo -e "${GREEN}✅ Backend repair COMPLETE${NC}"
    echo -e "   Backend is now clean and verified"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Backend repair INCOMPLETE${NC}"
    echo -e "   Verification failed after repair"
    echo -e "   Check logs in src-tauri/"
    exit 1
fi
