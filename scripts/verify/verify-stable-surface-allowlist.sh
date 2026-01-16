#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

CONFIG="runtime/stable/tauri.stable.conf.json"
CONTRACT="docs/contracts/tauri-stable-allowlist.json"

if [ ! -f "$CONFIG" ]; then
  echo "ERROR: missing stable config: $CONFIG" >&2
  exit 2
fi

if [ ! -f "$CONTRACT" ]; then
  echo "ERROR: missing stable allowlist contract: $CONTRACT" >&2
  echo "Hint: regenerate it with:" >&2
  echo "  jq -r '.app.security.capabilities[].allow[]? | .command? // empty' $CONFIG | sed '/^$/d' | sort -u | jq -R -s 'split(\"\\n\")[:-1]' > $CONTRACT" >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required for this verification." >&2
  exit 2
fi

TMP_DIR=$(mktemp -d)
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

CONFIG_LIST="$TMP_DIR/config.txt"
CONTRACT_LIST="$TMP_DIR/contract.txt"

# Extract stable allowlist commands
jq -r '.app.security.capabilities[].allow[]? | .command? // empty' "$CONFIG" \
  | sed '/^$/d' \
  | sort -u > "$CONFIG_LIST"

# Extract contract commands
jq -r '.[]' "$CONTRACT" \
  | sed '/^$/d' \
  | sort -u > "$CONTRACT_LIST"

# Compare sets
EXTRA_IN_CONFIG="$TMP_DIR/extra_in_config.txt"
MISSING_IN_CONFIG="$TMP_DIR/missing_in_config.txt"
comm -23 "$CONFIG_LIST" "$CONTRACT_LIST" > "$EXTRA_IN_CONFIG" || true
comm -13 "$CONFIG_LIST" "$CONTRACT_LIST" > "$MISSING_IN_CONFIG" || true

CONFIG_COUNT=$(wc -l < "$CONFIG_LIST" | tr -d ' ')
CONTRACT_COUNT=$(wc -l < "$CONTRACT_LIST" | tr -d ' ')

if [ -s "$EXTRA_IN_CONFIG" ] || [ -s "$MISSING_IN_CONFIG" ]; then
  echo "❌ Stable surface drift detected" >&2
  echo "- Config:    $CONFIG ($CONFIG_COUNT commands)" >&2
  echo "- Contract:  $CONTRACT ($CONTRACT_COUNT commands)" >&2

  if [ -s "$EXTRA_IN_CONFIG" ]; then
    echo "\nCommands present in config but NOT in contract:" >&2
    sed 's/^/  - /' "$EXTRA_IN_CONFIG" >&2
  fi

  if [ -s "$MISSING_IN_CONFIG" ]; then
    echo "\nCommands present in contract but NOT in config:" >&2
    sed 's/^/  - /' "$MISSING_IN_CONFIG" >&2
  fi

  exit 1
fi

echo "✅ Stable surface OK ($CONFIG_COUNT commands)"
