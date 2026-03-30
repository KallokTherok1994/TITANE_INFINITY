#!/usr/bin/env bash
# TITANE∞ — Verify GPG Signatures on Build Artifacts
# LOCAL_PROOF: Verifies all .sig files against public key
# Usage: bash scripts/signing/verify-signatures.sh <artifact_dir> <pubkey_path>
# Output: Verification results for each signature

set -euo pipefail

ARTIFACT_DIR="${1:?Usage: verify-signatures.sh <artifact_dir> <pubkey_path>}"
PUBKEY_PATH="${2:?Usage: verify-signatures.sh <artifact_dir> <pubkey_path>}"

# Check GPG availability
if ! command -v gpg &>/dev/null; then
    echo "STATUS: BLOCKED — gpg not found"
    echo "NEXT_ACTION: apt-get install -y gnupg2"
    exit 1
fi

# Check pubkey exists
if [ ! -f "$PUBKEY_PATH" ]; then
    echo "STATUS: FAIL — public key not found at $PUBKEY_PATH"
    echo "NEXT_ACTION: bash scripts/signing/generate-signing-keys.sh"
    exit 1
fi

# Import public key into temporary keyring
TEMP_GNUPGHOME=$(mktemp -d)
trap "rm -rf '$TEMP_GNUPGHOME'" EXIT
export GNUPGHOME="$TEMP_GNUPGHOME"
chmod 700 "$GNUPGHOME"

gpg --batch --import "$PUBKEY_PATH" 2>/dev/null

echo "=== TITANE∞ Signature Verification ==="
echo "Public key: $PUBKEY_PATH"
echo "Artifact dir: $ARTIFACT_DIR"
echo ""

# Get expected key fingerprint
EXPECTED_FPR=$(gpg --list-keys --with-colons 2>/dev/null | grep '^fpr:' | head -1 | cut -d: -f10)
echo "Expected fingerprint: $EXPECTED_FPR"
echo ""

VERIFIED=0
FAILED=0
SKIPPED=0

# Verify each .sig file
for sigfile in "$ARTIFACT_DIR"/*.sig; do
    [ -f "$sigfile" ] || continue

    # Derive artifact path (remove .sig suffix)
    artifact="${sigfile%.sig}"

    if [ ! -f "$artifact" ]; then
        echo "⚠️ SKIP: $(basename "$sigfile") — artifact not found: $(basename "$artifact")"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo -n "Verifying: $(basename "$artifact")... "

    if gpg --batch --verify "$sigfile" "$artifact" 2>/dev/null; then
        echo "✅ VALID"
        VERIFIED=$((VERIFIED + 1))
    else
        echo "❌ INVALID"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=== VERIFICATION RESULTS ==="
echo "Verified: $VERIFIED"
echo "Failed: $FAILED"
echo "Skipped: $SKIPPED"

# Classify result
if [ "$FAILED" -gt 0 ]; then
    echo ""
    echo "STATUS: FAIL"
    echo "NEXT_ACTION: Re-sign artifacts with correct key"
    exit 1
elif [ "$VERIFIED" -eq 0 ] && [ "$SKIPPED" -eq 0 ]; then
    echo ""
    echo "STATUS: BLOCKED"
    echo "NEXT_ACTION: No .sig files found — run sign-artifacts.sh first"
    exit 1
else
    echo ""
    echo "STATUS: PASS"
    exit 0
fi