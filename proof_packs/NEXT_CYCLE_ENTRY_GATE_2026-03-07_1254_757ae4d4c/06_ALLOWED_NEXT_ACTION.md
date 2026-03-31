# 06_ALLOWED_NEXT_ACTION

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `next action policy`

C) RISK: `P1`

D) PLAN (<=7):
1. Map action policy to `ENTRY_CLASS`.
2. Emit single allowed next action.
3. Bound max scope to avoid accidental reopen.

E) PROOFS:
- `ENTRY_CLASS=NO_ENTRY` (`raw/entry_gate_eval.txt`).
- Canon baseline constraints from `raw/canon_VERDICT.md`.

NEXT_ALLOWED_ACTION:
- Keep canonical baseline active; do not open a new cycle.

WHY:
- No admissible entry door (no new scope, no proven drift).

FIRST_COMMAND_OR_FIRST_DOC:
- First doc if a new signal appears: create a fresh scoped proof pack and capture explicit scope or drift evidence before any code change.

MAX_SCOPE:
- `DOCUMENTARY_ONLY` until admissible entry evidence exists.

F) ROLLBACK:
- Policy statement only.
