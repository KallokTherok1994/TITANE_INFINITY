# 07 Rollback

To revert this fix lane:

1. Revert code/doc changes:
	- `git restore -- scripts/tauri/before-dev.sh scripts/verify/pre-deployment-check.sh LICENSE.md CHANGELOG.md scripts/autoheal/autoheal_rules.jsonl`
2. Revert lane artifacts:
	- `git restore --staged --worktree proof_packs/FINAL_RESUME_POST_DRIFT_FIX_2026-03-07_1842_d859691c8`
	- or `rm -rf proof_packs/FINAL_RESUME_POST_DRIFT_FIX_2026-03-07_1842_d859691c8` if untracked.

