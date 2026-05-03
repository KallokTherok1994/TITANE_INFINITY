## PHASE 1 - SCOPE FREEZE

## Frozen Invariants

- Do not reopen Bucket C tracked quality logic.
- Do not broad-commit untracked proof-packs.
- Use one isolated boundary only for this lane.

## Frozen Boundary Candidate

- Include candidate pack: `proof_packs/BUCKET_C_EXECUTION_2026-03-07_1615_988814c21/**`
- Include tracked append: `scripts/autoheal/autoheal_rules.jsonl`
- Exclude all other untracked proof-pack directories from current commit.

## Frozen Safety Rules

- Exact-path dry-run required before staging.
- Exact set equality required between dry-run set, staged set, and committed set.
- Stop-line if ambiguity or contamination appears.

