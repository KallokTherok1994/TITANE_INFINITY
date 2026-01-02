#!/usr/bin/env bash
# 🔀 TITANE_INFINITY - Branch Consolidation Script v26.2.2
# 
# This script automates the branch merge strategy defined in:
# docs/BRANCH_CONSOLIDATION_REPORT_v26.2.2.md
#
# Usage:
#   ./scripts/merge-all-branches.sh [--phase PHASE_NUMBER] [--dry-run] [--help]
#
# Options:
#   --phase PHASE_NUMBER  Execute only a specific phase (1, 2, or 3)
#   --dry-run            Show what would be done without executing
#   --help               Show this help message
#
# Phases:
#   Phase 1: Fast-forward dev and stable-runtime branches
#   Phase 2: Integrate feature branches (deployment, audit)
#   Phase 3: Archive completed branches

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="MAIN"
DEV_BRANCH="dev"
STABLE_BRANCH="stable-runtime"
DRY_RUN=false
PHASE=""

# Helper functions
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --phase)
            PHASE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            head -n 20 "$0" | tail -n +2 | sed 's/^# //'
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Verify we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository"
    exit 1
fi

# Verify MAIN branch exists
if ! git rev-parse --verify "$MAIN_BRANCH" > /dev/null 2>&1; then
    error "MAIN branch '$MAIN_BRANCH' not found"
    exit 1
fi

info "Starting TITANE_INFINITY Branch Consolidation v26.2.2"
echo ""

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
info "Current branch: $CURRENT_BRANCH"

# Phase 1: Fast-forward dev and stable-runtime
phase_1() {
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "PHASE 1: Fast-forward lagging branches"
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Update dev branch
    if git rev-parse --verify "$DEV_BRANCH" > /dev/null 2>&1; then
        info "Updating $DEV_BRANCH branch..."
        
        if [[ "$DRY_RUN" == "true" ]]; then
            warning "[DRY RUN] Would execute:"
            echo "  git checkout $DEV_BRANCH"
            echo "  git merge --ff-only $MAIN_BRANCH"
            echo "  git push origin $DEV_BRANCH"
        else
            git checkout "$DEV_BRANCH"
            if git merge --ff-only "$MAIN_BRANCH"; then
                success "$DEV_BRANCH fast-forwarded to $MAIN_BRANCH"
                git push origin "$DEV_BRANCH"
                success "$DEV_BRANCH pushed to remote"
            else
                warning "$DEV_BRANCH cannot be fast-forwarded (may have diverged)"
                warning "Manual merge may be required"
            fi
        fi
    else
        warning "$DEV_BRANCH branch not found locally"
        info "Fetching from remote..."
        if [[ "$DRY_RUN" == "false" ]]; then
            if git fetch origin "$DEV_BRANCH"; then
                git checkout -b "$DEV_BRANCH" "origin/$DEV_BRANCH" || warning "Could not create local $DEV_BRANCH"
            else
                warning "Could not fetch $DEV_BRANCH"
            fi
        fi
    fi
    
    echo ""
    
    # Update stable-runtime branch
    if git rev-parse --verify "$STABLE_BRANCH" > /dev/null 2>&1; then
        info "Updating $STABLE_BRANCH branch..."
        
        if [[ "$DRY_RUN" == "true" ]]; then
            warning "[DRY RUN] Would execute:"
            echo "  git checkout $STABLE_BRANCH"
            echo "  git merge --ff-only $MAIN_BRANCH"
            echo "  git push origin $STABLE_BRANCH"
        else
            git checkout "$STABLE_BRANCH"
            if git merge --ff-only "$MAIN_BRANCH"; then
                success "$STABLE_BRANCH fast-forwarded to $MAIN_BRANCH"
                git push origin "$STABLE_BRANCH"
                success "$STABLE_BRANCH pushed to remote"
            else
                warning "$STABLE_BRANCH cannot be fast-forwarded (may have diverged)"
                warning "Manual merge may be required"
            fi
        fi
    else
        warning "$STABLE_BRANCH branch not found locally"
        info "Fetching from remote..."
        if [[ "$DRY_RUN" == "false" ]]; then
            if git fetch origin "$STABLE_BRANCH"; then
                git checkout -b "$STABLE_BRANCH" "origin/$STABLE_BRANCH" || warning "Could not create local $STABLE_BRANCH"
            else
                warning "Could not fetch $STABLE_BRANCH"
            fi
        fi
    fi
    
    echo ""
    success "Phase 1 complete"
}

# Phase 2: Integrate feature branches
phase_2() {
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "PHASE 2: Feature branch integration"
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    warning "Phase 2 requires manual review and testing"
    info "Feature branches to review:"
    echo "  - copilot/audit-deployment-parameters (deployment docs)"
    echo "  - copilot/audit-appimage-deployment (code quality)"
    echo "  - copilot/analyse-audit-workflows (analysis insights)"
    echo ""
    
    info "Recommended approach:"
    echo "  1. Review each branch individually"
    echo "  2. Cherry-pick valuable changes"
    echo "  3. Run full test suite after each integration"
    echo "  4. Validate before pushing"
    echo ""
    
    if [[ "$DRY_RUN" == "false" ]]; then
        warning "Phase 2 not automated - manual execution required"
        info "See docs/BRANCH_CONSOLIDATION_REPORT_v26.2.2.md for details"
    fi
    
    success "Phase 2 guidance provided"
}

# Phase 3: Archive completed branches
phase_3() {
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "PHASE 3: Archive completed branches"
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    warning "Branch archiving should only be done after confirming merges"
    info "Branches to potentially archive:"
    echo "  - copilot/analyze-singularity-files (already merged in PR #24)"
    echo "  - copilot/analyse-audit-workflows (after review)"
    echo "  - Other branches after successful integration"
    echo ""
    
    if [[ "$DRY_RUN" == "true" ]]; then
        warning "[DRY RUN] Would archive branches:"
        echo "  git branch -d copilot/analyze-singularity-files"
        echo "  git push origin --delete copilot/analyze-singularity-files"
    else
        warning "Phase 3 not automated - manual cleanup recommended"
        info "Only delete branches after confirming their content is merged"
    fi
    
    success "Phase 3 guidance provided"
}

# Return to original branch
cleanup() {
    if [[ "$CURRENT_BRANCH" != "$(git branch --show-current)" ]]; then
        info "Returning to original branch: $CURRENT_BRANCH"
        git checkout "$CURRENT_BRANCH" || warning "Could not return to $CURRENT_BRANCH"
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Execute requested phase(s)
if [[ -n "$PHASE" ]]; then
    case $PHASE in
        1)
            phase_1
            ;;
        2)
            phase_2
            ;;
        3)
            phase_3
            ;;
        *)
            error "Invalid phase: $PHASE (must be 1, 2, or 3)"
            exit 1
            ;;
    esac
else
    # Execute all phases
    phase_1
    echo ""
    phase_2
    echo ""
    phase_3
fi

echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Branch consolidation process complete!"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    info "This was a dry run. No changes were made."
    info "Run without --dry-run to execute the operations."
else
    info "Review the changes and run tests before finalizing."
fi

exit 0
