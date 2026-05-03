# 09 UI Fail Classification

Dominant failure found and fixed:

- Category: `FAIL_INTERACTABILITY`
- Scope: root zoom interaction on the canonical shell
- Evidence:
  - static inspection of `useWindowControls.ts` and `useZoomControl.ts`
  - targeted hook tests reproducing the mixed-unit behavior boundary

Non-critical observations retained as qualified notes:

- `UI_MINOR_NON_BLOCKING`: one early probe run (`run1`) crashed during initial reload, but three retained reruns (`run2`/`run3`/`run4`) passed cleanly.
- `UI_MINOR_NON_BLOCKING`: root `htmlOverflowX` continued to report `auto` under WRY computed style semantics; an exploratory source change did not alter runtime and was reverted, so no product change is kept against this observation.

Remaining critical `FAIL_*` categories:

- None.
