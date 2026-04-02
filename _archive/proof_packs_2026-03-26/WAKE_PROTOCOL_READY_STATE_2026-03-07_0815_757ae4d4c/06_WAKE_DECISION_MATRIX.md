# 06_WAKE_DECISION_MATRIX

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `operational wake decision`

C) RISK: `P1`

D) PLAN (<=7):
1. Build one matrix for fast operator decision.
2. Encode admissibility and wake authorization.
3. Link each accepted case to one prompt and first action.
4. Preserve explicit stopline per case.

E) PROOFS:
- Trigger policy inputs:
  - `03_TRIGGER_THRESHOLD_RULES.md`
  - `04_WAKE_PATH_MAPPING.md`
  - `05_FORBIDDEN_ACTIONS_DURING_WAKE.md`
- Current no-signal baseline:
  - `raw/current_standby_signals.txt`

| Signal observed | Class | Sufficient proof? | Wake authorized? | Prompt to launch | First action | Main stopline |
|---|---|---|---|---|---|---|
| No entry signal | None | No | No | None | Stay idle in `PASSIVE_STANDBY` | No pre-wake action |
| Vague request | Weak signal | No | No | None | Request explicit bounded scope evidence | No cycle reopening on ambiguity |
| True new scoped request | `EXPLICIT_NEW_SCOPE` | Yes | Yes | `NEXT_CYCLE_ENTRY_GATE__SCOPE_OR_DRIFT_ONLY` | Open entry-gate proof pack first | No unrelated scope expansion |
| Tracked measurable drift vs baseline | `PROVEN_DRIFT` | Yes | Yes | `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c` | Capture drift artifacts before edits | No global refactor from local drift |
| Real CI red external contradiction | `CRITICAL_EXTERNAL_FAILURE` | Yes | Yes | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` | Isolate failing workflow and evidence | No full-platform audit without causality |
| New doctrinal contradiction from higher authority | `CRITICAL_EXTERNAL_FAILURE` | Yes | Yes | `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG` | Capture contradiction source and impact boundary | No doctrine rewrite by intuition |
| Non-relevant artifact | Noise | No | No | None | Ignore and keep standby | No trigger inflation |
| Unproven intuition | Weak signal | No | No | None | Require measurable proof | No action on intuition alone |

F) ROLLBACK:
- Matrix file only.
