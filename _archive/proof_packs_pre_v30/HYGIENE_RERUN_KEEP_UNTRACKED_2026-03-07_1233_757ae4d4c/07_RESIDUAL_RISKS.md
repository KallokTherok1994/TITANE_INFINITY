# 07_RESIDUAL_RISKS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `post-gate residual risk register`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. List only remaining live risks.
2. Mark impact on STABLE/SEALED.

E) PROOFS:

R-001 | P2
- Preuve: `raw/workspace_classification_counts.txt` (`untracked_proof_allowed_count=296`)
- Impact: local `git status` noise from many proof artifacts.
- Blocks STABLE?: No.
- Blocks SEALED_CANDIDATE?: No.

R-002 | P2
- Preuve: `raw/workspace_classification_full.tsv`
- Impact: proof artifacts growth may pressure local storage.
- Blocks STABLE?: No.
- Blocks SEALED_CANDIDATE?: No.

R-003 | P2
- Preuve: `raw/recheck_verify_registry_status.txt` (registry check skipped by scope)
- Impact: requires discipline to rerun when registry/runtime surfaces are touched in future.
- Blocks STABLE?: No.
- Blocks SEALED_CANDIDATE?: No.

F) ROLLBACK:
- Risk ledger only.
