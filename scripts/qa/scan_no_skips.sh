#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <proof_pack_dir> <output_md> [log_file_or_dir ...]" >&2
  exit 2
fi

PACK_DIR="$1"
OUT_FILE="$2"
shift 2

TMP_LIST="$(mktemp)"
TMP_MATCH="$(mktemp)"
trap 'rm -f "$TMP_LIST" "$TMP_MATCH"' EXIT

if [ "$#" -gt 0 ]; then
  for item in "$@"; do
    if [ -d "$item" ]; then
      find "$item" -type f -name '*.log' >> "$TMP_LIST"
    elif [ -f "$item" ]; then
      echo "$item" >> "$TMP_LIST"
    fi
  done
else
  if [ -d "$PACK_DIR/logs" ]; then
    find "$PACK_DIR/logs" -type f -name '*.log' >> "$TMP_LIST"
  fi
fi

sort -u "$TMP_LIST" -o "$TMP_LIST"
PATTERN='SKIP:|Relance avec|\<passed[[:space:]]+0\>|\<0[[:space:]]+tests?\>|([sS][kK][iI][pP].*exit[[:space:]]*0)|(exit[[:space:]]*0.*[sS][kK][iI][pP])'

if [ ! -s "$TMP_LIST" ]; then
  {
    echo "# NO-SKIPS Gate";
    echo "- Status: FAIL";
    echo "- Reason: aucun log à scanner";
  } >> "$OUT_FILE"
  echo "NO_LOGS"
  exit 1
fi

while IFS= read -r logf; do
  grep -nE "$PATTERN" "$logf" \
    | grep -vE "^[0-9]+:> bash -c 'if \[\[ .*TITANE_E2E_TAURI.*SKIP:.*Relance avec" \
    | grep -vE "package\.json:[0-9]+:" \
    | grep -vE "^[0-9]+:scripts/.*\.sh:[0-9]+:" \
    | grep -vE "^[0-9]+:src-tauri/src/.*\.rs:[0-9]+:" \
    | grep -vE "^[0-9]+:2:> titane-infinity@.*test" \
    | grep -vE "^2:> titane-infinity@" \
    >> "$TMP_MATCH" || true
done < "$TMP_LIST"

TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [ -s "$TMP_MATCH" ]; then
  {
    echo "# NO-SKIPS Gate";
    echo "- Timestamp UTC: $TS";
    echo "- Status: FAIL";
    echo "- Pattern: $PATTERN";
    echo "- Logs scanned: $(wc -l < "$TMP_LIST")";
    echo "";
    echo "## Extraits";
    echo '```text';
    sed -n '1,120p' "$TMP_MATCH";
    echo '```';
  } >> "$OUT_FILE"
  echo "NO_SKIPS_FAIL"
  exit 1
fi

{
  echo "# NO-SKIPS Gate";
  echo "- Timestamp UTC: $TS";
  echo "- Status: PASS";
  echo "- Pattern: $PATTERN";
  echo "- Logs scanned: $(wc -l < "$TMP_LIST")";
} >> "$OUT_FILE"

echo "NO_SKIPS_PASS"
