# 00_EXEC_SUMMARY

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `passive sentinel standby`

C) RISK: `P1`

D) PLAN (<=7):
1. Bootstrap sentinel pack and baseline references.
2. Confirm baseline stable truth.
3. Define allowed/forbidden wake triggers.
4. Capture minimal light snapshot.
5. Formalize wake conditions.
6. Emit single standby decision.

E) PROOFS:
- `raw/baseline_reference.txt`
- `raw/workspace_snapshot_metrics.txt`
- `raw/ci_latest_metrics.txt`
- `raw/entry_signal_current.txt`
- `raw/drift_check_metrics.txt`
- `raw/standby_decision_eval.txt`

F) ROLLBACK:
- No product/config/CI/runtime/tests mutation.
