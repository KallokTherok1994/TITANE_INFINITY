# 05_IDLE_DECISION_RULES

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `idle decision matrix`

C) RISK: `P1`

D) PLAN (<=7):
1. Encode deterministic idle decisions.
2. Keep `NO_ACTION` as default.
3. Route only valid triggers to wake paths.

E) PROOFS:
- Current no-trigger state:
  - `raw/current_idle_signals.txt`
- Trigger/wake framework:
  - `03_ALLOWED_IDLE_ACTIONS.md`
  - `04_FORBIDDEN_IDLE_ACTIONS.md`

Default rule: `NO_ACTION`

| Observed situation | Decision | Wake allowed? | Prompt |
|---|---|---|---|
| No signal | Stay idle | No | None |
| Vague request | Stay idle | No | None |
| Intuition without proof | Stay idle | No | None |
| Non-relevant artifact | Stay idle | No | None |
| Explicit new scoped objective | Exit idle via wake path | Yes | `NEXT_CYCLE_ENTRY_GATE__SCOPE_OR_DRIFT_ONLY` |
| Proven measurable drift | Exit idle via wake path | Yes | `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c` |
| Critical external failure | Exit idle via wake path | Yes | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` |

F) ROLLBACK:
- Decision matrix document only.
