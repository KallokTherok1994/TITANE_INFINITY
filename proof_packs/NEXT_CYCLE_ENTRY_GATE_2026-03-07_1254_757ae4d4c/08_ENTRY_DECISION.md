# 08_ENTRY_DECISION

VERDICT_UNIQUE: `NO_NEW_CYCLE`

ENTRY_CLASS: `NO_ENTRY`

JUSTIFICATION:
1. No explicit new scope is provided in the entry signal.
2. No proven drift is measured against canonical baseline (`tracked=0`, `untracked_nonproof=0`).
3. Canon baseline rule explicitly requires one valid door (`NEW_SCOPE` or `PROVEN_DRIFT`) before opening any new cycle.

TOP 3 PROOFS:
1. `raw/canon_VERDICT.md` -> `CANON_BASELINE_ESTABLISHED`, next cycle only on new scope or proven drift.
2. `raw/entry_signal_capture.txt` -> `EXPLICIT_NEW_SCOPE_IN_REQUEST: none provided`, `PROVEN_DRIFT_EVIDENCE_IN_REQUEST: none provided`.
3. `raw/current_entry_metrics.txt` + `raw/entry_gate_eval.txt` -> `tracked_unstaged=0`, `tracked_staged=0`, `untracked_nonproof=0`, `ENTRY_CLASS=NO_ENTRY`.

DELTA_CANDIDATE:
- `NONE` (no admissible entry).

NEXT_ALLOWED_ACTION:
- Keep baseline closed and active.
- Wait for either:
  - explicit new scoped objective, or
  - concrete measured drift evidence.

FIRST STEP <=30 min:
1. If a new request arrives, capture it as explicit `scope` or `drift` evidence in a fresh scoped proof pack before any mutation.
