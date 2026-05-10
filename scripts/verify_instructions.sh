#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS+1)); }
ko() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

has_match() {
  local pattern="$1"
  shift
  if command -v rg >/dev/null 2>&1; then
    rg -n "$pattern" "$@" >/dev/null
  else
    grep -RInE "$pattern" "$@" >/dev/null
  fi
}

run_subgate() {
  local gate="$1"
  local script="$2"
  local tmp
  tmp="$(mktemp)"

  if bash "$script" >"$tmp" 2>&1; then
    ok "$gate"
  else
    ko "$gate"
    if [[ "${CI:-}" == "true" || "${GITHUB_ACTIONS:-}" == "true" ]]; then
      echo "---- ${gate} diagnostics ----" >&2
      sed -n '1,220p' "$tmp" >&2
      echo "---- end diagnostics ----" >&2
    fi
  fi

  rm -f "$tmp"
}

if [[ -f ".github/copilot-instructions.md" ]]; then ok "G_DOC_COPILOT_INSTRUCTIONS_PRESENT"; else ko "G_DOC_COPILOT_INSTRUCTIONS_PRESENT"; fi
if [[ -f ".github/copilot-workflow.mermaid" ]]; then ok "G_DOC_WORKFLOW_PRESENT"; else ko "G_DOC_WORKFLOW_PRESENT"; fi
if [[ -f ".github/copilot-setup-checklist.md" ]]; then ok "G_DOC_CHECKLIST_PRESENT"; else ko "G_DOC_CHECKLIST_PRESENT"; fi

# DEV_SAFE drift guard: canonical launcher + checklist alignment
if [[ -f "runtime/dev/run-dev.sh" ]]; then ok "G_DEVSAFE_CANONICAL_LAUNCHER_EXISTS"; else ko "G_DEVSAFE_CANONICAL_LAUNCHER_EXISTS"; fi
if grep -q "run-dev.sh" ".github/copilot-setup-checklist.md" 2>/dev/null; then ok "G_DEVSAFE_CHECKLIST_REFERENCES_LAUNCHER"; else ko "G_DEVSAFE_CHECKLIST_REFERENCES_LAUNCHER"; fi
if grep -qE "Node.*[≥>=]+.*2[0-9]|Node.*20" ".github/copilot-setup-checklist.md" 2>/dev/null; then ok "G_DEVSAFE_CHECKLIST_NODE_REQUIREMENT_VISIBLE"; else ko "G_DEVSAFE_CHECKLIST_NODE_REQUIREMENT_VISIBLE"; fi

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
if has_match "verdict unique|PASS / FAIL / BLOCKED" .github/copilot-instructions.md; then ok "G_MARKER_VERDICT_UNIQUE"; else ko "G_MARKER_VERDICT_UNIQUE"; fi
if has_match "Stop-the-line|STOP-THE-LINE" .github/copilot-instructions.md .github/instructions/titane.instructions.md; then ok "G_MARKER_STOPLINE"; else ko "G_MARKER_STOPLINE"; fi
if has_match "NO_SKIPS|no-skips|skipped by design" .github/copilot-instructions.md .github/instructions/titane.instructions.md; then ok "G_MARKER_NO_SKIPS"; else ko "G_MARKER_NO_SKIPS"; fi
if has_match "proof pack|Proof Pack|proof_packs" .github/copilot-instructions.md .github/instructions/titane.instructions.md; then ok "G_MARKER_PROOF_PACK"; else ko "G_MARKER_PROOF_PACK"; fi
if has_match "scripts/autoheal/autoheal_rules.jsonl" .github/copilot-instructions.md .github/instructions/tests-e2e.instructions.md .github/instructions/titane.instructions.md; then ok "G_MARKER_AUTOHEAL_CANONICAL_PATH"; else ko "G_MARKER_AUTOHEAL_CANONICAL_PATH"; fi

# Rule 11 — no token gate required
if has_match "no token gate" .github/copilot-instructions.md AGENTS.md; then ok "G_RULE11_NO_TOKEN_GATE"; else ko "G_RULE11_NO_TOKEN_GATE"; fi

# Rule 14 — BUILD ALL documented
if has_match "BUILD ALL" .github/copilot-instructions.md AGENTS.md; then ok "G_RULE14_BUILD_ALL_PRESENT"; else ko "G_RULE14_BUILD_ALL_PRESENT"; fi

# Rule 15 — per-layer mapping obligation present
if has_match "UI_SURFACE_MAP|IPC_CATALOG|CARTOGRAPHY_COMPLETE" .github/copilot-instructions.md .github/instructions/tauri.instructions.md .github/instructions/frontend.instructions.md; then ok "G_RULE15_MAPPING_OBLIGATION_PRESENT"; else ko "G_RULE15_MAPPING_OBLIGATION_PRESENT"; fi

