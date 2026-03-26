# 06_BASELINE_PRESERVATION_NOTES

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `durable baseline memory`

C) RISK: `P1`

D) PLAN (<=7):
1. Record canonical commit reference.
2. Record complementary active verdict chain.
3. Record minimal documentary chain to keep in mind.
4. Clarify semantics between standby, wake-ready, and idle-confirmed.

E) PROOFS:
- Canonical baseline:
  - `raw/check_wake_baseline_757ae4d4c.txt`
  - `raw/check_sentinel_baseline_757ae4d4c.txt`
- Active verdict references:
  - `raw/sentinel_verdict_reference.md`
  - `raw/wake_verdict_reference.md`

Preservation notes:
1. Canonical commit reference remains `757ae4d4c`.
2. Complementary active verdicts:
   - `STANDBY_CONFIRMED` (state legitimacy)
   - `WAKE_PROTOCOL_READY` (wake governance readiness)
3. Minimal documentary chain:
   - sentinel standby pack -> wake protocol pack -> governed idle charter pack.
4. `WAKE_PROTOCOL_READY` does not replace `STANDBY_CONFIRMED`.
5. Idle is not lack of governance; idle is governed final state while no authorized trigger reaches proof threshold.

F) ROLLBACK:
- Notes document only.
