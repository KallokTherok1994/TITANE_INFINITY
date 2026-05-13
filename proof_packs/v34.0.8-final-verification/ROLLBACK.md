# Rollback
If this closure proof pack must be reverted:

1. Remove proof pack files from git index/worktree:
   git restore --staged proof_packs/v34.0.8-final-verification/REPORT.md proof_packs/v34.0.8-final-verification/VERDICT.md proof_packs/v34.0.8-final-verification/ROLLBACK.md
   git restore -- proof_packs/v34.0.8-final-verification/REPORT.md proof_packs/v34.0.8-final-verification/VERDICT.md proof_packs/v34.0.8-final-verification/ROLLBACK.md

2. If directory is empty after restore:
   rmdir proof_packs/v34.0.8-final-verification

3. No source/runtime behavior is changed by this proof pack commit.
