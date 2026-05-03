# 05_WAKE_CONDITIONS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `wake procedure mapping`

C) RISK: `P1`

D) PLAN (<=7):
1. Define proof threshold per allowed trigger.
2. Map each trigger to next prompt/action.
3. Define first mandatory step after wake.
4. Define still-forbidden actions after wake.

E) PROOFS:

Wake mapping:
1. Trigger: `EXPLICIT_NEW_SCOPE`
   - Sufficient proof: explicit bounded scope request.
   - Next prompt: `NEXT_CYCLE_ENTRY_GATE`.
   - First mandatory step: create new entry/scope pack before any mutation.
   - Still forbidden: opportunistic unrelated fixes.

2. Trigger: `PROVEN_DRIFT`
   - Sufficient proof: measurable baseline divergence (`tracked>0` or `untracked_nonproof>0` or contradiction evidence).
   - Next prompt: micro-cycle diagnostic/fix strictement borne.
   - First mandatory step: capture drift proof artifacts and impacted surface only.
   - Still forbidden: broad audits/build/E2E unless justified by affected surface.

3. Trigger: `CRITICAL_EXTERNAL_FAILURE`
   - Sufficient proof: CI non-success against canonical baseline.
   - Next prompt: targeted external failure diagnostic prompt.
   - First mandatory step: isolate failing workflow/job evidence.
   - Still forbidden: unrelated platform-wide remediation.

F) ROLLBACK:
- Wake procedure documentation only.
