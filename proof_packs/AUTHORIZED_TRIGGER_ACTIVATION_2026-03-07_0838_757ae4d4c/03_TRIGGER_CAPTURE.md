# 03_TRIGGER_CAPTURE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `raw signal capture`

C) RISK: `P1`

D) PLAN (<=7):
1. Capture signal source exactly.
2. Capture timestamp.
3. Capture signal nature and touched surface.
4. Preserve raw artifact path.
5. Avoid any early qualification.

E) PROOFS:
- Raw signal artifact:
  - `raw/trigger_signal_capture.txt`
- Source artifact:
  - `raw/trigger_signal_origin_current_idle_signals.txt`

Captured fields:
- `TRIGGER_SIGNAL_RAW = no_authorized_trigger_observed`
- `TRIGGER_SOURCE = governed_idle_current_signals`
- `TRIGGER_SURFACE = governance_state_and_workspace_drift_signal`

F) ROLLBACK:
- Capture-only file.
