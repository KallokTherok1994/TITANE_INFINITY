#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS+1)); }
ko() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

if [[ -f ".github/copilot-instructions.md" ]]; then ok "G_DOC_COPILOT_INSTRUCTIONS_PRESENT"; else ko "G_DOC_COPILOT_INSTRUCTIONS_PRESENT"; fi
if [[ -f ".github/copilot-workflow.mermaid" ]]; then ok "G_DOC_WORKFLOW_PRESENT"; else ko "G_DOC_WORKFLOW_PRESENT"; fi
if [[ -f ".github/copilot-setup-checklist.md" ]]; then ok "G_DOC_CHECKLIST_PRESENT"; else ko "G_DOC_CHECKLIST_PRESENT"; fi

# frontmatter minimal validation
for f in .github/instructions/*.instructions.md; do
  if [[ ! -f "$f" ]]; then
    continue
  fi
  if head -n 1 "$f" | grep -q '^---$'; then
    if awk 'NR>1 && /^---$/ {found=1; exit} END {exit(found?0:1)}' "$f"; then
      ok "G_FRONTMATTER_${f##*/}"
    else
      ko "G_FRONTMATTER_${f##*/}"
    fi
  else
    ko "G_FRONTMATTER_${f##*/}"
  fi
done

# mermaid minimal syntax guard
if grep -q '^flowchart ' .github/copilot-workflow.mermaid && grep -q -- '-->' .github/copilot-workflow.mermaid; then
  ok "G_MERMAID_SYNTAX_MIN"
else
  ko "G_MERMAID_SYNTAX_MIN"
fi

# AutoHeal system checks
for f in scripts/autoheal/README.md scripts/autoheal/autoheal_rules.jsonl scripts/autoheal/apply_autoheal.sh scripts/autoheal/detect_recurrence.sh; do
  if [[ -f "$f" ]]; then ok "G_AUTOHEAL_FILE_${f##*/}"; else ko "G_AUTOHEAL_FILE_${f##*/}"; fi
done

# JSONL validation required fields
if node <<'NODE'
const fs = require('fs');
const p = 'scripts/autoheal/autoheal_rules.jsonl';
if (!fs.existsSync(p)) process.exit(1);
const lines = fs.readFileSync(p,'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
if (!lines.length) process.exit(1);
const req = ['id','date','scope','symptom','root_cause','fix','prevention_test','commands','files_changed','rollback'];
for (let i=0;i<lines.length;i++) {
  let j;
  try { j = JSON.parse(lines[i]); } catch { process.exit(1); }
  for (const k of req) {
    const v = j[k];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length)) process.exit(1);
  }
}
console.log('INFO: autoheal-jsonl-valid');
NODE
then
  ok "G_AUTOHEAL_JSONL_VALID"
else
  ko "G_AUTOHEAL_JSONL_VALID"
fi

# mandatory doctrine markers
if rg -n "verdict unique|PASS / FAIL / BLOCKED" .github/copilot-instructions.md >/dev/null; then ok "G_MARKER_VERDICT_UNIQUE"; else ko "G_MARKER_VERDICT_UNIQUE"; fi
if rg -n "Stop-the-line|STOP-THE-LINE" .github/copilot-instructions.md .github/instructions/titane.instructions.md >/dev/null; then ok "G_MARKER_STOPLINE"; else ko "G_MARKER_STOPLINE"; fi
if rg -n "NO_SKIPS|no-skips|skipped by design" .github/copilot-instructions.md .github/instructions/titane.instructions.md >/dev/null; then ok "G_MARKER_NO_SKIPS"; else ko "G_MARKER_NO_SKIPS"; fi
if rg -n "proof pack|Proof Pack|proof_packs" .github/copilot-instructions.md .github/instructions/titane.instructions.md >/dev/null; then ok "G_MARKER_PROOF_PACK"; else ko "G_MARKER_PROOF_PACK"; fi
if rg -n "scripts/autoheal/autoheal_rules.jsonl" .github/copilot-instructions.md .github/instructions/tests-e2e.instructions.md .github/instructions/titane.instructions.md >/dev/null; then ok "G_MARKER_AUTOHEAL_CANONICAL_PATH"; else ko "G_MARKER_AUTOHEAL_CANONICAL_PATH"; fi

# detect recurrence guard
if bash scripts/autoheal/detect_recurrence.sh >/dev/null; then ok "G_AH_RECURRENCE_GUARD_PASS"; else ko "G_AH_RECURRENCE_GUARD_PASS"; fi

echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
