# 03_NO_FURTHER_AUTORUN_RULE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `terminal no-recursion rule`

C) RISK: `P1`

D) PLAN (<=7):
1. Define terminal no-autorun rule.
2. Define sole legitimate exception.
3. Define default behavior.

E) PROOFS:
- Terminal state and completeness:
  - `01_TERMINAL_STATE_REFERENCE.md`
  - `02_CHAIN_COMPLETENESS.md`
- Dormant master existence:
  - `raw/check_state_omega_dormant_registered.txt`

No-further-autorun rule:
1. No new execution prompt must be generated from this state.
2. The only legitimate exception is a future real signal that is new, dated, and proven.
3. In that case, use the existing dormant master template.
4. Otherwise: do nothing.

F) ROLLBACK:
- Rule file only.
