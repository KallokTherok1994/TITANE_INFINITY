# 07_DECISION_RULE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `canonical doctrine decision`

C) RISK: `P1`

D) PLAN (<=7):
1. Apply decision logic from authority hierarchy.
2. Select unique rule.
3. Record winning and rejected sources.

E) PROOFS:

DECISION_RULE: `KEEP_UNTRACKED`

Decision logic check:
1. No high-authority source explicitly mandates TRACK_ALL for `proof_packs/`: PASS.
2. Script tolerance + mixed repo practice + product/proof separation converge toward non-mandatory tracking: PASS.
3. Minimal patch / low-noise criterion favors KEEP_UNTRACKED: PASS.

Sources gagnantes:
1. `.github/copilot-instructions.md` (proof evidence required, no tracking mandate).
2. `.github/instructions/docs-registry.instructions.md` (append-only/no-delete/required files, no tracking mandate).
3. `scripts/certification/lib_cert.sh` (explicitly expects untracked proof packs in clean precheck).

Sources ecartees (for canon definition):
1. Historical tracked practice (`raw/proof_packs_tracked_dirs.txt`): lower authority.
2. Historical untracked practice (`raw/proof_packs_untracked_dirs_status.txt`): lower authority.
3. `run-p10-desktop-cert.sh` proof-pack commit step: scoped path (`deployment/latest/certification/phase10/`), not global `proof_packs/` canon.

F) ROLLBACK:
- Decision document only.
