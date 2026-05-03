# 06_STANDBY_DECISION

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `standby decision`

C) RISK: `P1`

D) PLAN (<=7):
1. Consolidate trigger states.
2. Emit unique decision.
3. Publish wake path and first action.

E) PROOFS:
1. `raw/standby_decision_eval.txt` -> consolidated trigger states and computed decision.
2. `raw/workspace_snapshot_metrics.txt` -> tracked/staged/nonproof drift all zero.
3. `raw/ci_latest_metrics.txt` -> CI baseline green (`23/23`, `0` non-success).

VERDICT_UNIQUE: `STANDBY_CONFIRMED`

BASELINE_REFERENCE: `757ae4d4c`

TRIGGER_STATUS:
- `EXPLICIT_NEW_SCOPE = FALSE`
- `PROVEN_DRIFT = FALSE`
- `CRITICAL_EXTERNAL_FAILURE_SIGNAL = FALSE`
- `workspace_drift_signal = FALSE`
- `CI_STATUS = GREEN_BASELINE`

TOP 3 PROOFS:
1. `raw/standby_decision_eval.txt`.
2. `raw/workspace_snapshot_metrics.txt`.
3. `raw/ci_latest_metrics.txt`.

NEXT_ALLOWED_WAKE_PATH:
- Stay in standby; wake only via `EXPLICIT_NEW_SCOPE`, `PROVEN_DRIFT`, or `CRITICAL_EXTERNAL_FAILURE`.

FIRST STEP IF_WOKEN <=30 min:
1. Create a dedicated wake-proof pack and capture the triggering evidence before any code/config mutation.

F) ROLLBACK:
- Decision file only; no runtime mutation.
