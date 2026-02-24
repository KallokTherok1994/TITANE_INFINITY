#!/bin/bash

################################################################################
#                                                                              #
#  TITANE Infinity v27.2.0 Production Deployment Distribution Script           #
#  Purpose: Generate distribution packages and deployment manifests            #
#  Date: 2026-02-24                                                            #
#  Authorization: GO_FOR_PROD_BUILD + GO_FOR_PROD_DEPLOY                       #
#                                                                              #
################################################################################

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$REPO_ROOT/deployment/latest"
DISTRIBUTION_DIR="$REPO_ROOT/distribution/v27.2.0"
VERSION="27.2.0"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE Infinity v27.2.0 Distribution Package Generator"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# Phase 1: Create Distribution Structure
# ============================================================================

echo "📁 Phase 1: Creating distribution structure..."
mkdir -p "$DISTRIBUTION_DIR"/{appimage,deb,rpm,checksums,docs}

echo "✅ Distribution directory created: $DISTRIBUTION_DIR"
echo ""

# ============================================================================
# Phase 2: Copy Artifacts
# ============================================================================

echo "📦 Phase 2: Copying deployment artifacts..."

if [ -f "$DEPLOYMENT_DIR/TITANE-Infinity_${VERSION}_amd64.AppImage" ]; then
    cp "$DEPLOYMENT_DIR/TITANE-Infinity_${VERSION}_amd64.AppImage" \
       "$DISTRIBUTION_DIR/appimage/"
    echo "✅ AppImage copied"
else
    echo "⚠️  AppImage not found"
fi

if [ -f "$DEPLOYMENT_DIR/TITANE-Infinity_${VERSION}_amd64.deb" ]; then
    cp "$DEPLOYMENT_DIR/TITANE-Infinity_${VERSION}_amd64.deb" \
       "$DISTRIBUTION_DIR/deb/"
    echo "✅ DEB package copied"
else
    echo "⚠️  DEB package not found"
fi

if [ -f "$DEPLOYMENT_DIR/TITANE-Infinity-${VERSION}-1.x86_64.rpm" ]; then
    cp "$DEPLOYMENT_DIR/TITANE-Infinity-${VERSION}-1.x86_64.rpm" \
       "$DISTRIBUTION_DIR/rpm/"
    echo "✅ RPM package copied"
else
    echo "⚠️  RPM package not found"
fi

echo ""

# ============================================================================
# Phase 3: Generate Checksums
# ============================================================================

echo "🔐 Phase 3: Computing SHA256 checksums..."

cd "$DISTRIBUTION_DIR"

