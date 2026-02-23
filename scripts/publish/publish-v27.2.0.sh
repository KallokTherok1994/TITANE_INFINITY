#!/bin/bash
# Publish v27.2.0 production artifacts to deployment/latest/
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PUBLISH v27.2.0 ARTIFACTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

VERSION="27.2.0"
TAG="02bce9c7ccd18247c1b8a5699d89b672ef6b7a7e"
DEPLOY_DIR="deployment/latest"
BUNDLE_DIR="target/release/bundle"

# Check artifacts exist
echo "1. Checking build artifacts..."
if [ ! -f "$BUNDLE_DIR/appimage"/*.AppImage ]; then
  echo "❌ ERROR: AppImage not found"
  exit 1
fi

if [ ! -f "$BUNDLE_DIR/deb"/*.deb ]; then
  echo "❌ ERROR: DEB package not found"
  exit 1
fi

echo "✅ Artifacts found:"
ls -lh "$BUNDLE_DIR/appimage"/*.AppImage
ls -lh "$BUNDLE_DIR/deb"/*.deb
echo ""

# Compute SHA256 checksums
echo "2. Computing SHA256 checksums..."
mkdir -p "$DEPLOY_DIR"
cd "$BUNDLE_DIR"
sha256sum appimage/*.AppImage deb/*.deb | sort > "../../$DEPLOY_DIR/SHA256SUMS_v${VERSION}.txt"
cd ../../../
echo "✅ Checksums generated: $DEPLOY_DIR/SHA256SUMS_v${VERSION}.txt"
cat "$DEPLOY_DIR/SHA256SUMS_v${VERSION}.txt"
echo ""

# Compute sizes
echo "3. Computing artifact sizes..."
cat > "$DEPLOY_DIR/SIZES_v${VERSION}.txt" << EOF
# v${VERSION} Artifact Sizes
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

EOF

for file in "$BUNDLE_DIR/appimage"/*.AppImage "$BUNDLE_DIR/deb"/*.deb; do
  FILENAME=$(basename "$file")
  SIZE_BYTES=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  SIZE_HUMAN=$(du -h "$file" | cut -f1)
  echo "$FILENAME: $SIZE_BYTES bytes ($SIZE_HUMAN)" | tee -a "$DEPLOY_DIR/SIZES_v${VERSION}.txt"
done
echo ""

# Copy artifacts
echo "4. Copying artifacts to deployment/latest/..."
cp -v "$BUNDLE_DIR/appimage"/*.AppImage "$DEPLOY_DIR/"
cp -v "$BUNDLE_DIR/deb"/*.deb "$DEPLOY_DIR/"
echo "✅ Artifacts copied"
echo ""

# Create MANIFEST
echo "5. Creating MANIFEST_v${VERSION}.json..."
cat > "$DEPLOY_DIR/MANIFEST_v${VERSION}.json" << EOFMANIFEST
{
  "version": "${VERSION}",
  "tag": "${TAG}",
  "date": "$(date -u +%Y-%m-%d)",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "scope": "typescript-strict",
  "risk": "minimal",
  "description": "TypeScript Strict Mode (0 errors) - Type Safety Improved",
  "changes": {
    "code": "1 file (backend-v17.2.commands.ts, type-only)",
    "impact": "zero runtime changes",
    "ring": "Ring 3 (Services)"
  },
  "artifacts": [
    "AppImage",
    "DEB"
  ],
  "checksums": "SHA256SUMS_v${VERSION}.txt",
  "sizes": "SIZES_v${VERSION}.txt",
  "verified": true,
  "deployment_ready": true
}
EOFMANIFEST

echo "✅ MANIFEST created"
cat "$DEPLOY_DIR/MANIFEST_v${VERSION}.json"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PUBLISH COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Published artifacts in $DEPLOY_DIR/:"
ls -lh "$DEPLOY_DIR/" | grep -E "v${VERSION}|AppImage|\.deb"
echo ""
echo "Next steps:"
echo "  1. git add $DEPLOY_DIR/"
echo "  2. git commit -m 'release(v${VERSION}): publish production artifacts'"
echo "  3. git push origin MAIN"
echo ""
