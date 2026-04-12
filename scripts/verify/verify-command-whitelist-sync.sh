#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

OUT_DIR="${1:-reports/command_whitelist_sync}"
EXCEPTIONS_FILE="${2:-scripts/verify/allowlist-exceptions.txt}"
REGISTERED_NOT_ALLOWED_MAX="${REGISTERED_NOT_ALLOWED_MAX:-10000}"

mkdir -p "$OUT_DIR"

UI_USED_FILE="$OUT_DIR/04_COMMANDS_USED_UI.txt"
ALLOWED_FILE="$OUT_DIR/05_ALLOWED_COMMANDS.txt"
RUST_FILE="$OUT_DIR/06_COMMANDS_REGISTERED_RUST.txt"
UI_USED_ALLOWED_FILE="$OUT_DIR/.ui_used_allowed.txt"
UI_NOT_ALLOWED_FILE="$OUT_DIR/UI_USED_BUT_NOT_ALLOWED.txt"
ALLOWED_NOT_REGISTERED_FILE="$OUT_DIR/ALLOWED_BUT_NOT_REGISTERED.txt"
REGISTERED_NOT_ALLOWED_FILE="$OUT_DIR/REGISTERED_BUT_NOT_ALLOWED.txt"
SUMMARY_FILE="$OUT_DIR/07_SYNC_DIFFS.md"

UI_SCAN_PATHS=(
  "src/pages"
  "src/components/layout"
  "src/components/sections"
  "src/features/admin"
  "src/features/audio-center"
  "src/components/diagnostic"
)

echo "[G_COMMAND_WHITELIST_SYNC] start $(date -Iseconds)"

{
  rg -o --no-filename --pcre2 "(?:safeInvoke|secureInvoke|invoke|ipcCall)\(\s*['\"][A-Za-z0-9_.:-]+['\"]" \
    "${UI_SCAN_PATHS[@]}" --glob "*.ts" --glob "*.tsx" \
    --glob "!src/**/__tests__/**" --glob "!src/tests/**" --glob "!src/**/tests/**" || true
} | sed -E "s/.*\(\s*['\"]([^'\"]+)['\"].*/\1/" \
  | LC_ALL=C sort -u > "$UI_USED_FILE"