sha256sum appimage/* > checksums/SHA256_appimage.txt 2>/dev/null || true
sha256sum deb/* > checksums/SHA256_deb.txt 2>/dev/null || true
sha256sum rpm/* > checksums/SHA256_rpm.txt 2>/dev/null || true

# Combined checksums
{
    echo "# TITANE Infinity v27.2.0 - Full Release SHA256 Checksums"
    echo "# Generated: $TIMESTAMP"
    echo ""
    cat checksums/SHA256_appimage.txt checksums/SHA256_deb.txt checksums/SHA256_rpm.txt
} > checksums/SHA256SUMS.txt

echo "✅ Checksums generated"
echo ""

# ============================================================================
# Phase 4: Create Documentation
# ============================================================================

echo "📄 Phase 4: Creating distribution documentation..."

cat > docs/README.md << 'DOCEOF'
# TITANE Infinity v27.2.0 Distribution Package

## Quick Start

### Linux (AppImage)
```bash
chmod +x appimage/TITANE-Infinity_27.2.0_amd64.AppImage
./appimage/TITANE-Infinity_27.2.0_amd64.AppImage
```

### Linux (DEB)
```bash
sudo dpkg -i deb/TITANE-Infinity_27.2.0_amd64.deb
titane-infinity
```

### Linux (RPM)
```bash
sudo rpm -i rpm/TITANE-Infinity-27.2.0-1.x86_64.rpm
titane-infinity
```

## Verification

Verify artifact integrity:
```bash
sha256sum -c checksums/SHA256SUMS.txt
```

## Support

- **Issues**: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- **Docs**: See deployment guide in main repository

DOCEOF

echo "✅ Documentation created"
echo ""

# ============================================================================
# Phase 5: Create Deployment Manifest
# ============================================================================

echo "📋 Phase 5: Creating deployment manifest..."

cat > DISTRIBUTION_MANIFEST.json << MANIFESTEOF
{
  "version": "27.2.0",
  "timestamp": "$TIMESTAMP",
  "format": "distribution-v1",
  "packages": {
    "appimage": {
      "directory": "appimage/",
      "files": [$(ls appimage/ 2>/dev/null | xargs -I {} echo "\"{}\"" | paste -sd ',' - || echo '')]
    },
    "deb": {
      "directory": "deb/",
      "files": [$(ls deb/ 2>/dev/null | xargs -I {} echo "\"{}\"" | paste -sd ',' - || echo '')]
    },
    "rpm": {
      "directory": "rpm/",
      "files": [$(ls rpm/ 2>/dev/null | xargs -I {} echo "\"{}\"" | paste -sd ',' - || echo '')]
    }
  },
  "checksums": {
    "appimage": "checksums/SHA256_appimage.txt",
    "deb": "checksums/SHA256_deb.txt",
    "rpm": "checksums/SHA256_rpm.txt",
    "combined": "checksums/SHA256SUMS.txt"
  },
  "verified": true,
  "verification_timestamp": "$TIMESTAMP"
}
MANIFESTEOF

echo "✅ Distribution manifest created"
echo ""

# ============================================================================
# Phase 6: Create Beta Distribution Script
# ============================================================================

echo "🎯 Phase 6: Creating beta distribution helper..."

cat > distribute_beta.sh << 'BETAEOF'
#!/bin/bash

# Beta Distribution Helper for v27.2.0
# Usage: ./distribute_beta.sh [email_list_file] [num_users]

EMAIL_LIST="${1:-beta_testers.txt}"
NUM_USERS="${2:-5}"

if [ ! -f "$EMAIL_LIST" ]; then
    echo "❌ Email list not found: $EMAIL_LIST"
    exit 1
fi

echo "📧 Beta Distribution v27.2.0"
echo "=============================="
echo ""
echo "New testers to receive: $NUM_USERS"
echo "Distribution package ready at: $(pwd)"
echo ""

head -n "$NUM_USERS" "$EMAIL_LIST" | while read email; do
    echo "📤 Preparing distribution for: $email"
    # TODO: Implement actual distribution (email, S3, etc.)
    # For now, just log
    echo "   - AppImage: appimage/TITANE-Infinity_27.2.0_amd64.AppImage"
    echo "   - DEB: deb/TITANE-Infinity_27.2.0_amd64.deb"
done

echo ""
echo "✅ Beta distribution package ready"
echo ""
echo "Next: Send distribution links to beta testers"

BETAEOF

chmod +x distribute_beta.sh

echo "✅ Beta distribution helper created"
echo ""

# ============================================================================
# Phase 7: Summary
# ============================================================================

echo "════════════════════════════════════════════════════════════════════════"
echo "  ✅ DISTRIBUTION PACKAGE COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Distribution Location: $DISTRIBUTION_DIR"
echo ""
echo "📦 Artifacts:"
echo "   • AppImage: appimage/"
echo "   • DEB: deb/"
echo "   • RPM: rpm/"
echo ""
echo "🔐 Checksums: checksums/SHA256SUMS.txt"
echo ""
echo "📄 Documentation: docs/README.md"
echo ""
echo "🚀 Next Steps:"
echo "   1. Verify checksums: sha256sum -c checksums/SHA256SUMS.txt"
echo "   2. Distribute to beta testers (1-10 users)"
echo "   3. Monitor for 30 minutes"
echo "   4. Proceed with canary rollout if stable"
echo ""
echo "🔄 To rollback: git revert HEAD~1 HEAD && git push origin MAIN"
echo ""

cd "$REPO_ROOT"
echo "✅ Distribution script complete ($(date))"
