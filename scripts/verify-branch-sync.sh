#!/bin/bash
#
# Script: verify-branch-sync.sh
# Purpose: Determine the correct merge direction for dev ↔ MAIN
# Author: TITANE_INFINITY Team
# Date: 2026-01-01
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Branch Synchronization Verification Tool      ║${NC}"
echo -e "${BLUE}║              dev ↔ MAIN Analysis                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check we're in a git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not in a git repository. Please run from repository root.${NC}"
    echo -e "${BLUE}ℹ️  Expected: /path/to/TITANE_INFINITY/${NC}"
    echo -e "${BLUE}ℹ️  Current: $(pwd)${NC}"
    exit 1
fi

echo -e "${BLUE}→ Fetching latest branch information...${NC}"
if ! git fetch origin dev MAIN 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Could not fetch branches. Continuing with local data...${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           BRANCH STATUS ANALYSIS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Get current branch SHAs
MAIN_SHA=$(git rev-parse origin/MAIN 2>/dev/null || git rev-parse MAIN)
DEV_SHA=$(git rev-parse origin/dev 2>/dev/null || git rev-parse dev)

echo -e "${GREEN}MAIN Branch:${NC}"
echo "  SHA: $MAIN_SHA"
echo "  Commit: $(git log -1 --oneline $MAIN_SHA)"
echo "  Date: $(git log -1 --format=%ai $MAIN_SHA)"
echo ""

echo -e "${GREEN}dev Branch:${NC}"
echo "  SHA: $DEV_SHA"
echo "  Commit: $(git log -1 --oneline $DEV_SHA)"
echo "  Date: $(git log -1 --format=%ai $DEV_SHA)"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}         COMMIT DIFFERENCE ANALYSIS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Check commits in dev not in MAIN
echo -e "${YELLOW}Commits in dev that are NOT in MAIN:${NC}"
DEV_COMMITS=$(git log --oneline origin/MAIN..origin/dev 2>/dev/null || git log --oneline MAIN..dev 2>/dev/null || echo "")

if [ -z "$DEV_COMMITS" ]; then
    echo -e "${GREEN}  ✅ NONE - dev has no unique commits${NC}"
    echo ""
    UNIQUE_IN_DEV=0
else
    echo "$DEV_COMMITS" | nl
    echo ""
    UNIQUE_IN_DEV=$(echo "$DEV_COMMITS" | wc -l)
    echo -e "${YELLOW}  Total: $UNIQUE_IN_DEV commit(s)${NC}"
    echo ""
fi

# Check commits in MAIN not in dev
echo -e "${YELLOW}Commits in MAIN that are NOT in dev:${NC}"
MAIN_COMMITS=$(git log --oneline origin/dev..origin/MAIN 2>/dev/null || git log --oneline dev..MAIN 2>/dev/null || echo "")

if [ -z "$MAIN_COMMITS" ]; then
    echo -e "${GREEN}  ✅ NONE - MAIN has no unique commits${NC}"
    echo ""
    UNIQUE_IN_MAIN=0
else
    echo "$MAIN_COMMITS" | head -10 | nl
    echo ""
    UNIQUE_IN_MAIN=$(echo "$MAIN_COMMITS" | wc -l)
    echo -e "${YELLOW}  Total: $UNIQUE_IN_MAIN commit(s)${NC}"
    if [ $UNIQUE_IN_MAIN -gt 10 ]; then
        echo -e "${BLUE}  (Showing first 10, $((UNIQUE_IN_MAIN - 10)) more not displayed)${NC}"
    fi
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}             RECOMMENDATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Decision logic
if [ $UNIQUE_IN_DEV -eq 0 ] && [ $UNIQUE_IN_MAIN -eq 0 ]; then
    echo -e "${GREEN}✅ BRANCHES ARE SYNCHRONIZED${NC}"
    echo ""
    echo "Both branches have identical commit history."
    echo "No action needed."
    echo ""
    
