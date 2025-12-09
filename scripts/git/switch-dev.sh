#!/bin/bash
# TITANE∞ — Switch to DEV branch
# Usage: ./switch-dev.sh

set -e

BRANCH_DEV="dev"
CURRENT_BRANCH=$(git branch --show-current)

echo "🟢 TITANE∞ — Switching to DEV RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current branch: $CURRENT_BRANCH"
echo "Target branch: $BRANCH_DEV"
echo ""

# Check if branch exists
if ! git show-ref --verify --quiet refs/heads/$BRANCH_DEV; then
    echo "⚠️  Branch '$BRANCH_DEV' does not exist yet."
    echo "Creating '$BRANCH_DEV' from current state..."
    git checkout -b $BRANCH_DEV
    echo "✅ Branch '$BRANCH_DEV' created successfully"
else
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo "⚠️  WARNING: You have uncommitted changes!"
        echo ""
        git status --short
        echo ""
        read -p "❓ Stash changes before switching? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            STASH_MSG="Auto-stash before switching to $BRANCH_DEV ($(date '+%Y-%m-%d %H:%M:%S'))"
            git stash push -m "$STASH_MSG"
            echo "📦 Changes stashed: $STASH_MSG"
        fi
    fi
    
    # Switch to dev
    git checkout $BRANCH_DEV
    echo "✅ Switched to '$BRANCH_DEV'"
fi

echo ""
echo "🎯 YOU ARE NOW ON: DEV RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SAFE TO:"
echo "   • Develop new features"
echo "   • Refactor code"
echo "   • Test experimental changes"
echo "   • Use Claude Code / Copilot freely"
echo "   • Break things (isolated environment)"
echo ""
echo "💡 TIP: Use './new-feature.sh <name>' to create feature branches"
echo ""
echo "Current branch: $(git branch --show-current)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
