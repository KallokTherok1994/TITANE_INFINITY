#!/bin/bash
# TITANE∞ — Create new feature branch
# Usage: ./new-feature.sh <feature-name>

set -e

if [ -z "$1" ]; then
    echo "❌ ERROR: Feature name required"
    echo ""
    echo "Usage: ./new-feature.sh <feature-name>"
    echo ""
    echo "Examples:"
    echo "  ./new-feature.sh visual-engine-v21"
    echo "  ./new-feature.sh chat-improvements"
    echo "  ./new-feature.sh memory-optimization"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"
BASE_BRANCH="dev"
CURRENT_BRANCH=$(git branch --show-current)

echo "🌿 TITANE∞ — Creating new feature branch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Feature: $FEATURE_NAME"
echo "Branch: $BRANCH_NAME"
echo "Base: $BASE_BRANCH"
echo ""

# Check if we're on dev or feature branch
if [[ $CURRENT_BRANCH != "dev" && $CURRENT_BRANCH != feature/* ]]; then
    echo "⚠️  WARNING: You are on '$CURRENT_BRANCH'"
    echo "Features should be created from 'dev' branch"
    echo ""
    read -p "❓ Switch to 'dev' first? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BASE_BRANCH
        echo "✅ Switched to '$BASE_BRANCH'"
    else
        echo "❌ Aborted"
        exit 1
    fi
fi

# Check if feature branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "⚠️  Branch '$BRANCH_NAME' already exists"
    read -p "❓ Switch to existing branch? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BRANCH_NAME
        echo "✅ Switched to existing '$BRANCH_NAME'"
    else
        echo "❌ Aborted"
        exit 1
    fi
else
    # Create new feature branch
    git checkout -b $BRANCH_NAME
    echo "✅ Created and switched to '$BRANCH_NAME'"
fi

echo ""
echo "🎯 FEATURE BRANCH READY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Branch: $(git branch --show-current)"
echo ""
echo "✅ You can now:"
echo "   • Develop your feature"
echo "   • Make commits"
echo "   • Test changes in Titan-Dev"
echo ""
echo "💡 When ready:"
echo "   1. git add -A && git commit -m 'feat: your message'"
echo "   2. ./switch-dev.sh"
echo "   3. git merge $BRANCH_NAME"
echo "   4. Test in dev environment"
echo "   5. Use ./merge-dev-to-stable.sh (when validated)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
