# 04_WAKE_PATH_MAPPING

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `trigger to prompt mapping`

C) RISK: `P1`

D) PLAN (<=7):

1. Bind each allowed trigger to one wake prompt.
2. Define first mandatory action for each path.
3. Define max authorized scope per path.
4. State remaining prohibitions per path.

E) PROOFS:

- Allowed triggers:
  - `raw/authorized_wake_paths_validated.txt`
- Sentinel wake policy reference:
  - `raw/sentinel_decision_reference.md`

Wake path mapping:

1. Trigger: `EXPLICIT_NEW_SCOPE`

- Prompt to launch: `NEXT_CYCLE_ENTRY_GATE__SCOPE_OR_DRIFT_ONLY`
- First mandatory action: create a dedicated entry gate proof pack for the new scope before any mutation.
- Max authorized scope: only the explicitly requested bounded objective.
- Still forbidden: broad audits, unrelated fixes, doctrine reopening.

2. Trigger: `PROVEN_DRIFT`

- Prompt to launch: `MICRO_CYCLE_DIAG__PROVEN_DRIFT_AGAINST_757ae4d4c`
- First mandatory action: capture drift evidence artifacts and impacted perimeter first.
- Max authorized scope: strictly the impacted surface evidenced by drift.
- Still forbidden: global refactor, multi-workstream patching, opportunistic cleanup.

3. Trigger: `CRITICAL_EXTERNAL_FAILURE`

- Prompt to launch: `CRITICAL_EXTERNAL_FAILURE__TARGETED_CONTAINMENT_DIAG`
- First mandatory action: isolate failing external signal with dated/localizable proof.
- Max authorized scope: only external failure surface and immediate containment.
- Still forbidden: full-platform re-audit without causality proof.

F) ROLLBACK:

- Mapping document only.
