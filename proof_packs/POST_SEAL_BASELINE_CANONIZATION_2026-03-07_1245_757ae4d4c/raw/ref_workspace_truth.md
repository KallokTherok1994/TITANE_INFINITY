# 04_WORKSPACE_TRUTH

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `workspace truth under KEEP_UNTRACKED`

C) RISK: `P0`

D) PLAN:
1. Measure tracked unstaged/staged drift.
2. Measure untracked non-proof vs proof-only.
3. Confirm doctrine-compatible cleanliness.

E) PROOFS:
- `raw/workspace_truth_metrics.txt`
  - `tracked_unstaged=0`
  - `tracked_staged=0`
  - `untracked_nonproof=0`
  - `untracked_proof=345`
- Path splits:
  - `raw/workspace_untracked_proof_only.txt`
  - `raw/workspace_untracked_nonproof_only.txt` (empty)

WORKSPACE_STATUS = `CLEAN_BY_DOCTRINE`

F) ROLLBACK:
- Read-only measurements only.
