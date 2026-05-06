# Risk Register — B1I

## Active Risks
- R1: Historical duplicate rows in program status file (pre-existing drift).
  - Impact: documentation readability, low operational risk.
  - Mitigation: non-destructive update only during ingress normalization.

- R2: Unrelated local memory files modified in worktree.
  - Impact: accidental staging risk.
  - Mitigation: strict targeted git add, no wildcard staging.

## Residual Risk Verdict
PARTIAL

## Runtime Risk
None introduced (docs/proof only).
