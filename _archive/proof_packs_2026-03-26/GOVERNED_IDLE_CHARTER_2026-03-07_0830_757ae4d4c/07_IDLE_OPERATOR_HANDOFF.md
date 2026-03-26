# 07_IDLE_OPERATOR_HANDOFF

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `quick operator guide`

C) RISK: `P1`

D) PLAN (<=7):
1. Provide short actionable operator summary.
2. Keep current-state and trigger criteria explicit.
3. Keep next-step deterministic in case of wake.

E) PROOFS:
- Current state:
  - `raw/current_idle_signals.txt`
- Wake mapping:
  - `raw/wake_path_mapping_reference.md`
- Baseline compatibility:
  - `raw/check_wake_protocol_ready.txt`
  - `raw/check_standby_confirmed_compatible.txt`

Operator handoff:
- Current state: `PASSIVE_STANDBY`, baseline `757ae4d4c`, wake status `READY`.
- What to do now: do nothing technical; keep governed idle.
- What not to do: no fix/build/test/CI touch/audit unless authorized trigger meets threshold.
- How to recognize real wake:
  - explicit new scoped request, or
  - measurable proven drift, or
  - critical external failure with dated/localizable evidence.
- Prompt to use if wake is legitimate:
  - `EXPLICIT_NEW_SCOPE` -> `NEXT_CYCLE_ENTRY_GATE__SCOPE_OR_DRIFT_ONLY`
  - `PROVEN_DRIFT` -> `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c`
  - `CRITICAL_EXTERNAL_FAILURE` -> `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG`

F) ROLLBACK:
- Handoff document only.
