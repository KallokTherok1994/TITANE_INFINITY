#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — Knowledge Base Health Check Script
#   Validates KB files: JSON validity, size, freshness, checksums
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

KB_DIR="data/knowledge_base/default"
CHECKSUMS_FILE="data/knowledge_base/KB_CHECKSUMS.sha256"
MIN_FILE_SIZE=100      # bytes — warn if smaller (likely skeleton)
STALE_DAYS=60          # warn if not modified in >60 days

total_files=0
valid_json=0
warnings=0
errors=0

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ KB Health Check"
echo "  Directory: $KB_DIR"
echo "═══════════════════════════════════════════════════════════════"

# ── 1. Check KB directory exists ─────────────────────────────────
if [[ ! -d "$KB_DIR" ]]; then
  echo "ERROR: KB directory not found: $KB_DIR"
  exit 1
fi

# ── 2. Collect JSON files ─────────────────────────────────────────
mapfile -t kb_files < <(find "$KB_DIR" -maxdepth 1 -name "*.json" -type f | sort)
total_files=${#kb_files[@]}

if [[ $total_files -eq 0 ]]; then
  echo "ERROR: No JSON files found in $KB_DIR"
  exit 1
fi

echo ""
echo "Checking $total_files JSON files..."
echo ""

# ── 3. Validate each file ─────────────────────────────────────────
stale_cutoff=$(date -d "-${STALE_DAYS} days" +%s 2>/dev/null || date -v-${STALE_DAYS}d +%s 2>/dev/null || echo "0")

for f in "${kb_files[@]}"; do
  fname=$(basename "$f")

  # 3a. JSON validity
  if jq . < "$f" > /dev/null 2>&1; then
    valid_json=$((valid_json + 1))
  else
    echo "  ERROR: Invalid JSON — $fname"
    errors=$((errors + 1))
    continue
  fi

  # 3b. Minimum size check
  fsize=$(wc -c < "$f" | tr -d ' ')
  if [[ $fsize -lt $MIN_FILE_SIZE ]]; then
    echo "  WARN: File too small (${fsize} bytes, likely skeleton) — $fname"
    warnings=$((warnings + 1))
  fi

  # 3c. Freshness check (stale > 60 days)
  if [[ "$stale_cutoff" != "0" ]]; then
    fmtime=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f" 2>/dev/null || echo "0")
    if [[ "$fmtime" != "0" && "$fmtime" -lt "$stale_cutoff" ]]; then
      echo "  WARN: Stale content (>${STALE_DAYS} days not modified) — $fname"
      warnings=$((warnings + 1))
    fi
  fi
done

echo ""
echo "─────────────────────────────────────────────────────────────"
echo "  Generating SHA256 checksums → $CHECKSUMS_FILE"
echo "─────────────────────────────────────────────────────────────"

# ── 4. Compute SHA256 checksums ───────────────────────────────────
mkdir -p "$(dirname "$CHECKSUMS_FILE")"

{
  echo "# TITANE∞ KB Checksums — generated $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  for f in "${kb_files[@]}"; do
    sha256sum "$f" 2>/dev/null || shasum -a 256 "$f" 2>/dev/null || echo "CHECKSUM_UNAVAILABLE  $f"
  done
} > "$CHECKSUMS_FILE"

echo "  Written: $CHECKSUMS_FILE"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "  Total files  : $total_files"
echo "  Valid JSON   : $valid_json"
echo "  Warnings     : $warnings"
echo "  Errors       : $errors"
echo "═══════════════════════════════════════════════════════════════"

if [[ $errors -gt 0 ]]; then
  echo "RESULT: FAIL (${errors} error(s))"
  exit 1
else
  echo "RESULT: PASS"
  exit 0
fi
