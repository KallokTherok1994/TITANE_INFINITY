#!/usr/bin/env bash
# verify_autopilot_lock_bounds.sh
# Validates that Autopilot prompt files are single-lock bounded.
# Checks: autopilot prompts mention active lock only, forbid next-lock execution,
#         include allowlist, include stoplines, include proof pack requirement.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

RUNNER=".github/prompts/autopilot-lock-runner.prompt.md"

# Gate 1: autopilot-lock-runner.prompt.md exists
if [[ -f "$RUNNER" ]]; then
  pass "AUTOPILOT_RUNNER_PRESENT"
else
  fail "AUTOPILOT_RUNNER_MISSING: $RUNNER"
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

# Gate 2: mentions AUTOPILOT_SINGLE_LOCK (single lock execution)
if grep -q 'AUTOPILOT_SINGLE_LOCK' "$RUNNER" 2>/dev/null; then
  pass "AUTOPILOT_SINGLE_LOCK_DECLARED"
else
  fail "AUTOPILOT_SINGLE_LOCK_MISSING in $RUNNER"
fi

# Gate 3: forbids next-lock execution
if grep -qi 'FORBIDDEN.*next.lock\|Do NOT.*next lock\|next lock.*ONLY on explicit\|forbids next-lock\|no.*next.lock.*auto' "$RUNNER" 2>/dev/null; then
  pass "NEXT_LOCK_FORBIDDEN_DECLARED"
else
  fail "NEXT_LOCK_FORBIDDEN_MISSING in $RUNNER"
fi

# Gate 4: includes allowlist section
if grep -qi 'allowlist\|Mutation Allowlist\|may ONLY modify' "$RUNNER" 2>/dev/null; then
  pass "ALLOWLIST_PRESENT"
else
  fail "ALLOWLIST_MISSING in $RUNNER"
fi

# Gate 5: includes stoplines
if grep -qi 'stopline\|Stop.*return\|BLOCKED_APPROVAL' "$RUNNER" 2>/dev/null; then
  pass "STOPLINES_PRESENT"
else
  fail "STOPLINES_MISSING in $RUNNER"
fi

# Gate 6: includes proof pack requirement
if grep -qi 'proof.pack\|PROOF_PACK\|VERDICT\.md' "$RUNNER" 2>/dev/null; then
  pass "PROOF_PACK_REQUIREMENT_PRESENT"
else
  fail "PROOF_PACK_REQUIREMENT_MISSING in $RUNNER"
fi

# Gate 7: includes final report format
if grep -qi 'Final Report Format\|VERDICT:\|LOCK_ID:' "$RUNNER" 2>/dev/null; then
  pass "FINAL_REPORT_FORMAT_PRESENT"
else
  fail "FINAL_REPORT_FORMAT_MISSING in $RUNNER"
fi

# Gate 8: RETURN_CONTROL_AFTER_LOCK declared
if grep -q 'RETURN_CONTROL_AFTER_LOCK' "$RUNNER" 2>/dev/null; then
  pass "RETURN_CONTROL_AFTER_LOCK_DECLARED"
else
  fail "RETURN_CONTROL_AFTER_LOCK_MISSING in $RUNNER"
fi

# Gate 9: autopilot-lock-runner must NOT mention executing A1 or future locks automatically
if grep -qi 'execute.*A1\|auto.*execute.*next\|continue to.*A[0-9]' "$RUNNER" 2>/dev/null; then
  fail "AUTOPILOT_RUNNER_REFERENCES_NEXT_LOCK_EXECUTION (must not auto-execute A1+)"
else
  pass "AUTOPILOT_RUNNER_DOES_NOT_AUTO_EXECUTE_NEXT_LOCK"
fi

# Gate 10: OWNERSHIP.md exists and maps autopilot_allowed field
OWNERSHIP=".github/prompts/OWNERSHIP.md"
if [[ -f "$OWNERSHIP" ]]; then
  pass "OWNERSHIP_MD_PRESENT"
  if grep -q 'autopilot_allowed' "$OWNERSHIP" 2>/dev/null; then
    pass "OWNERSHIP_AUTOPILOT_ALLOWED_FIELD_PRESENT"
  else
    fail "OWNERSHIP_AUTOPILOT_ALLOWED_FIELD_MISSING in $OWNERSHIP"
  fi
else
  fail "OWNERSHIP_MD_MISSING: $OWNERSHIP"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
