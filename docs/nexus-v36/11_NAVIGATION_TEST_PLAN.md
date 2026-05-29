# GATE 11 — NAVIGATION TEST PLAN

**Date:** 2026-05-28
**Gate:** GATE_11

---

## Tests Created

| File | Tests | Scope |
|------|-------|-------|
| `tests/unit/navigation/navigationMode.test.ts` | 14 | navigationMode constants |

### Test Blocks

1. `navigationMode — SIMULATED_UI exclusion (SIM-03)` (5 tests)
   - SIMULATED routes not in DAILY_ROUTES
   - SIMULATED routes not in SYSTEM_ROUTES
   - SIMULATED routes not in DEV_ROUTES
   - `/orchestration-intelligence` classified SIMULATED
   - `/quantum-center` classified SIMULATED

2. `navigationMode — Daily route count (Gate 7 matrix: 11 routes)` (2 tests)
   - DAILY_ROUTES has exactly 11 routes
   - All expected primary surfaces present

3. `navigationMode — DEV route isolation (DV-02)` (2 tests)
   - `/total-dev` classified DEV, not DAILY
   - `/dev` classified DEV

4. `navigationMode — Daily route helper` (3 tests)
   - Primary Daily surfaces return DAILY mode
   - Query strings stripped before classification
   - Unknown routes return null

5. `navigationMode — System route count (Gate 7 matrix: 14 routes)` (2 tests)
   - SYSTEM_ROUTES has exactly 14 routes
   - `/admin` classified SYSTEM

---

## Tests Updated

| File | Change |
|------|--------|
| `src/__tests__/ui/ui-navigation.test.ts` | Removed SIMULATED routes from test items + routeExpectations |

**Corrected behavior:** SIMULATED routes (`/orchestration-intelligence`, `/quantum-center`) no longer highlight any nav item when visited. This is correct per SIM-03.

---

## Test Commands

```powershell
# Targeted navigation mode test
corepack pnpm vitest run tests/unit/navigation/navigationMode.test.ts

# Updated existing nav anti-regression tests
corepack pnpm vitest run src/__tests__/ui/ui-navigation.test.ts

# Full suite (optional)
corepack pnpm run check
corepack pnpm run lint
corepack pnpm run verify:ui-surface-registry
corepack pnpm run verify:ui-desktop-coverage
```

---

## Results

```
navigationMode.test.ts: 14/14 PASS
ui-navigation.test.ts:  20/20 PASS
```
