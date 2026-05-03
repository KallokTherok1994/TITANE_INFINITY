# 03_ALLOWED_IDLE_ACTIONS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `passive actions during standby`

C) RISK: `P1`

D) PLAN (<=7):
1. Enumerate passive actions allowed in idle.
2. Bound each action clearly.
3. State what each action does not authorize.

E) PROOFS:
- Idle baseline source:
  - `02_IDLE_BASELINE_REFERENCE.md`
  - `raw/current_idle_signals.txt`
- Wake protocol source:
  - `raw/wake_path_mapping_reference.md`
  - `raw/wake_trigger_threshold_reference.md`

Allowed idle actions:

| Allowed action | Purpose | Boundary | Does NOT authorize |
|---|---|---|---|
| Consult canonical baseline `757ae4d4c` | Keep reference truth visible | Read-only context check | Any cycle reopening |
| Consult reference proof packs | Preserve governance memory | Read-only on sealed packs | Editing product/CI/runtime/tests |
| Re-read wake charter rules | Keep wake criteria deterministic | Documentation-only | Trigger activation by interpretation alone |
| Check whether an explicit new signal appeared | Detect legitimate wake candidate | Lightweight signal observation only | Running heavy validations or tests |
| Draft a future request text | Prepare future scope statement | Textual intention only | Executing technical work |
| Document intent without action | Preserve intent trace | No command that changes system state | Any fix/build/deploy/run |

F) ROLLBACK:
- Policy document only.
