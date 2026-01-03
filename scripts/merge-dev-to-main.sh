#!/bin/bash
#
# Script: merge-dev-to-main.sh
# Purpose: Merge dev branch changes into MAIN branch
# Author: TITANE_INFINITY Team
# Date: 2026-01-01
#
# This script performs a safe merge of dev branch into MAIN branch,
# including pre-merge validation and post-merge verification.
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEV_BRANCH="dev"
MAIN_BRANCH="MAIN"
MERGE_MESSAGE="Merge dev branch into MAIN

This merge synchronizes changes from the dev branch into MAIN.
For details on what was merged, see:
- git log $MAIN_BRANCH..$DEV_BRANCH (commits from dev)
- docs/DEV_TO_MAIN_MERGE_ANALYSIS.md (detailed analysis)"

# Helper functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Confirm we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository root. Please cd to the repository root."
    exit 1
fi

print_header "Dev → MAIN Merge Script"

# Step 1: Check working directory is clean
print_info "Step 1: Checking working directory status..."
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash changes first."
    git status --short
    exit 1
fi
print_success "Working directory is clean"

# Step 2: Fetch latest changes
print_info "Step 2: Fetching latest changes from remote..."
if ! git fetch origin; then
    print_error "Failed to fetch from remote. Check your network connection and authentication."
    exit 1
fi
print_success "Fetched latest changes"

# Step 3: Checkout MAIN branch
print_info "Step 3: Checking out $MAIN_BRANCH branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    if ! git checkout "$MAIN_BRANCH"; then
        print_error "Failed to checkout $MAIN_BRANCH branch"
        exit 1
    fi
    print_success "Checked out $MAIN_BRANCH branch"
else
    print_success "Already on $MAIN_BRANCH branch"
fi

# Step 4: Pull latest MAIN
print_info "Step 4: Pulling latest $MAIN_BRANCH changes..."
if ! git pull origin "$MAIN_BRANCH"; then
    print_error "Failed to pull $MAIN_BRANCH. Resolve any conflicts manually."
    exit 1
fi
print_success "Updated $MAIN_BRANCH to latest"

# Step 5: Show what will be merged
print_info "Step 5: Analyzing commits to be merged..."
echo ""
echo "Commits in $DEV_BRANCH not in $MAIN_BRANCH:"
git log --oneline "$MAIN_BRANCH..origin/$DEV_BRANCH" || print_warning "Could not determine commit difference"
echo ""

# Step 6: Ask for confirmation
read -p "$(echo -e ${YELLOW}Continue with merge? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Merge cancelled by user"
    exit 0
fi

# Step 7: Perform the merge
print_info "Step 7: Merging $DEV_BRANCH into $MAIN_BRANCH..."
if git merge "origin/$DEV_BRANCH" -m "$MERGE_MESSAGE"; then
    print_success "Merge completed successfully"
else
    print_error "Merge failed with conflicts. Please resolve conflicts manually:"
    echo ""
    echo "1. Check conflicted files:"
    echo "   git status"
    echo ""
    echo "2. Resolve conflicts in each file"
    echo ""
    echo "3. Mark as resolved:"
    echo "   git add <file>"
    echo ""
    echo "4. Complete the merge:"
    echo "   git commit"
    echo ""
    echo "5. Continue this script by running:"
    echo "   git push origin $MAIN_BRANCH"
    exit 1
fi

# Step 8: Run tests (if available)
print_info "Step 8: Running validation tests..."
if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        print_info "Running npm tests..."
        if pnpm test; then
            print_success "All tests passed"
        else
            print_warning "Some tests failed. Review before pushing."
            read -p "$(echo -e ${YELLOW}Continue anyway? [y/N]: ${NC})" -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_warning "Merge completed but not pushed. Review test failures."
                print_info "To push manually: git push origin $MAIN_BRANCH"
                exit 0
            fi
        fi
    else
        print_warning "npm not found, skipping tests"
    fi
else
    print_warning "package.json not found, skipping tests"
fi

# Step 9: Push to remote
print_info "Step 9: Pushing merged $MAIN_BRANCH to remote..."
if git push origin "$MAIN_BRANCH"; then
    print_success "Successfully pushed to remote"
else
    print_error "Failed to push. You may need to pull and resolve conflicts, or check permissions."
    exit 1
fi

# Step 10: Summary
print_header "Merge Complete! 🎉"
echo ""
print_success "dev branch has been successfully merged into $MAIN_BRANCH"
print_info "Merge commit: $(git rev-parse HEAD)"
print_info "Branch status: $(git log --oneline -1)"
echo ""
print_info "Next steps:"
echo "  1. Verify the merge on GitHub"
echo "  2. Consider updating dev branch with MAIN's changes:"
echo "     git checkout $DEV_BRANCH"
echo "     git merge $MAIN_BRANCH"
echo "     git push origin $DEV_BRANCH"
echo ""
print_success "All done!"
