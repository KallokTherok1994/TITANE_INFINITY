# 04_FORBIDDEN_IDLE_ACTIONS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `idle prohibitions`

C) RISK: `P1`

D) PLAN (<=7):
1. List forbidden actions in idle.
2. Explain why each is forbidden.
3. Specify which trigger could make action receivable.
4. Specify the prompt to launch instead.

E) PROOFS:
- Trigger framework:
  - `raw/wake_trigger_threshold_reference.md`
  - `raw/wake_path_mapping_reference.md`
- Idle baseline no-signal state:
  - `raw/current_idle_signals.txt`

Forbidden idle actions:

| Forbidden action | Why forbidden in idle | Trigger that could make it receivable | Prompt to launch instead |
|---|---|---|---|
| Launch preventive fix | Creates unjustified activity without proof | `PROVEN_DRIFT` | `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c` |
| Rerun tests without signal | Violates `NO_ACTION` default and no-signal rule | `PROVEN_DRIFT` or `CRITICAL_EXTERNAL_FAILURE` | corresponding wake prompt by trigger |
| Open a cycle by curiosity | Non-governed activation | None until valid trigger exists | None, remain idle |
| Recheck doctrine without new contradiction | Reopens closed doctrine path without authority | `CRITICAL_EXTERNAL_FAILURE` (new high-authority contradiction only) | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` |
| Clean repository without drift | Comfort activity not evidence-driven | `PROVEN_DRIFT` | `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c` |
| Touch CI "for safety" | Mutates external surface absent failure | `CRITICAL_EXTERNAL_FAILURE` | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` |
| Expand standby into permanent audit | Converts final idle state into endless activity | None | None, remain idle |
| Modify sealed baseline docs without cause | Breaks canonical stability | `CRITICAL_EXTERNAL_FAILURE` with dated contradiction evidence | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` |

F) ROLLBACK:
- Prohibition matrix document only.
