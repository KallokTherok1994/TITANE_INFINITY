#!/usr/bin/env bash
# verify_copilot_instruction_source_map.sh
# Validates docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md
# Checks: file exists, each non-empty source entry has status field,
#         VERIFIED entries include url + date_accessed,
#         TO_VERIFY entries are not promoted as adopted doctrine.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

SOURCE_MAP="docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md"

# Gate 1: file exists
if [[ -f "$SOURCE_MAP" ]]; then
  pass "SOURCE_MAP_EXISTS"
else
  fail "SOURCE_MAP_MISSING: $SOURCE_MAP"
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

# Gate 2: each source entry block has a status field
ENTRY_COUNT=$(grep -c '^### S[0-9]' "$SOURCE_MAP" 2>/dev/null || echo 0)
STATUS_COUNT=$(grep -c 'status:' "$SOURCE_MAP" 2>/dev/null || echo 0)

if [[ "$ENTRY_COUNT" -gt 0 ]]; then
  pass "SOURCE_ENTRIES_PRESENT: $ENTRY_COUNT entries"
else
  fail "SOURCE_ENTRIES_MISSING: no S### entries found"
fi

if [[ "$STATUS_COUNT" -ge "$ENTRY_COUNT" ]]; then
  pass "SOURCE_STATUS_FIELDS_PRESENT: $STATUS_COUNT status fields for $ENTRY_COUNT entries"
else
  fail "SOURCE_STATUS_FIELDS_INCOMPLETE: $STATUS_COUNT status fields for $ENTRY_COUNT entries"
fi

# Gate 3: VERIFIED entries must have url and date_accessed
# Count using lines-in-file approach (source map YAML blocks have url before status)
VERIFIED_COUNT=$(grep -c '^status: VERIFIED' "$SOURCE_MAP" 2>/dev/null || echo 0)
URL_COUNT=$(grep -c '^url:' "$SOURCE_MAP" 2>/dev/null || echo 0)
DATE_COUNT=$(grep -c '^date_accessed:' "$SOURCE_MAP" 2>/dev/null || echo 0)

if [[ "$VERIFIED_COUNT" -gt 0 ]]; then
  pass "VERIFIED_ENTRIES_PRESENT: $VERIFIED_COUNT"
  if [[ "$URL_COUNT" -ge "$VERIFIED_COUNT" ]]; then
    pass "VERIFIED_ENTRIES_HAVE_URL"
  else
    fail "VERIFIED_ENTRIES_MISSING_URL: only $URL_COUNT url fields for $VERIFIED_COUNT verified entries"
  fi
  if [[ "$DATE_COUNT" -ge "$VERIFIED_COUNT" ]]; then
    pass "VERIFIED_ENTRIES_HAVE_DATE_ACCESSED"
  else
    fail "VERIFIED_ENTRIES_MISSING_DATE_ACCESSED: only $DATE_COUNT date_accessed for $VERIFIED_COUNT verified entries"
  fi
else
  pass "NO_VERIFIED_ENTRIES_YET (acceptable for initial map)"
fi

# Gate 4: TO_VERIFY entries must NOT have doctrine_impact: adopted
# Use awk to detect if doctrine_impact: adopted appears in the same YAML block as status: TO_VERIFY
# (not in a notes text mentioning the word "adopted")
if awk '
  /^status: TO_VERIFY/ { in_to_verify=1; next }
  /^status:/ { in_to_verify=0 }
  /^###/ { in_to_verify=0 }
  in_to_verify && /^doctrine_impact: adopted/ { found=1; exit }
  END { exit !found }
' "$SOURCE_MAP" 2>/dev/null; then
  fail "TO_VERIFY_SOURCE_PROMOTED_AS_ADOPTED: TO_VERIFY sources cannot have doctrine_impact: adopted"
else
  pass "TO_VERIFY_NOT_ADOPTED: no TO_VERIFY source promotes to adopted"
fi

# Gate 5: Adoption rules section present
if grep -q 'Adoption Rules' "$SOURCE_MAP" 2>/dev/null; then
  pass "ADOPTION_RULES_SECTION_PRESENT"
else
  fail "ADOPTION_RULES_SECTION_MISSING"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
