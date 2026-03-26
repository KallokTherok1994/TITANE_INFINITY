# 02_BASELINE_REFERENCE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `baseline and state compatibility`

C) RISK: `P1`

D) PLAN (<=7):
1. Confirm canonical baseline reference.
2. Confirm `STANDBY_CONFIRMED` remains valid.
3. Confirm `WAKE_PROTOCOL_READY` remains valid.
4. Confirm `GOVERNED_IDLE_CONFIRMED` remains valid.
5. Confirm normal state is governed inactivity.

E) PROOFS:
- Canon baseline:
  - `raw/check_baseline_757ae4d4c_from_wake.txt`
  - `raw/check_baseline_757ae4d4c_from_sentinel.txt`
  - `raw/check_baseline_757ae4d4c_from_idle.txt`
- Active complementary states:
  - `raw/check_state_standby_confirmed.txt`
  - `raw/check_state_wake_protocol_ready.txt`
  - `raw/check_state_governed_idle_confirmed.txt`

Baseline reference status:
- Canon baseline: `757ae4d4c`
- Complementary active states: `STANDBY_CONFIRMED`, `WAKE_PROTOCOL_READY`, `GOVERNED_IDLE_CONFIRMED`
- Operational default: governed idle (no activation by inertia)

F) ROLLBACK:
- Reference-only file.
