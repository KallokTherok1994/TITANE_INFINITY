# 01_BASELINE_AND_USAGE_LOCK

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `baseline lock and dormant constraints`

C) RISK: `P1`

D) PLAN (<=7):
1. Lock canonical baseline reference.
2. Lock complementary reference states.
3. Lock usage condition: future real signal only.
4. State explicit no-execution-now rule.

E) PROOFS:
- Baseline:
  - `raw/check_baseline_757ae4d4c.txt`
- Complementary states:
  - `raw/check_state_standby_confirmed.txt`
  - `raw/check_state_wake_protocol_ready.txt`
  - `raw/check_state_governed_idle_confirmed.txt`
  - `raw/check_state_return_to_idle_confirmed.txt`
- Dormant intent:
  - `raw/dormant_intent_capture.txt`

Locked references:
- Canonical baseline: `757ae4d4c`
- Reference states:
  - `STANDBY_CONFIRMED`
  - `WAKE_PROTOCOL_READY`
  - `GOVERNED_IDLE_CONFIRMED`
  - `RETURN_TO_GOVERNED_IDLE_CONFIRMED`

Usage lock:
- Do not execute now.
- Use only when a real, new, dated, and evidenced signal appears.

F) ROLLBACK:
- Lock declaration only.
