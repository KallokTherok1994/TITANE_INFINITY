# 07_RESIDUAL_RISKS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `entry-gate residual risk ledger`

C) RISK: `P1`

D) PLAN (<=7):
1. List only opening-related risks.
2. Mark whether they block opening.

E) PROOFS:

R-001 | P1
- Risk: opening by inertia without valid door.
- Preuve: absence of scope/drift in `raw/entry_signal_capture.txt`.
- Impact: invalid cycle reopening, process regression.
- Bloque l'ouverture?: Yes.

R-002 | P1
- Risk: false drift from proof-only untracked volume.
- Preuve: `raw/current_entry_metrics.txt` (`untracked_nonproof=0`, proof-only untracked high volume).
- Impact: misclassification of clean-by-doctrine state.
- Bloque l'ouverture?: Yes (until real drift evidenced).

R-003 | P2
- Risk: ambiguous future requests interpreted as scope.
- Preuve: entry gate policy and ambiguity handling rule.
- Impact: unnecessary or oversized next cycle.
- Bloque l'ouverture?: Yes unless clarified with explicit scope.

F) ROLLBACK:
- Risk ledger only.
