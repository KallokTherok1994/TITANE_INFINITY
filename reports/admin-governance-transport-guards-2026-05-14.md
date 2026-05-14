# Admin Governance Transport Guards — 2026-05-14

## Summary

- Surface: `/admin?tab=governance`
- Symptom: repeated `NO_TRANSPORT` console errors during governance bootstrap
- Root cause: governance bootstrap reads still used `safeInvoke`, which logs before degraded responses are normalized
- Fix: route governance bootstrap reads through `safeInvokeCanonical`

## Files

- `src/features/governance-center/services/governanceService.ts`
- `src/features/governance-center/services/__tests__/governanceService.transportGuard.test.ts`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `registry/ui-events.jsonl`
- `scripts/autoheal/autoheal_rules.jsonl`

## Proof

### Command

```text
pnpm vitest run src/features/governance-center/services/__tests__/governanceService.transportGuard.test.ts
```

### Output

```text
✓  core  src/features/governance-center/services/__tests__/governanceService.transportGuard.test.ts (3 tests) 51ms
  ✓ governanceService transport guards (3)
    ✓ reads provider statuses through safeInvokeCanonical when no transport exists 43ms
    ✓ routes governance bootstrap reads through safeInvokeCanonical when no transport exists 4ms
    ✓ normalizes canonical secrets-status envelopes without calling safeInvoke 1ms

Test Files  1 passed (1)
Tests  3 passed (3)
```

### Command

```text
pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture admin-governance' --reporter=line
```

### Output

```text
Running 1 test using 1 worker
  1 passed (11.9s)
```

## Outcome

The governance bootstrap now preserves the degraded browser truth without emitting the previous `NO_TRANSPORT` console errors on the active admin governance surface.