# Rule 16 — test coverage matrix present
if has_match "Test coverage matrix|Rule 16|tauri-ipc-contract" .github/copilot-instructions.md .github/instructions/tests-e2e.instructions.md; then ok "G_RULE16_TEST_MATRIX_PRESENT"; else ko "G_RULE16_TEST_MATRIX_PRESENT"; fi

# Rule 15 — FAIL if keyword FAIL missing for mapping non-update
if has_match "classify.*FAIL.*mapping|FAIL.*mapping|mapping.*FAIL" .github/copilot-instructions.md .github/instructions/tauri.instructions.md .github/instructions/frontend.instructions.md; then ok "G_RULE15_FAIL_ON_MISSING_MAPPING"; else ko "G_RULE15_FAIL_ON_MISSING_MAPPING"; fi

# Rule 16 — BLOCKED if test missing
if has_match "BLOCKED.*test|test.*BLOCKED|until test exists" .github/copilot-instructions.md .github/instructions/tests-e2e.instructions.md .github/instructions/frontend.instructions.md .github/instructions/tauri.instructions.md; then ok "G_RULE16_BLOCKED_WITHOUT_TESTS"; else ko "G_RULE16_BLOCKED_WITHOUT_TESTS"; fi

# Agent audit tooling presence guards
if [[ -f "scripts/verify/verify-advanced-agents.sh" ]]; then ok "G_ADVANCED_AGENTS_AUDIT_SCRIPT_PRESENT"; else ko "G_ADVANCED_AGENTS_AUDIT_SCRIPT_PRESENT"; fi
if [[ -f "scripts/verify/verify-vscode-agent-workflow.sh" ]]; then ok "G_VSCODE_AGENT_WORKFLOW_SCRIPT_PRESENT"; else ko "G_VSCODE_AGENT_WORKFLOW_SCRIPT_PRESENT"; fi
if [[ -f "scripts/verify/verify-log-analysis-report.sh" ]]; then ok "G_LOG_ANALYSIS_REPORT_SCRIPT_PRESENT"; else ko "G_LOG_ANALYSIS_REPORT_SCRIPT_PRESENT"; fi

run_subgate "G_LOG_ANALYSIS_REPORT_AUDIT_PASS" "scripts/verify/verify-log-analysis-report.sh"

# Legacy REGLE_CRITIQUE must be archived (not active authority)
if has_match "ARCHIVÉE|SUPERSEDED|superseded|non.op.rationnelle" .github/REGLE_CRITIQUE_DEPLOIEMENT.md; then ok "G_REGLE_CRITIQUE_ARCHIVED"; else ko "G_REGLE_CRITIQUE_ARCHIVED"; fi

# detect recurrence guard
run_subgate "G_AH_RECURRENCE_GUARD_PASS" "scripts/autoheal/detect_recurrence.sh"

# prompt frontmatter guard
run_subgate "G_PROMPT_FRONTMATTER_PASS" "scripts/verify/verify_prompt_frontmatter.sh"

# vscode agent workflow guard
run_subgate "G_VSCODE_AGENT_WORKFLOW_PASS" "scripts/verify/verify-vscode-agent-workflow.sh"

# Extended execution gates (all offline-safe — static file checks only, no network/build)
run_subgate "G_KERNEL_BUDGET_PASS" "scripts/verify/verify_kernel_budget.sh"
run_subgate "G_INSTRUCTION_LAYERS_PASS" "scripts/verify/verify_instruction_layers.sh"
run_subgate "G_NO_DOCTRINE_DUPLICATION_PASS" "scripts/verify/verify_no_doctrine_duplication.sh"
run_subgate "G_STATUS_VOCAB_PASS" "scripts/verify/verify_status_vocabulary.sh"
run_subgate "G_AGENTS_INDEX_PASS" "scripts/verify/verify_agents_index.sh"
run_subgate "G_PROMPT_FILES_INDEX_PASS" "scripts/verify/verify_prompt_files_index.sh"
run_subgate "G_LOCAL_MARKERS_PASS" "scripts/verify/verify_local_markers_consistency.sh"
run_subgate "G_ADVANCED_AGENTS_PASS" "scripts/verify/verify-advanced-agents.sh"
run_subgate "G_OLLAMA_BOUNDARY_PASS" "scripts/verify/verify-ollama-copilot-boundary.sh"
run_subgate "G_AGENT_TOOLING_PASS" "scripts/verify/verify-agent-tooling.sh"
if [[ -f "scripts/verify/verify_copilot_instruction_source_map.sh" ]]; then ok "G_SOURCE_MAP_SCRIPT_PRESENT"; else ko "G_SOURCE_MAP_SCRIPT_PRESENT"; fi
run_subgate "G_SOURCE_MAP_PASS" "scripts/verify/verify_copilot_instruction_source_map.sh"
if [[ -f "scripts/verify/verify_autopilot_lock_bounds.sh" ]]; then ok "G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT"; else ko "G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT"; fi
run_subgate "G_AUTOPILOT_BOUNDS_PASS" "scripts/verify/verify_autopilot_lock_bounds.sh"

echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
