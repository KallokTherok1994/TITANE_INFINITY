# CI_ENVIRONMENT_FAILURE_DIAGNOSIS_v69_REPEATED

**Date:** 2026-05-10T22:12:00Z  
**Affected Runs:** 25640906760, 25641083408  
**Pattern:** Both runs failed on identical gates (G_VSCODE_AGENT_WORKFLOW_PASS, G_OLLAMA_BOUNDARY_PASS)

---

## Summary

Two consecutive CI runs failed on the same two gates:
- **Run 25640906760:** Step 18 FAIL (2 validators), Gates 1-17 PASS
- **Run 25641083408:** Step 18 FAIL (same 2 validators), Gates 1-17 PASS  
- **Local verification:** Both validators PASS cleanly (0 FAILs)

**Classification:** `CI_ENVIRONMENT_INCONSISTENT_STATE` (persistent, reproducible in CI only)

---

## Evidence

### Local Testing (PASS)
```bash
$ bash scripts/verify/verify-vscode-agent-workflow.sh 2>&1 | grep "^FAIL:"
# → (no output, 0 FAILs)

$ bash scripts/verify/verify-ollama-copilot-boundary.sh 2>&1 | grep "^FAIL"
# → (no output, 0 FAILs)

$ pnpm run verify:instructions 2>&1 | tail -3
# → SUMMARY: PASS=52 FAIL=0
```

### Remote CI Results (FAIL)
```
Run 25640906760:
  FAIL: G_VSCODE_AGENT_WORKFLOW_PASS (2026-05-10T22:02:46Z)
  FAIL: G_OLLAMA_BOUNDARY_PASS (2026-05-10T22:02:46Z)
  SUMMARY: PASS=50 FAIL=2

Run 25641083408:
  FAIL: G_VSCODE_AGENT_WORKFLOW_PASS (2026-05-10T22:10:38Z)
  FAIL: G_OLLAMA_BOUNDARY_PASS (2026-05-10T22:10:38Z)
  SUMMARY: PASS=50 FAIL=2
```

---

## Root Cause Analysis

### Hypothesis 1: Silent Shell Error (HIGH CONFIDENCE)
The validators are called via `bash scripts/verify/...` in verify_instructions.sh:
```bash
if bash scripts/verify/verify-vscode-agent-workflow.sh >/dev/null 2>&1; then
  ok "G_VSCODE_AGENT_WORKFLOW_PASS"
else
  ko "G_VSCODE_AGENT_WORKFLOW_PASS"  # ← This is where FAIL happens
fi
```

If the script exits with non-zero (or crashes silently), the `if` condition fails and we get FAIL.

**Possible sub-causes:**
1. **Source shim fails silently in CI** — `source _rg_compat.sh` returns error but is not caught
2. **`set -euo pipefail` in CI context** — may cause unexpected exit on non-fatal errors
3. **File permission issues** — CI runner may have different permissions
4. **Partial checkout** — GitHub Actions checkout may be incomplete on large repos

### Hypothesis 2: CI Environment Variable/State Issue (MEDIUM)
- CI runs are isolated GitHub Actions environments
- May lack system dependencies (rg, specific grep versions)
- PATH or shell context may differ

### Hypothesis 3: Caching/Stale Data (LOW)
- GitHub Actions has action caching which could stale files
- unlikely given check + lint pass cleanly

---

## Hardening Strategy

### Short-term Fix (Script-level)
1. Add explicit error handling with logging in validators
2. Use `timeout` wrapper to catch hung processes
3. Add diagnostic output to CI logs on failure
4. Test validators exist + are executable before running

### Long-term Fix (CI-level)
1. Add pre-flight diagnostics in workflow (environment dump)
2. Ensure all dependencies installed (rg via apt)
3. Add retry logic with exponential backoff for transient issues
4. Create CI-only validators with more defensive patterns

---

## Files to Patch

1. **scripts/verify/verify-vscode-agent-workflow.sh**
   - Add `set -x` for CI diagnostics
   - Add shim existence check
   - Add timeout wrapper

2. **scripts/verify/verify-ollama-copilot-boundary.sh**
   - Same hardening as above

3. **scripts/verify_instructions.sh**
   - Add CI diagnostic mode
   - Capture stderr from sub-validators
   - Provide actionable error messages

4. **.github/workflows/titane-static-gates.yml**
   - Add pre-flight environment dump
   - Ensure dependencies installed
   - Capture full logs on verify:instructions failure

---

## Next Steps

1. Apply script-level hardening to both validators
2. Test locally to confirm still PASS
3. Add CI environment pre-flight check to workflow
4. Commit + push with AutoHeal entry
5. Monitor next CI run 25641083408 alternative retry
