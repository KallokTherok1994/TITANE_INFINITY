# 09_RESIDUAL_RISKS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `remaining risk register`

C) RISK: `P1`

D) PLAN (<=7):
1. List only living risks.
2. Mark gate impact.

E) PROOFS:

R-001 | P1
- Preuve: `raw/proof_packs_untracked_dirs_status.txt`
- Impact: `git status` remains noisy.
- Bloque relance hygiene?: No (under chosen doctrine).
- Bloque STABLE?: No.
- Bloque SEALED_CANDIDATE?: No.

R-002 | P1
- Preuve: `raw/proof_packs_tracked_dirs.txt` + `raw/proof_packs_untracked_dirs_status.txt`
- Impact: historical mixed behavior may reintroduce confusion.
- Bloque relance hygiene?: No, if canon applied explicitly.
- Bloque STABLE?: No.
- Bloque SEALED_CANDIDATE?: No.

R-003 | P2
- Preuve: `raw/proof_pack_tracking_counts.txt` and large pack sizes from prior hygiene pack evidence.
- Impact: local storage pressure from retained untracked proof artifacts.
- Bloque relance hygiene?: No.
- Bloque STABLE?: No.
- Bloque SEALED_CANDIDATE?: No.

F) ROLLBACK:
- Risk report only.
