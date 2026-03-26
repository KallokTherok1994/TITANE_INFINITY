# 03_ENTRY_REQUEST_TRUTH

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `entry signal truth extraction`

C) RISK: `P1`

D) PLAN (<=7):
1. Capture explicit user entry request.
2. Determine if request contains explicit new scope.
3. Determine if request contains proven technical drift evidence.
4. Assign primary entry-request category.

E) PROOFS:
- Source: `raw/entry_signal_capture.txt`

Primary request truth:
- Formulation: user asks to run the entry gate and decide whether a new cycle may open.
- Source: current user request and `raw/entry_signal_capture.txt`.
- Portee: decision gate only (not a new implementation scope).
- Nature: control request, not feature request.
- Niveau de preuve:
  - `EXPLICIT_NEW_SCOPE_IN_REQUEST: none provided`
  - `PROVEN_DRIFT_EVIDENCE_IN_REQUEST: none provided`

Primary category:
- `NO_REAL_ENTRY`.

F) ROLLBACK:
- Truth capture only.
