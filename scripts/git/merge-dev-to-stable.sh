#!/bin/bash
# TITANE∞ — Merge DEV to STABLE (production deployment)
# Usage: ./merge-dev-to-stable.sh

set -e

BRANCH_DEV="dev"
BRANCH_STABLE="stable-runtime"
CURRENT_BRANCH=$(git branch --show-current)

echo "🔄 TITANE∞ — Merge DEV → STABLE RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This will merge validated changes from DEV to STABLE"
echo ""
echo "⚠️  WARNING: This affects the USER RUNTIME"
echo "Only proceed if DEV is fully tested and validated"
echo ""

# Check if we're on dev branch
if [[ $CURRENT_BRANCH != $BRANCH_DEV ]]; then
    echo "❌ ERROR: You must be on '$BRANCH_DEV' branch"
    echo "Current branch: $CURRENT_BRANCH"
    echo ""
    echo "Run: ./switch-dev.sh"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "❌ ERROR: Uncommitted changes detected"
    echo ""
    git status --short
    echo ""
    echo "Commit or stash changes before merging"
    exit 1
fi

# Confirm merge
echo "📋 MERGE PREVIEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "From: $BRANCH_DEV"
echo "To: $BRANCH_STABLE"
echo ""
git log --oneline $BRANCH_STABLE..$BRANCH_DEV --max-count=10
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "❓ Proceed with merge? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Merge aborted"
    exit 1
fi

# Switch to stable
echo ""
echo "🔵 Switching to $BRANCH_STABLE..."
git checkout $BRANCH_STABLE

# Merge dev into stable
echo "🔄 Merging $BRANCH_DEV into $BRANCH_STABLE..."
if git merge $BRANCH_DEV --no-ff -m "🚀 Deploy: Merge dev to stable-runtime ($(date '+%Y-%m-%d %H:%M:%S'))"; then
    echo "✅ Merge successful"
else
    echo "❌ Merge conflicts detected"
    echo ""
    echo "Resolve conflicts and then:"
    echo "  git add -A"
    echo "  git commit"
    exit 1
fi

echo ""
echo "🎉 MERGE COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Branch: $(git branch --show-current)"
echo ""
echo "🔧 NEXT STEPS:"
echo "   1. Build new STABLE runtime:"
echo "      cd runtime/stable && pnpm run build:stable"
echo ""
echo "   2. Test STABLE runtime:"
echo "      ./titan-stable.AppImage"
echo ""
echo "   3. If issues found:"
echo "      git revert HEAD (undo merge)"
echo "      ./switch-dev.sh (back to dev)"
echo ""
echo "   4. Switch back to dev:"
echo "      ./switch-dev.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
