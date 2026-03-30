#!/usr/bin/env bash
# TITANE∞ — Generate GPG Signing Keypair
# LOCAL_PROOF: Creates ephemeral GPG keypair for artifact signing
# Usage: bash scripts/signing/generate-signing-keys.sh [output_dir]
# Output: pubkey.asc, privkey.asc, fingerprint.txt

set -euo pipefail

OUTPUT_DIR="${1:-scripts/signing/keys}"
KEY_NAME="TITANE-SIGNING-$(date +%Y%m%d-%H%M%S)"
KEY_EMAIL="signing@titane-infinity.local"
KEY_COMMENT="TITANE∞ Local Signing Key (ephemeral)"

mkdir -p "$OUTPUT_DIR"

# Check GPG availability
if ! command -v gpg &>/dev/null; then
    echo "STATUS: BLOCKED — gpg not found"
    echo "NEXT_ACTION: apt-get install -y gnupg2"
    exit 1
fi

echo "=== GPG Signing Key Generation ==="
echo "Key Name: $KEY_NAME"
echo "Email: $KEY_EMAIL"
echo "Output: $OUTPUT_DIR/"
echo ""

# Generate GPG keypair (non-interactive via batch)
echo "Generating GPG keypair (RSA 4096, no passphrase for local proof)..."

cat > /tmp/gpg-batch-"$KEY_NAME".txt <<EOF
%echo Generating TITANE∞ signing key
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: $KEY_NAME
Name-Comment: $KEY_COMMENT
Name-Email: $KEY_EMAIL
Expire-Date: 0
%no-protection
%commit
%echo Done
EOF

export GNUPGHOME="$OUTPUT_DIR/.gnupg"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"

if gpg --batch --gen-key /tmp/gpg-batch-"$KEY_NAME".txt 2>&1; then
    echo "✅ Keypair generated successfully"
else
    echo "STATUS: FAIL — key generation failed"
    rm -f /tmp/gpg-batch-"$KEY_NAME".txt
    exit 1
fi

# Export public key
gpg --armor --export "$KEY_EMAIL" > "$OUTPUT_DIR/pubkey.asc"
echo "✅ Public key exported: $OUTPUT_DIR/pubkey.asc"

# Export private key (for local proof only — never commit!)
gpg --armor --export-secret-keys "$KEY_EMAIL" > "$OUTPUT_DIR/privkey.asc"
chmod 600 "$OUTPUT_DIR/privkey.asc"
echo "✅ Private key exported: $OUTPUT_DIR/privkey.asc"

# Extract fingerprint
FINGERPRINT=$(gpg --list-keys --with-colons "$KEY_EMAIL" | grep '^fpr:' | head -1 | cut -d: -f10)
echo "$FINGERPRINT" > "$OUTPUT_DIR/fingerprint.txt"
echo "✅ Fingerprint: $FINGERPRINT"

# Cleanup
rm -f /tmp/gpg-batch-"$KEY_NAME".txt

echo ""
echo "=== SIGNING KEYS GENERATED ==="
echo "STATUS: PASS"
echo "Fingerprint: $FINGERPRINT"
echo "Public key: $OUTPUT_DIR/pubkey.asc"
echo "Private key: $OUTPUT_DIR/privkey.asc (NEVER commit this)"
echo ""
echo "To import public key for verification:"
echo "  gpg --import $OUTPUT_DIR/pubkey.asc"