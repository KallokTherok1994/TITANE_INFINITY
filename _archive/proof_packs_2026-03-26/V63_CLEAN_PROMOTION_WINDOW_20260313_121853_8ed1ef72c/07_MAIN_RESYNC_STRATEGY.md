# 07 - Main Resync Strategy

Chosen strategy:
- `DETACHED_HEAD_BLOCKER` detected.
- `CHERRY_PICK_PROMOTION_ONLY` selected (via promotion transfer stash to a branch from `origin/MAIN`).

Execution:
- created `v63_clean_promotion_window` from `origin/MAIN`.
- applied promotion stash.
- resolved one conflict (`scripts/autoheal/autoheal_rules.jsonl`) append-only.
- final sync state: `AHEAD_BEHIND=0 0`.

Evidence:
- `raw/08_main_resync_strategy.txt`
- `raw/09_main_resync_execution.log`
