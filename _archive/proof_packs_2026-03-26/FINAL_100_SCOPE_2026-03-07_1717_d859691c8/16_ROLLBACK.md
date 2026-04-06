# 16 Rollback

- `git restore -- scripts/verify/pre-deployment-check.sh scripts/verify/verify-preprod.sh`
- `git restore -- scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl`
- `git restore -- registry/proofpack-index.jsonl registry/closure-events.jsonl` (if appended)
- `git restore -- proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8`
