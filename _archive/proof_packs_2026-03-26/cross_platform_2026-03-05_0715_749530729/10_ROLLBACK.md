# 10_ROLLBACK
- No source/runtime patch applied.

Rollback commands for this run:
1) Remove only this proof pack:
  - `rm -rf proof_packs/cross_platform_2026-03-05_0715_749530729`
2) Or restore all proof packs from Git index/worktree state:
  - `git restore --staged --worktree -- proof_packs/`
