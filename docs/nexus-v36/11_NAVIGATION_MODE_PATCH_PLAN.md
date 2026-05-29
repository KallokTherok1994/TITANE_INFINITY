# GATE 11 — NAVIGATION MODE PATCH PLAN

**Date:** 2026-05-28
**Gate:** GATE_11
**Phase:** P2 — EXEC

---

## 1. Current Navigation Source of Truth

`src/hooks/useTopNavigation.ts` — `TOP_NAV_SECTIONS` (9 entries).
`maxVisibleItems=5` already set in `src/App.tsx`.

---

## 2. Intended Navigation Mode Model

Introduce mode constants and annotations without changing runtime behavior:

- **DAILY**: Routes visible in primary user flow
- **SYSTEM**: Admin/infrastructure routes — accessible, not primary
- **DEV**: Developer-only routes — explicitly gated
- **SIMULATED**: Badge-required routes — never in any nav

Gate 11 adds the constants and fixes the SIMULATED nav highlight bug.
Gate 11 does NOT restructure the nav order or implement the full NEXUS shell (Gate 12 scope).

---

## 3. Exact Files to Touch

| File | Change |
|------|--------|
| `src/lib/navigationMode.ts` | NEW — mode constants, route sets, helper functions |
| `src/hooks/useTopNavigation.ts` | MODIFY — remove SIMULATED from matchRoutes, add navMode annotation |
| `src/__tests__/ui/ui-navigation.test.ts` | MODIFY — update assertions for corrected SIMULATED behavior |

---

## 4. Forbidden Files

```
src/App.tsx (maxVisibleItems already correct — no change)
src/components/layout/TopNav.tsx
src-tauri/**
package.json
pnpm-lock.yaml
Cargo.toml / Cargo.lock
.github/workflows/**
All route files (no deletion, no rename)
```

---

## 5. Daily Target Entries

Primary visible (unchanged): TITANE, TIME, ADMIN, DEV, FUSION — already ≤5 via `maxVisibleItems=5`.
No structural change to Daily entries in Gate 11.

---

## 6. System Target Entries

14 KEEP_SYSTEM routes remain accessible via direct URL or `/admin`.
No change in Gate 11.

---

## 7. Dev Target Entries

`/dev` and `/total-dev` — annotated as DEV mode in navigationMode.ts.
No structural change in Gate 11.

---

## 8. Lab Target Entries

Lab mode is RESERVED in v36 per rule L-01. No Lab implementation in Gate 11.

---

## 9. Route Preservation Strategy

Zero route deletions. Zero route renames.
All 30 classified routes remain in `App.tsx` router unchanged.
Navigation mode constants are additive — new file only.

---

## 10. Alias Preservation Strategy

Zero alias deletions. The 65 aliases in `App.tsx` router are untouched.
`matchRoutes` in `useTopNavigation.ts` is trimmed to remove only SIMULATED routes;
all non-SIMULATED `matchRoutes` are preserved.

---

## 11. SIMULATED_UI Exclusion Strategy

Remove from `useTopNavigation.ts` matchRoutes:
- `/orchestration-intelligence` — removed from DEV matchRoutes
- `/quantum-center` — removed from FUSION matchRoutes

These routes remain routable via direct URL (`App.tsx` routes unchanged).
They simply stop highlighting any nav button when visited.

Update `src/__tests__/ui/ui-navigation.test.ts`:
- Remove `/orchestration-intelligence → nav-dev` expectation
- Remove `/quantum-center → nav-fusion` expectation
- These routes now produce no nav highlight (no `aria-current=page` on any nav item)

---

## 12. Tests to Run

```powershell
corepack pnpm run check
corepack pnpm run lint
corepack pnpm run verify:ui-surface-registry
corepack pnpm run verify:ui-desktop-coverage
corepack pnpm vitest run tests/unit/navigation/navigationMode.test.ts
```

---

## 13. Rollback Command

```powershell
Remove-Item -Force "src\lib\navigationMode.ts"
git restore -- "src/hooks/useTopNavigation.ts"
git restore -- "src/__tests__/ui/ui-navigation.test.ts"
git restore -- "scripts/titane-dev/guard-phase-lock.mjs"
```

---

## 14. Stoplines

- STOP if `corepack pnpm run check` fails
- STOP if `corepack pnpm run lint` fails
- STOP if any guard fails post-patch
- STOP if any route deletion is detected
- STOP if any alias deletion is detected
- STOP if scope requires touching src-tauri, package.json, or CI files
- Do NOT proceed to Gate 12 automatically
