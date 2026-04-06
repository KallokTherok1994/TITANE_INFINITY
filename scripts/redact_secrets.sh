#!/usr/bin/env bash
# scripts/redact_secrets.sh — Redact secrets from files before export
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/redact_secrets.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-}"

if [[ -z "$TARGET_DIR" ]]; then
  echo "Usage: $0 <target_dir>"
  echo "  Redacts API keys, tokens, and secrets from all text files in <target_dir>"
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "ERROR: Target directory does not exist: $TARGET_DIR"
  exit 1
fi

echo "======================================================================"
echo " redact_secrets.sh — Redacting secrets in: $TARGET_DIR"
echo " $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

PATTERNS=(
  's/sk-[A-Za-z0-9_-]\{20,\}/[REDACTED_SK]/g'
  's/ghp_[A-Za-z0-9]\{36,\}/[REDACTED_GHP]/g'
  's/github_pat_[A-Za-z0-9_]\{20,\}/[REDACTED_PAT]/g'
  's/[Aa][Pp][Ii][_-]\?[Kk][Ee][Yy][[:space:]]*=[[:space:]]*["\x27][^"\x27]\{8,\}["\x27]/API_KEY=[REDACTED]/g'
  's/[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd][[:space:]]*=[[:space:]]*["\x27][^"\x27]\{6,\}["\x27]/PASSWORD=[REDACTED]/g'
  's/[Tt][Oo][Kk][Ee][Nn][[:space:]]*=[[:space:]]*["\x27][^"\x27]\{8,\}["\x27]/TOKEN=[REDACTED]/g'
)

REDACTED=0
while IFS= read -r -d '' file; do
  for pattern in "${PATTERNS[@]}"; do
    if sed -i "s/$pattern/g" "$file" 2>/dev/null || sed -i '' "s/$pattern/g" "$file" 2>/dev/null; then
      true
    fi
  done
  REDACTED=$((REDACTED+1))
done < <(find "$TARGET_DIR" -type f \( -name "*.json" -o -name "*.jsonl" -o -name "*.md" -o -name "*.txt" -o -name "*.log" \) -print0 2>/dev/null)

echo "Processed $REDACTED file(s) in $TARGET_DIR"
echo "Redaction complete"
exit 0
