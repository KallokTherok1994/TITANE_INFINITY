#!/usr/bin/env bash
# scripts/verify/verify_knowledge_governance.sh
# TITANE∞ — C2 Knowledge Governance Validator
# Lock: C2
# Checks governance index, metadata compliance, and registry linkage.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INDEX="$REPO_ROOT/data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json"
DESKTOP_REG="$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
AI_REG="$REPO_ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"

PASS=0
FAIL=0

ok() { echo "  PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

echo ""
echo "=== C2 Knowledge Governance Validator ==="
echo ""

# ── 1. Index exists ─────────────────────────────────────────────────────────────
echo "[1] Index file exists"
if [ -f "$INDEX" ]; then
  ok "data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json exists"
else
  fail "MISSING: data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json"
fi

# ── 2. Index is valid JSON ───────────────────────────────────────────────────────
echo "[2] Index is valid JSON"
if python3 -c "import json,sys; json.load(open('$INDEX'))" 2>/dev/null; then
  ok "Index is valid JSON"
else
  fail "Index is NOT valid JSON"
fi

# ── 3. Schema version ───────────────────────────────────────────────────────────
echo "[3] Schema version C2-v1"
SCHEMA_VER=$(python3 -c "import json; d=json.load(open('$INDEX')); print(d.get('schema_version','MISSING'))" 2>/dev/null || echo "MISSING")
if [ "$SCHEMA_VER" = "C2-v1" ]; then
  ok "schema_version = C2-v1"
else
  fail "schema_version expected C2-v1, got: $SCHEMA_VER"
fi

# ── 4. Entry count ───────────────────────────────────────────────────────────────
echo "[4] Entry count >= 1"
ENTRY_COUNT=$(python3 -c "import json; d=json.load(open('$INDEX')); print(len(d.get('entries',[])))" 2>/dev/null || echo "0")
if [ "$ENTRY_COUNT" -ge 1 ]; then
  ok "Governance index has $ENTRY_COUNT entries"
else
  fail "Governance index has 0 entries"
fi

# ── 5. Required fields on every entry ───────────────────────────────────────────
echo "[5] Required metadata fields on all entries"
REQUIRED_FIELDS="knowledge_id title domain source_type validation_status requires_web_validation risk_level"
FIELDS_OK=true
for field in $REQUIRED_FIELDS; do
  MISSING_COUNT=$(python3 -c "
import json
d = json.load(open('$INDEX'))
missing = sum(1 for e in d.get('entries', []) if '$field' not in e or e.get('$field') is None)
print(missing)
" 2>/dev/null || echo "ERROR")
  if [ "$MISSING_COUNT" = "0" ]; then
    ok "Field '$field' present on all entries"
  else
    fail "Field '$field' missing or null on $MISSING_COUNT entry(ies)"
    FIELDS_OK=false
  fi
done

# ── 6. time_sensitive entries require web validation ────────────────────────────
echo "[6] time_sensitive entries have requires_web_validation=true"
TS_NON_COMPLIANT=$(python3 -c "
import json
d = json.load(open('$INDEX'))
bad = [e['knowledge_id'] for e in d.get('entries', [])
       if e.get('freshness') == 'time_sensitive' and not e.get('requires_web_validation', False)]
print(len(bad))
if bad: print('IDs:', bad)
" 2>/dev/null || echo "ERROR")
TS_COUNT=$(echo "$TS_NON_COMPLIANT" | head -1)
if [ "$TS_COUNT" = "0" ]; then
  ok "All time_sensitive entries have requires_web_validation=true"
else
  fail "$TS_COUNT time_sensitive entries missing requires_web_validation=true"
fi

# ── 7. Public verified entries have URL or last_reviewed ────────────────────────
echo "[7] Public+verified entries have URL or last_reviewed"
PUB_NON_COMPLIANT=$(python3 -c "
import json
d = json.load(open('$INDEX'))
bad = [e['knowledge_id'] for e in d.get('entries', [])
       if e.get('source_type') == 'public'
       and e.get('validation_status') == 'verified'
       and not e.get('url')
       and not e.get('last_reviewed')]
print(len(bad))
" 2>/dev/null || echo "ERROR")
if [ "$PUB_NON_COMPLIANT" = "0" ]; then
  ok "No public+verified entries missing URL/date"
else
  fail "$PUB_NON_COMPLIANT public+verified entries without URL/date evidence"
fi

# ── 8. Unknown source cannot be high confidence ─────────────────────────────────
echo "[8] unknown source_type entries have confidence < 0.75"
UNK_HI_CONF=$(python3 -c "
import json
d = json.load(open('$INDEX'))
bad = [e['knowledge_id'] for e in d.get('entries', [])
       if e.get('source_type') == 'unknown' and e.get('confidence', 0) >= 0.75]
print(len(bad))
" 2>/dev/null || echo "ERROR")
if [ "$UNK_HI_CONF" = "0" ]; then
  ok "No unknown-source entries claim high confidence"
else
  fail "$UNK_HI_CONF unknown-source entries have confidence >= 0.75"
fi

# ── 9. High-risk domains have not_allowed_use ────────────────────────────────────
echo "[9] High-risk domains (legal/medical/financial/safety) have not_allowed_use"
HIGH_RISK_MISSING=$(python3 -c "
import json
HIGH_RISK = {'legal', 'medical', 'financial', 'safety'}
d = json.load(open('$INDEX'))
bad = [e['knowledge_id'] for e in d.get('entries', [])
       if e.get('domain') in HIGH_RISK and not e.get('not_allowed_use')]
print(len(bad))
if bad: print('IDs:', bad)
" 2>/dev/null || echo "ERROR")
HR_COUNT=$(echo "$HIGH_RISK_MISSING" | head -1)
if [ "$HR_COUNT" = "0" ]; then
  ok "All high-risk domain entries have not_allowed_use boundaries"
else
  fail "$HR_COUNT high-risk domain entries missing not_allowed_use"
fi

# ── 10. Spiritual_symbolic domain is not verified ────────────────────────────────
echo "[10] spiritual_symbolic entries are not verification_status=verified"
SPIRIT_VERIFIED=$(python3 -c "
import json
d = json.load(open('$INDEX'))
bad = [e['knowledge_id'] for e in d.get('entries', [])
       if e.get('domain') == 'spiritual_symbolic' and e.get('validation_status') == 'verified']
print(len(bad))
" 2>/dev/null || echo "ERROR")
if [ "$SPIRIT_VERIFIED" = "0" ]; then
  ok "No spiritual_symbolic entries claim verified status"
else
  fail "$SPIRIT_VERIFIED spiritual_symbolic entries incorrectly marked verified"
fi

# ── 11. Required domains present ────────────────────────────────────────────────
echo "[11] Required domains covered by index"
REQUIRED_DOMAINS="architecture memory knowledge safety legal medical financial spiritual_symbolic"
for domain in $REQUIRED_DOMAINS; do
  DOMAIN_COUNT=$(python3 -c "
import json
d = json.load(open('$INDEX'))
print(sum(1 for e in d.get('entries', []) if e.get('domain') == '$domain'))
" 2>/dev/null || echo "0")
  if [ "$DOMAIN_COUNT" -ge 1 ]; then
    ok "Domain '$domain' has $DOMAIN_COUNT entry(ies)"
  else
    fail "Domain '$domain' has no entry in governance index"
  fi
done

# ── 12. AI-DESKTOP-08 registered in Desktop E2E registry ────────────────────────
echo "[12] AI-DESKTOP-08 registered in Desktop E2E registry"
if grep -q "AI-DESKTOP-08" "$DESKTOP_REG" 2>/dev/null; then
  ok "AI-DESKTOP-08 found in TITANE_DESKTOP_E2E_REGISTRY.md"
else
  fail "AI-DESKTOP-08 NOT found in TITANE_DESKTOP_E2E_REGISTRY.md"
fi

# ── 13. C2 in Advanced Intelligence Registry ────────────────────────────────────
echo "[13] REG-AI-C2 in Advanced Intelligence Registry"
if grep -q "REG-AI-C2\|C2.*Knowledge" "$AI_REG" 2>/dev/null; then
  ok "C2 entry found in TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
else
  fail "C2 entry NOT found in TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
fi

# ── Summary ───────────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo " RESULT: PASS=$PASS FAIL=$FAIL"
echo "=========================================="
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
