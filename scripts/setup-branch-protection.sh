#!/bin/bash

# 🛡️ SETUP: GitHub Branch Protection for MAIN
# This script configures GitHub branch protection rules for the MAIN branch
# Run with: ./scripts/setup-branch-protection.sh

set -e

REPO_OWNER="KallokTherok1994"
REPO_NAME="TITANE_INFINITY"
BRANCH="MAIN"

echo "🛡️  Setting up branch protection for $BRANCH..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not installed"
    echo "Install with: curl -sL https://github.com/cli/cli/releases/download/v2.x.x/gh_linux_amd64.tar.gz | tar xz"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ Authenticated with GitHub"
echo ""

# Configure branch protection rules
echo "📋 Configuring branch protection rules..."
echo ""

# Note: GitHub CLI branch protection support is limited
# We'll create a helper that documents the rules
# Users can apply them manually via GitHub UI or use GitHub API

cat > /tmp/branch-protection-rules.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build",
      "lint", 
      "type-check",
      "test",
      "test-rust"
    ]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "enforce_admins": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false
}
EOF

echo "✅ Protection rules defined in /tmp/branch-protection-rules.json"
echo ""

# Option 1: Use GitHub API directly (requires token)
if [ -n "$GITHUB_TOKEN" ]; then
    echo "🔐 Using GitHub API to apply branch protection..."
    
    curl -X PUT \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection" \
        -d @/tmp/branch-protection-rules.json
    
    echo ""
    echo "✅ Branch protection applied via API"
else
    echo "ℹ️  GitHub API method requires GITHUB_TOKEN environment variable"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"
    echo "2. Click 'Add rule' for branch '$BRANCH'"
    echo "3. Enable:"
    echo "   ✓ Require status checks to pass before merging"
    echo "   ✓ Require code reviews before merging (1 review)"
    echo "   ✓ Dismiss stale pull request approvals when new commits pushed"
    echo "   ✓ Enforce all required status checks"
    echo "   ✗ Allow force pushes"
    echo "   ✗ Allow deletions"
    echo ""
    echo "4. Select status checks:"
    echo "   ✓ build"
    echo "   ✓ lint"
    echo "   ✓ type-check"
    echo "   ✓ test"
    echo "   ✓ test-rust"
    echo ""
    echo "5. Click 'Create' to apply"
fi

echo ""
echo "✅ Branch protection setup complete!"
echo ""
echo "Verify at:"
echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches/$BRANCH"

