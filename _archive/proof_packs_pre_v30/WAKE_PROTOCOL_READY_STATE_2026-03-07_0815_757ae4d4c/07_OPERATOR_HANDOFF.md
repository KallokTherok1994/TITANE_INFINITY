# 07_OPERATOR_HANDOFF

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `operator quick handoff`

C) RISK: `P1`

D) PLAN (<=7):
1. Publish short actionable handoff.
2. Keep trigger thresholds explicit.
3. Keep wake prompts deterministic.
4. Preserve standby by default.

E) PROOFS:
- Baseline and state:
  - `raw/check_active_baseline_standby_confirmed.txt`
  - `raw/check_canonical_baseline_757ae4d4c.txt`
  - `raw/current_standby_signals.txt`
- Trigger and mapping sources:
  - `03_TRIGGER_THRESHOLD_RULES.md`
  - `04_WAKE_PATH_MAPPING.md`
  - `06_WAKE_DECISION_MATRIX.md`

Operator handoff (short form):
- Active baseline: `STANDBY_CONFIRMED`
- Canonical reference: `757ae4d4c`
- State: `PASSIVE_STANDBY`
- Only authorized triggers: `EXPLICIT_NEW_SCOPE`, `PROVEN_DRIFT`, `CRITICAL_EXTERNAL_FAILURE`
- Minimal proof rule:
  - `EXPLICIT_NEW_SCOPE`: explicit request + new objective + bounded scope + no collision
  - `PROVEN_DRIFT`: measurable divergence + concrete artifact + real impact
  - `CRITICAL_EXTERNAL_FAILURE`: serious external failure + dated/localizable evidence
- Prompt per accepted trigger:
  - `EXPLICIT_NEW_SCOPE` -> `NEXT_CYCLE_ENTRY_GATE__SCOPE_OR_DRIFT_ONLY`
  - `PROVEN_DRIFT` -> `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c`
  - `CRITICAL_EXTERNAL_FAILURE` -> `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG`
- Never do:
  - no scope inflation, no doctrine reopen without new high-authority contradiction, no opportunistic cleanup
- First reflex in doubt:
  - classify signal as insufficient and remain idle until proof threshold is met.

F) ROLLBACK:
- Handoff file only.
