# 02_BASELINE_STANDBY_REFERENCE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `standby truth confirmation`

C) RISK: `P1`

D) PLAN (<=7):
1. Confirm canonical baseline and head alignment.
2. Confirm workspace no-drift conditions.
3. Confirm CI green baseline.
4. Confirm no entry signal and no proven drift.

E) PROOFS:
- Baseline canonical/stable:
  - `raw/baseline_reference.txt`
  - `raw/monitor_VERDICT.md` (`BASELINE_STABLE`)
- HEAD alignment:
  - `raw/git_rev_parse_short.txt` -> `757ae4d4c`
  - `raw/drift_check_metrics.txt` -> `PROVEN_DRIFT=FALSE`
- Workspace drift status:
  - `raw/workspace_snapshot_metrics.txt` -> tracked/staged/nonproof all `0`
- CI status:
  - `raw/ci_latest_metrics.txt` -> `CI_STATUS=GREEN_BASELINE`
- Entry signal status:
  - `raw/entry_signal_current.txt` -> `EXPLICIT_NEW_SCOPE=FALSE`

STANDBY_REFERENCE = `VERIFIED`

F) ROLLBACK:
- Reference confirmation only.
