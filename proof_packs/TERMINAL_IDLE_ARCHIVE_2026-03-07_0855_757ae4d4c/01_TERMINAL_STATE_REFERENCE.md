# 01_TERMINAL_STATE_REFERENCE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `terminal state verification`

C) RISK: `P1`

D) PLAN (<=7):
1. Confirm canonical baseline.
2. Confirm normal idle state.
3. Confirm wake readiness exists.
4. Confirm false wake rejected and closed.
5. Confirm dormant template registered.
6. Confirm no action is authorized now.

E) PROOFS:
- Baseline checks:
  - `raw/check_baseline_from_wake.txt`
  - `raw/check_baseline_from_idle.txt`
  - `raw/check_baseline_from_reentry.txt`
  - `raw/check_baseline_from_omega.txt`
- Chain state checks:
  - `raw/check_state_wake_protocol_ready.txt`
  - `raw/check_state_governed_idle_confirmed.txt`
  - `raw/check_state_return_to_idle_confirmed.txt`
  - `raw/check_state_omega_dormant_registered.txt`

Terminal state:
- Canon baseline: `757ae4d4c`
- Normal state: `GOVERNED_IDLE_CONFIRMED`
- Wake readiness: established
- False wake: rejected and closed
- Dormant template: registered
- Current authorization: no active action

TERMINAL_STATE = `VERIFIED`

F) ROLLBACK:
- Reference-only file.
