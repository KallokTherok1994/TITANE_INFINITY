# 05_DELTA_CANDIDATE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `delta candidate definition`

C) RISK: `P1`

D) PLAN (<=7):
1. Define minimal delta only if entry is admissible.
2. Keep strict bounds.

E) PROOFS:
- From `raw/entry_gate_eval.txt`: `ENTRY_CLASS=NO_ENTRY`.

DELTA_CANDIDATE:
- `NONE`.

Reason:
- No explicit new scope.
- No proven drift against canonical baseline.

Boundaries if/when future delta becomes admissible:
- Must be exactly one of `NEW_SCOPE` or `PROVEN_DRIFT` with explicit evidence.
- Must be bootstrapped in a new scoped proof pack before any mutation.

F) ROLLBACK:
- Delta declaration only.
