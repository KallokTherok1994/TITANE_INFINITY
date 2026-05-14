# Titane Transformation CSP Google Fonts Guard — 2026-05-14

## Summary

- Surface: `/titane?tab=transformation`
- Symptom: repeated CSP console errors for a blocked Google Fonts stylesheet
- Root cause: a runtime dependency injected `https://fonts.googleapis.com/...` outside the direct control of the transformation page
- Fix: install a bootstrap DOM guard that removes and blocks Google Fonts stylesheets before insertion, while keeping local/system fonts and the existing CSP unchanged

## Files

- `src/utils/googleFontStylesheetGuard.ts`
- `src/main.tsx`
- `src/__tests__/utils/googleFontStylesheetGuard.test.ts`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `registry/ui-events.jsonl`
- `scripts/autoheal/autoheal_rules.jsonl`

## Proof

### Command

```text
pnpm vitest run src/__tests__/utils/googleFontStylesheetGuard.test.ts
```

### Output

```text
✓  core  src/__tests__/utils/googleFontStylesheetGuard.test.ts (3 tests) 38ms
Test Files  1 passed (1)
Tests  3 passed (3)
```

### Command

```text
pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture titane-transformation' --reporter=line
```

### Output

```text
Running 1 test using 1 worker
  1 passed (11.7s)
```

## Outcome

The transformation tab no longer emits the Google Fonts CSP violation in the targeted browser capture. The app keeps its current CSP strictness and stays on local/system fonts even when a dependency attempts to inject an external stylesheet.