# 04_HYGIENE_GATE_RERUN

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `hygiene gate rerun (explicit command reconstruction)`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. Apply `CANON_RULE=KEEP_UNTRACKED`.
2. Check tracked unstaged drift.
3. Check tracked staged drift.
4. Check untracked non-proof count.
5. Allow untracked under `proof_packs/`.
6. Emit gate verdict with exit code.

E) PROOFS:
- Command logic snapshot:
  - `raw/hygiene_gate_command.txt`
- Execution log:
  - `raw/hygiene_gate_rerun.log`
  - `raw/hygiene_gate_rerun.exit`

Observed output:
- `CANON_RULE=KEEP_UNTRACKED`
- `tracked_unstaged=0`
- `tracked_staged=0`
- `untracked_all=304`
- `untracked_nonproof=0`
- `HYGIENE_GATE=PASS`
- `exit=0`

HYGIENE_GATE verdict: `PASS`

F) ROLLBACK:
- No mutation done by gate checks.
