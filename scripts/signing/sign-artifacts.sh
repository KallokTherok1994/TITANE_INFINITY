#!/usr/bin/env bash
# TITANE∞ — Sign Build Artifacts with GPG
# LOCAL_PROOF: Signs .deb, .AppImage, .msi, .dmg with GPG detached signatures
# Usage: bash scripts/signing/sign-artifacts.sh <artifact_dir> <key_dir>
# Output: *.sig files alongside artifacts + SHA256SUMS.txt + SHA256SUMS.sig

set -euo pipefail

ARTIFACT_DIR="${1:?Usage: sign-artifacts.sh <artifact_dir> <key_dir>}"
KEY_DIR="${2:?Usage: sign-artifacts.sh <artifact_dir> <key_dir>}"

# Check GPG availability
if ! command -v gpg &>/dev/null; then
    echo "STATUS: BLOCKED — gpg not found"
    echo "NEXT_ACTION: apt-get install -y gnupg2"
    exit 1
fi

# Check key exists
if [ ! -f "$KEY_DIR/privkey.asc" ]; then
    echo "STATUS: FAIL — private key not found at $KEY_DIR/privkey.asc"
    echo "NEXT_ACTION: bash scripts/signing/generate-signing-keys.sh $KEY_DIR"
    exit 1
fi

# Import private key
export GNUPGHOME="$KEY_DIR/.gnupg"
if [ ! -d "$GNUPGHOME" ]; then
    mkdir -p "$GNUPGHOME"
    chmod 700 "$GNUPGHOME"
    gpg --batch --import "$KEY_DIR/privkey.asc" 2>/dev/null
fi

# Get signing key ID
KEY_ID=$(gpg --list-keys --with-colons 2>/dev/null | grep '^fpr:' | head -1 | cut -d: -f10)
if [ -z "$KEY_ID" ]; then
    echo "STATUS: FAIL — no signing key found in keyring"
    exit 1
fi

echo "=== TITANE∞ Artifact Signing ==="
echo "Key ID: $KEY_ID"
echo "Artifact dir: $ARTIFACT_DIR"
echo ""

# Find and sign all artifacts
SIGNED_COUNT=0
FAILED_COUNT=0

for artifact in "$ARTIFACT_DIR"/*.deb "$ARTIFACT_DIR"/*.AppImage "$ARTIFACT_DIR"/*.msi "$ARTIFACT_DIR"/*.dmg "$ARTIFACT_DIR"/*.rpm; do
    [ -f "$artifact" ] || continue

    echo "Signing: $(basename "$artifact")..."

    if gpg --batch --yes --detach-sign --armor \
        --local-user "$KEY_ID" \
        --output "${artifact}.sig" \
        "$artifact" 2>/dev/null; then
        echo "  ✅ ${artifact}.sig"
        SIGNED_COUNT=$((SIGNED_COUNT + 1))
    else
        echo "  ❌ Failed to sign $(basename "$artifact")"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# Generate SHA256SUMS.txt
echo ""
echo "Generating SHA256SUMS.txt..."
cd "$ARTIFACT_DIR"
if command -v sha256sum &>/dev/null; then
    sha256sum *.deb 2>/dev/null >> SHA256SUMS.txt || true
    sha256sum *.AppImage 2>/dev/null >> SHA256SUMS.txt || true
    sha256sum *.msi 2>/dev/null >> SHA256SUMS.txt || true
    sha256sum *.dmg 2>/dev/null >> SHA256SUMS.txt || true
    sha256sum *.rpm 2>/dev/null >> SHA256SUMS.txt || true
elif command -v shasum &>/dev/null; then
    shasum -a 256 *.deb 2>/dev/null >> SHA256SUMS.txt || true
    shasum -a 256 *.AppImage 2>/dev/null >> SHA256SUMS.txt || true
    shasum -a 256 *.msi 2>/dev/null >> SHA256SUMS.txt || true
    shasum -a 256 *.dmg 2>/dev/null >> SHA256SUMS.txt || true
    shasum -a 256 *.rpm 2>/dev/null >> SHA256SUMS.txt || true
else
    echo "⚠️ No sha256sum/shasum found, skipping checksum generation"
fi

# Remove empty lines from SHA256SUMS.txt
if [ -f SHA256SUMS.txt ]; then
    sed -i '/^$/d' SHA256SUMS.txt 2>/dev/null || true
fi

# Sign SHA256SUMS.txt
if [ -f SHA256SUMS.txt ]; then
    echo "Signing SHA256SUMS.txt..."
    if gpg --batch --yes --detach-sign --armor \
        --local-user "$KEY_ID" \
        --output SHA256SUMS.sig \
        SHA256SUMS.txt 2>/dev/null; then
        echo "  ✅ SHA256SUMS.sig"
        SIGNED_COUNT=$((SIGNED_COUNT + 1))
    fi
    echo ""
    echo "=== SHA256 Checksums ==="
    cat SHA256SUMS.txt
fi

echo ""
echo "=== SIGNING COMPLETE ==="
echo "STATUS: PASS"
echo "Signed: $SIGNED_COUNT artifacts"
echo "Failed: $FAILED_COUNT artifacts"
echo ""
echo "Verification: bash scripts/signing/verify-signatures.sh $ARTIFACT_DIR $KEY_DIR/pubkey.asc"