# 14 Rollback

If rollback of V9 proof artifacts is required:

1. Restore autoheal entry change:
- git restore -- scripts/autoheal/autoheal_rules.jsonl

2. Remove V9 proof pack directory from working tree:
- git restore -- proof_packs/POST_PROD_UI_CHAIN_OF_TRUTH_V9_2026-03-11_0532_b573e79c

3. If committed, revert commit(s):
- git revert <v9_commit_sha> --no-edit

Runtime recovery rollback:
- N/A (process restart only, no persistent runtime config change)
