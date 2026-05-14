# TimePage Snapshot Fallback Normalization — 2026-05-14

## Summary

- Surface: `/time?tab=snapshots`
- Symptom: `TypeError: response.map is not a function`
- Root cause: `TimePage` assumed `tauriClient.listSnapshots()` always returned a raw array.
- Fix: normalize `listSnapshots()` responses before `map`, accepting raw arrays, `content`, and `snapshots`, then fallback to `[]`.

## Files

- `src/pages/TimePage.tsx`
- `src/__tests__/pages/TimePage.test.tsx`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `registry/ui-events.jsonl`
- `scripts/autoheal/autoheal_rules.jsonl`

## Proof

### Command

```text
pnpm vitest run src/__tests__/pages/TimePage.test.tsx
```

### Output

```text
✓  core  src/__tests__/pages/TimePage.test.tsx (11 tests) 283ms
  ✓ TimePage (11)
    ✓ renders synced agenda events instead of placeholder-only content 58ms
    ✓ shows current synchronized segment and energy in Maintenant 22ms
    ✓ persists the cognitive state through the flow toggle 33ms
    ✓ publishes a TIME runtime context for chat and reasoning synchronization 15ms
    ✓ normalizes persisted TIME datetime to minute precision for chat context stability 16ms
    ✓ normalizes snake_case snapshot/stat payloads from backend truth 13ms
    ✓ creates snapshots through titanForceSnapshotCurrent 9ms
    ✓ keeps every TIME tab visible through its canonical UI surface 79ms
    ✓ shows LIVE badge when listSnapshots resolves successfully 9ms
    ✓ shows DEGRADED badge when listSnapshots rejects 11ms
    ✓ keeps the snapshots tab renderable when listSnapshots returns a non-array fallback payload 15ms

Test Files  1 passed (1)
Tests  11 passed (11)
```

### Command

```text
pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture time' --reporter=line
```

### Output

```text
Running 1 test using 1 worker
  1 passed (10.2s)
```

## Outcome

The `/time` snapshots surface remains renderable in browser fallback mode and no longer throws `response.map is not a function` during the targeted Playwright capture.