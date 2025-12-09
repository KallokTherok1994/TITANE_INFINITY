#!/bin/bash
# TITANE∞ — Switch to STABLE RUNTIME branch
# Usage: ./switch-stable.sh

set -e

BRANCH_STABLE="stable-runtime"
CURRENT_BRANCH=$(git branch --show-current)

echo "🔵 TITANE∞ — Switching to STABLE RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current branch: $CURRENT_BRANCH"
echo "Target branch: $BRANCH_STABLE"
echo ""

# Check if branch exists
if ! git show-ref --verify --quiet refs/heads/$BRANCH_STABLE; then
    echo "⚠️  Branch '$BRANCH_STABLE' does not exist yet."
    echo "Creating '$BRANCH_STABLE' from current state..."
    git checkout -b $BRANCH_STABLE
    echo "✅ Branch '$BRANCH_STABLE' created successfully"
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
            STASH_MSG="Auto-stash before switching to $BRANCH_STABLE ($(date '+%Y-%m-%d %H:%M:%S'))"
            git stash push -m "$STASH_MSG"
            echo "📦 Changes stashed: $STASH_MSG"
        fi
    fi
    
    # Switch to stable-runtime
    git checkout $BRANCH_STABLE
    echo "✅ Switched to '$BRANCH_STABLE'"
fi

echo ""
echo "🎯 YOU ARE NOW ON: STABLE RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  RULES:"
echo "   • DO NOT develop on this branch"
echo "   • This branch is for STABLE USER RUNTIME only"
echo "   • Only merge validated changes from 'dev'"
echo "   • Use './switch-dev.sh' to develop"
echo ""
echo "Current branch: $(git branch --show-current)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
