#!/usr/bin/env bash
# scorecard-instructions.sh
# Produces a health scorecard for the instruction system.
# Checks: duplication density, key validator coverage, structural invariants,
# and known anti-drift rules.
# Exit 0 = PASS (score >= MIN_PASS_SCORE), exit 1 = FAIL.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

MIN_PASS_SCORE="${MIN_PASS_SCORE:-80}"

SCORE=100
FAIL=0
FINDINGS=()

deduct() {
  local pts="$1"
  local reason="$2"
  SCORE=$((SCORE - pts))
  FINDINGS+=("DEDUCT -${pts}: ${reason}")
  FAIL=1
}

note() {
  FINDINGS+=("NOTE: $1")
}

# 1. Duplication: status vocabulary must appear only in kernel (not in lower instruction layers)
if _rg -n "PASS / FAIL / BLOCKED" -S \
   .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  deduct 15 "Status vocabulary duplicated outside kernel (found in lower-layer instruction files)"
else
  note "Status vocabulary canonical-only: PASS"
fi

# 2. AutoHeal path duplication (lower instruction layers only)
if _rg -n "autoheal_rules.jsonl" -S \
   .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  deduct 10 "AutoHeal canonical path duplicated outside kernel (found in lower-layer files)"
else
  note "AutoHeal path canonical-only: PASS"
fi

# 3. Token-gate contradiction: no prompt should require token for prod
if _rg -n "token.*requirements.*PROD|exact token requirements" -S \
   .github/prompts .github/agents 2>/dev/null | grep -q .; then
  deduct 20 "Token-gate language in prompts/agents contradicts Rule 11"
else
  note "No Rule 11 token-gate contradiction: PASS"
fi

# 4. Agent tooling: no npm/npx in governed agents
if _rg -n '\bnpm\s|\bnpx\s' -S .github/agents 2>/dev/null | grep -q .; then
  deduct 15 "npm/npx commands in agents — repo is pnpm-only"
else
  note "Agent tooling (pnpm-only): PASS"
fi

# 5. Legacy surface not referenced as authority
if _rg -n "copilot-agents/" -S \
   .github/copilot-instructions.md .github/instructions .github/agents .github/prompts \
   2>/dev/null | grep -q .; then
  deduct 10 "Legacy .github/copilot-agents/ referenced as authority"
else
  note "Legacy copilot-agents isolation: PASS"
fi

# 6. Required validator scripts present
for f in \
  scripts/verify/verify_instruction_layers.sh \
  scripts/verify/verify_no_doctrine_duplication.sh \
  scripts/verify/verify_status_vocabulary.sh \
  scripts/verify/verify_agents_index.sh \
  scripts/verify/verify_prompt_files_index.sh \
  scripts/verify/verify_local_markers_consistency.sh \
  scripts/verify/verify_kernel_budget.sh \
  scripts/verify/verify-agent-tooling.sh; do
  if [[ ! -f "$f" ]]; then
    deduct 5 "Required validator missing: $f"
  fi
done

# 7. Kernel budget
line_count=$(wc -l < .github/copilot-instructions.md | tr -d ' ')
if [[ "$line_count" -gt 220 ]]; then
  deduct 10 "Kernel budget exceeded: ${line_count} lines (max 220)"
else
  note "Kernel budget OK: ${line_count} lines"
fi

# 8. All required prompt files present
for f in \
  .github/prompts/audit-instructions.prompt.md \
  .github/prompts/fix-instructions-drift.prompt.md \
  .github/prompts/release-readiness.prompt.md \
  .github/prompts/contradiction-resolution.prompt.md \
  .github/prompts/run-proof-pack.prompt.md \
  .github/prompts/simple-fast-session.prompt.md \
  .github/prompts/heavy-runtime-session.prompt.md \
  .github/prompts/update-mapping.prompt.md; do
  if [[ ! -f "$f" ]]; then
    deduct 5 "Required prompt missing: $f"
  fi
done

# Cap score at 0
if [[ "$SCORE" -lt 0 ]]; then SCORE=0; fi

echo ""
echo "=== INSTRUCTION SCORECARD ==="
echo "Score: ${SCORE}/100  (min pass: ${MIN_PASS_SCORE})"
echo ""
for f in "${FINDINGS[@]}"; do
  echo "  $f"
done
echo ""

if [[ "$SCORE" -lt "$MIN_PASS_SCORE" ]]; then
  echo "FAIL: scorecard score ${SCORE} below minimum ${MIN_PASS_SCORE}"
  exit 1
fi

echo "PASS: instruction scorecard (score=${SCORE})"