node - <<'NODE' > "$ALLOWED_FILE.tmp"
const fs = require('node:fs');
const content = fs.readFileSync('src/lib/security.ts', 'utf8');
const block = content.match(/export const ALLOWED_COMMANDS = new Set<string>\(\[([\s\S]*?)\]\);/);
if (!block) process.exit(2);
const matches = [...block[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const unique = [...new Set(matches)].sort();
for (const item of unique) console.log(item);
NODE

LC_ALL=C sort -u "$ALLOWED_FILE.tmp" > "$ALLOWED_FILE"
rm -f "$ALLOWED_FILE.tmp"

node - <<'NODE' > "$RUST_FILE.tmp"
const fs = require('node:fs');
const mainRs = fs.readFileSync('src-tauri/src/main.rs', 'utf8');
const paths = new Set();

const handlerMatch = mainRs.match(/generate_handler!\[([\s\S]*?)\]\)/);
if (handlerMatch) {
  for (const m of handlerMatch[1].matchAll(/([A-Za-z_][A-Za-z0-9_]*(?:::[A-Za-z_][A-Za-z0-9_]*)+)/g)) {
    paths.add(m[1]);
  }
}

for (const m of mainRs.matchAll(/#\[tauri::command\][\s\S]{0,180}?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) {
  paths.add(m[1]);
}

const commands = [...paths]
  .map(item => item.includes('::') ? item.split('::').pop() : item)
  .filter(Boolean)
  .sort();

const unique = [...new Set(commands)];
for (const cmd of unique) console.log(cmd);
NODE

LC_ALL=C sort -u "$RUST_FILE.tmp" > "$RUST_FILE"
rm -f "$RUST_FILE.tmp"

LC_ALL=C comm -12 "$UI_USED_FILE" "$ALLOWED_FILE" > "$UI_USED_ALLOWED_FILE" || true
LC_ALL=C comm -23 "$UI_USED_FILE" "$ALLOWED_FILE" > "$UI_NOT_ALLOWED_FILE" || true
LC_ALL=C comm -23 "$UI_USED_ALLOWED_FILE" "$RUST_FILE" > "$ALLOWED_NOT_REGISTERED_FILE" || true
LC_ALL=C comm -13 "$ALLOWED_FILE" "$RUST_FILE" > "$REGISTERED_NOT_ALLOWED_FILE.raw" || true

if [[ -f "$EXCEPTIONS_FILE" ]]; then
  grep -Ev "^\s*(#|$)" "$EXCEPTIONS_FILE" | sort -u > "$OUT_DIR/.exceptions.filtered" || true
  if [[ -s "$OUT_DIR/.exceptions.filtered" ]]; then
    grep -Fvx -f "$OUT_DIR/.exceptions.filtered" "$REGISTERED_NOT_ALLOWED_FILE.raw" > "$REGISTERED_NOT_ALLOWED_FILE" || true
  else
    cp "$REGISTERED_NOT_ALLOWED_FILE.raw" "$REGISTERED_NOT_ALLOWED_FILE"
  fi
else
  cp "$REGISTERED_NOT_ALLOWED_FILE.raw" "$REGISTERED_NOT_ALLOWED_FILE"
fi

UI_NOT_ALLOWED_COUNT=$(wc -l < "$UI_NOT_ALLOWED_FILE" | tr -d ' ')
ALLOWED_NOT_REGISTERED_COUNT=$(wc -l < "$ALLOWED_NOT_REGISTERED_FILE" | tr -d ' ')
REGISTERED_NOT_ALLOWED_COUNT=$(wc -l < "$REGISTERED_NOT_ALLOWED_FILE" | tr -d ' ')

{
  echo "# G_COMMAND_WHITELIST_SYNC"
  echo
  echo "- UI_USED_BUT_NOT_ALLOWED: $UI_NOT_ALLOWED_COUNT"
  echo "- ALLOWED_BUT_NOT_REGISTERED: $ALLOWED_NOT_REGISTERED_COUNT"
  echo "- REGISTERED_BUT_NOT_ALLOWED: $REGISTERED_NOT_ALLOWED_COUNT"
  echo "- REGISTERED_BUT_NOT_ALLOWED_MAX: $REGISTERED_NOT_ALLOWED_MAX"
  echo
  echo "## Files"
  echo "- 04_COMMANDS_USED_UI.txt"
  echo "- 05_ALLOWED_COMMANDS.txt"
  echo "- 06_COMMANDS_REGISTERED_RUST.txt"
  echo "- UI_USED_BUT_NOT_ALLOWED.txt"
  echo "- ALLOWED_BUT_NOT_REGISTERED.txt"
  echo "- REGISTERED_BUT_NOT_ALLOWED.txt"
} > "$SUMMARY_FILE"

if [[ "$UI_NOT_ALLOWED_COUNT" -gt 0 ]]; then
  echo "G_COMMAND_WHITELIST_SYNC=FAIL (UI_USED_BUT_NOT_ALLOWED)"
  exit 20
fi

if [[ "$ALLOWED_NOT_REGISTERED_COUNT" -gt 0 ]]; then
  echo "G_COMMAND_WHITELIST_SYNC=FAIL (ALLOWED_BUT_NOT_REGISTERED)"
  exit 21
fi

if [[ "$REGISTERED_NOT_ALLOWED_COUNT" -gt "$REGISTERED_NOT_ALLOWED_MAX" ]]; then
  echo "G_COMMAND_WHITELIST_SYNC=FAIL (REGISTERED_BUT_NOT_ALLOWED threshold exceeded)"
  exit 22
fi

echo "G_COMMAND_WHITELIST_SYNC=PASS"
