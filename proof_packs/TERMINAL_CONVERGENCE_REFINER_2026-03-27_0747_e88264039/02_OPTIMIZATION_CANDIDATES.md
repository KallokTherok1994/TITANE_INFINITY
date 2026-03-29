# 02 — Optimization Candidates

## CANDIDATE DISCOVERY

Per immutable decision logic, optimization candidates are NOT evaluated because the system is not in TERMINAL_REFINEMENT state.

```
IF system maturity is not TERMINAL_REFINEMENT
→ FINAL_UNIQUE_VERDICT = BLOCKED
```

Attempting to optimize while blocking issues remain would violate constitutional rules:
- TRUTH > ELEGANCE (truth not fully sealed)
- STABILITY > NOVELTY (critical chains fragile)
- PROOF > DESIRE (no post-patch proof)

## BLOCKING ISSUES PREVENTING CANDIDATE EVALUATION

| Issue | Status | Evidence |
|-------|--------|----------|
| AV-07 (unproven_quality_labels) | TRUE (pre-patch), UNKNOWN post-patch | ZERO_REGRESSION_AUTO_MODE |
| AV-08 (fabricated_conversation_history) | TRUE (pre-patch), UNKNOWN post-patch | ZERO_REGRESSION_AUTO_MODE |
| Lane B critical chains | 0/8 PASS (pre-patch) | ZERO_REGRESSION_AUTO_MODE |
| Post-patch evaluation | MISSING | No proof pack generated |

## THEORETICAL CANDIDATES (NOT EVALUATED)

The following candidates would be considered IF the system were in TERMINAL_REFINEMENT:

| Candidate | Class | Why Not Evaluated |
|-----------|-------|-------------------|
| Version header validator | VALIDATOR_HARDENING | System not in terminal state |
| Shell thinning (App.tsx) | SHELL_THINNING_MICRO | Deferred by CLINE_AUTHORITY_CORE_CONVERGENCE |
| Dependency triage | DEPENDENCY_SCOPE_REDUCTION | Deferred, requires pnpm why + cargo tree |
| CI gate hardening | VALIDATOR_HARDENING | Deferred, requires per-workflow validation |
| Labs certification | VALIDATOR_HARDENING | Deferred, requires individual runtime proof |

## RECOMMENDATION

**DO_NOT_TOUCH** — All candidates must wait until blocking issues are resolved and the system enters TERMINAL_REFINEMENT state.