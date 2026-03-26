# 03 Scope Freeze

## In-scope

- Baseline PASS confirmation
- Repo truth (`clean/dirty/drifted`)
- PR truth (`exists/draft/mergeable/review/checks` when accessible)
- CI truth from available GitHub runs
- Minimal gate reruns relevant to readiness closure
- Proof-pack integrity checks
- Residual risk triage and final seal-readiness decision

## Out-of-scope

- New functional fixes outside direct readiness blockers
- Full-repo re-audit
- Refactors and architecture changes
- Rewriting E2E suites

## Stopline criteria used

- No assumption without command/log/file proof
- External inaccessible truth is classified as `UNKNOWN_EXTERNAL`/`BLOCKED_*`

