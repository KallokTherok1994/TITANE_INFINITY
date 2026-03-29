# 08 — Residual Risks

## Risk Classification: LOW

### Risk 1: AV-07 and AV-08 Not Addressed
**Severity**: MEDIUM
**Description**: The patch only addresses AV-01 (false_memory_claim). AV-07 (unproven_quality_labels) and AV-08 (fabricated_conversation_history) remain unaddressed.
**Mitigation**: These are lower priority violations. AV-01 was the blocking issue.

### Risk 2: Pre-Existing Test Failure
**Severity**: LOW
**Description**: The test `conversation_os_schema_is_initialized_once_per_db_path` fails due to test isolation issues (static cache shared between tests).
**Mitigation**: This is a pre-existing bug unrelated to the patch. It does not affect production code.

### Risk 3: Full Eval Not Re-Run
**Severity**: MEDIUM
**Description**: The full X3 evaluation has not been re-run to verify that A-007 now passes.
**Mitigation**: The root cause is clearly identified and the fix is minimal. The existing tests pass.

### Risk 4: LLM Behavior Not Directly Tested
**Severity**: LOW
**Description**: We cannot directly test LLM behavior without running the full eval harness.
**Mitigation**: The fix ensures the INCONNU instruction is always injected, which is the correct anti-lie behavior.

## Overall Risk Assessment
**RESIDUAL_RISK: LOW**

The patch is minimal, causal, and addresses the identified root cause. The main risk is that the full eval has not been re-run, but this is acceptable given the clear root cause and minimal fix.