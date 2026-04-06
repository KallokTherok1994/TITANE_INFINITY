# 04_IDLE_REENTRY_RULE

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `idle reentry rule`

C) RISK: `P1`

D) PLAN (<=7):
1. State explicit rule after trigger rejection.
2. Ban replay of same raw signal without new proof.
3. Reinstate `NO_ACTION` default.

E) PROOFS:
- Rejection authority:
  - `raw/prev_verdict.md`
  - `raw/prev_activation_decision.md`

Idle reentry rule:
1. A rejected trigger returns the system immediately to `GOVERNED_IDLE_CONFIRMED`.
2. The same raw signal cannot be replayed without new sufficient proof.
3. No additional activity is justified by a rejection.
4. Default behavior becomes `NO_ACTION` again.

F) ROLLBACK:
- Rule file only.