elif [ $UNIQUE_IN_DEV -eq 0 ] && [ $UNIQUE_IN_MAIN -gt 0 ]; then
    echo -e "${YELLOW}⚠️  MAIN IS AHEAD OF dev${NC}"
    echo ""
    echo "MAIN has $UNIQUE_IN_MAIN commit(s) that dev doesn't have."
    echo ""
    echo -e "${GREEN}RECOMMENDED ACTION: Fast-forward dev to MAIN${NC}"
    echo ""
    echo "Execute:"
    echo "  git checkout dev"
    echo "  git merge --ff-only MAIN"
    echo "  git push origin dev"
    echo ""
    echo "This will update dev with all of MAIN's latest changes."
    echo ""
    
elif [ $UNIQUE_IN_DEV -gt 0 ] && [ $UNIQUE_IN_MAIN -eq 0 ]; then
    echo -e "${YELLOW}⚠️  dev IS AHEAD OF MAIN${NC}"
    echo ""
    echo "dev has $UNIQUE_IN_DEV commit(s) that MAIN doesn't have."
    echo ""
    echo -e "${GREEN}RECOMMENDED ACTION: Merge dev into MAIN${NC}"
    echo ""
    echo "Execute:"
    echo "  ./scripts/merge-dev-to-main.sh"
    echo ""
    echo "Or manually:"
    echo "  git checkout MAIN"
    echo "  git merge origin/dev -m 'Merge dev into MAIN'"
    echo "  git push origin MAIN"
    echo ""
    
else
    echo -e "${YELLOW}⚠️  BRANCHES HAVE DIVERGED${NC}"
    echo ""
    echo "Both branches have unique commits:"
    echo "  - dev has $UNIQUE_IN_DEV unique commit(s)"
    echo "  - MAIN has $UNIQUE_IN_MAIN unique commit(s)"
    echo ""
    echo -e "${GREEN}RECOMMENDED ACTION: Bi-directional sync${NC}"
    echo ""
    echo "Option A: Merge both ways (preserves all work)"
    echo "  1. git checkout MAIN"
    echo "  2. git merge origin/dev -m 'Merge dev into MAIN'"
    echo "  3. git push origin MAIN"
    echo "  4. git checkout dev"
    echo "  5. git merge MAIN -m 'Sync dev with MAIN'"
    echo "  6. git push origin dev"
    echo ""
    echo "Option B: Use provided script (automated)"
    echo "  ./scripts/merge-dev-to-main.sh"
    echo "  # Then manually sync dev with MAIN"
    echo ""
    echo -e "${BLUE}Note: Manual review of commits recommended before merging.${NC}"
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           DETAILED COMMIT REVIEW${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

if [ $UNIQUE_IN_DEV -gt 0 ]; then
    echo -e "${YELLOW}Commits in dev (detailed):${NC}"
    echo ""
    git log --format="%h | %ai | %an | %s" origin/MAIN..origin/dev 2>/dev/null || git log --format="%h | %ai | %an | %s" MAIN..dev 2>/dev/null
    echo ""
fi

if [ $UNIQUE_IN_MAIN -gt 0 ]; then
    echo -e "${YELLOW}Recent commits in MAIN (last 10):${NC}"
    echo ""
    git log --format="%h | %ai | %an | %s" origin/dev..origin/MAIN 2>/dev/null | head -10 || git log --format="%h | %ai | %an | %s" dev..MAIN 2>/dev/null | head -10
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           DOCUMENTATION REFERENCES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo "For more information, see:"
echo "  - docs/BRANCH_SYNC_RECONCILIATION.md (Decision framework)"
echo "  - docs/MERGE_DEV_TO_MAIN_GUIDE.md (Merge guide)"
echo "  - docs/DEV_TO_MAIN_MERGE_ANALYSIS.md (Detailed analysis)"
echo "  - BRANCH_MERGE_VERIFICATION.md (Official verification)"
echo ""
echo -e "${GREEN}✅ Analysis complete!${NC}"
echo ""
