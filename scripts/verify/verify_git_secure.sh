#!/usr/bin/env bash
# TITANE∞ v14 — Git Security Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — GIT SECURITY VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "❌ Not a git repository"
    exit 1
fi

echo "✅ Git repository detected"

# Check .gitignore exists
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore present"

    # Check for essential entries
    REQUIRED_IGNORES=("node_modules" "target" "dist" ".env")

    for entry in "${REQUIRED_IGNORES[@]}"; do
        if grep -q "^$entry" .gitignore; then
            echo "  ✅ $entry ignored"
        else
            echo "  ⚠️  $entry not in .gitignore"
        fi
    done
else
    echo "❌ .gitignore missing"
    ((ERRORS++))
fi

# Check for sensitive files in git
echo "→ Checking for sensitive files..."

SENSITIVE_FILES=$(git ls-files | grep -E "\.(env|key|pem|crt|p12)$" || true)

if [ -n "$SENSITIVE_FILES" ]; then
    echo "❌ Sensitive files detected in git:"
    echo "$SENSITIVE_FILES"
    ((ERRORS++))
else
    echo "✅ No sensitive files in git"
fi

# Check git remote configuration
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$REMOTE_URL" ]; then
    echo "✅ Remote origin configured: $REMOTE_URL"

    # Check if using SSH
    if [[ "$REMOTE_URL" == git@* ]]; then
        echo "  ✅ Using SSH authentication"
    elif [[ "$REMOTE_URL" == https://* ]]; then
        echo "  ⚠️  Using HTTPS (consider SSH for better security)"
    fi
else
    echo "⚠️  No remote origin configured"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    CHANGED_FILES=$(git diff --name-only | wc -l)
    echo "⚠️  $CHANGED_FILES uncommitted change(s) detected"
else
    echo "✅ Working tree clean"
fi

# Check branch
CURRENT_BRANCH=$(git branch --show-current)
echo "✅ Current branch: $CURRENT_BRANCH"

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ GIT SECURITY: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ GIT SECURITY: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
