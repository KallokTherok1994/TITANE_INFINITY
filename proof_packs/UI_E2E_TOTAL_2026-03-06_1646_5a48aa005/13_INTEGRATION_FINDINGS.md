# 13 Integration Findings

## Resolved for certification decision

- Full-suite flaky persistence assertion resolved with causal bounded check.
- Smoke and full decision runs are both green x3 (`smoke_postfix3`, `full_postfix3`).
- Mandatory network/web/no-skip gates pass post-fix.

## Residual risk (non-blocking)

- Historical baseline logs include transient `invalid session id` and interaction instability signatures.
- These did not reproduce in the decision-grade post-fix x3 runs.

