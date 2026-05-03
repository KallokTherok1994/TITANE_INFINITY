# 09_ROLLBACK

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `rollback definition for this rerun`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. Confirm touched scope.
2. Provide exact rollback commands.

E) PROOFS:
- Touched scope: proof artifacts only under
  - `proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c/`
- No product/config/workflow files touched.

F) ROLLBACK:
```bash
# If this pack is committed and must be reverted:
git revert <commit_sha_with_this_pack> --no-edit

# If this pack remains local/untracked:
# no rollback action required
```
