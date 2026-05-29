# GATE 12 — SURFACE MIGRATION PLAN

**Date:** 2026-05-29
**Gate:** GATE_12
**Phase:** P2 — EXEC

---

## 1. Source Matrix Summary

Source: `docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json`
- 30 classified routes
- KEEP_DAILY: 11 | KEEP_SYSTEM: 14 | KEEP_DEV: 2 | KEEP_DISPLAY_ONLY: 1 | KEEP_SIMULATED: 2

---

## 2. Migration Tranches

| Tranche | Scope | Risk |
|---------|-------|------|
| A | `src/lib/routeIndex.ts` (NEW) + `src/components/NexusShell/` (NEW) | LOW |
| B | Update `PALETTE_ROUTES` — add DAILY secondary routes (8 missing) | LOW |
| C | Update `PALETTE_ROUTES` — add SYSTEM/cloud/docs routes | LOW |
| D | Update `PALETTE_ROUTES` — add SYSTEM/monitoring routes | LOW |
| E | Update `PALETTE_ROUTES` — add DEV + DISPLAY_ONLY routes | LOW |
| F | Update `PALETTE_ROUTES` — add SIMULATED routes (annotated) | LOW |

Note: Tranches B-F all modify `src/components/palette/commands/routes.ts` and are executed together in a single batch after Tranche A passes.

---

## 3. Selected Gate 12 Scope

Gate 12 executes Tranches A through F as defined above.

**What is DEFERRED (out of Gate 12 scope):**
- `src/App.tsx` modification (P36-07 — MEDIUM risk; needs full certifier run; deferred to Gate 13)
- `src/components/TruthBadge/TruthBadge.tsx` (P36-05 — no callers until App.tsx is wrapped)
- `src/components/EmptyStateTruth/EmptyStateTruth.tsx` (P36-06 — no callers until App.tsx is wrapped)
- `src/index.css` CSS variables (P36-08 — only needed when TruthBadge component renders)

---

## 4. Exact Files Expected to Touch

| File | Type | Tranche |
|------|------|---------|
| `src/lib/routeIndex.ts` | NEW | A |
| `src/components/NexusShell/NexusShell.tsx` | NEW | A |
| `src/components/NexusShell/useNexusMode.ts` | NEW | A |
| `src/components/palette/commands/routes.ts` | MODIFY | B–F |

---

## 5. Files Explicitly Not to Touch

```
src/App.tsx — deferred (MEDIUM risk, certifier required)
src/index.css — deferred (TruthBadge not yet wired)
src/components/layout/TopNav.tsx
src-tauri/**
package.json / pnpm-lock.yaml
Cargo.toml / Cargo.lock
.github/workflows/**
All route files (no deletion, no rename)
All existing page components
```

---

## 6. Route Preservation Strategy

Zero route deletions. Zero route renames.
All 30 routes remain in `src/App.tsx` router — untouched.
`routeIndex.ts` is purely additive data; it does not affect routing.

---

## 7. Alias Preservation Strategy

Zero alias deletions.
`PALETTE_ROUTES` entries are new nav commands pointing to canonical routes only (not aliases).
All 65 aliases in `App.tsx` remain untouched.

---

## 8. SIMULATED_UI Lab-Only Strategy

SIMULATED routes (`/orchestration-intelligence`, `/quantum-center`) are added to `PALETTE_ROUTES` with explicit `decision: 'KEEP_SIMULATED'` annotation so the palette can distinguish them. They remain accessible via direct URL and are not in Daily nav (established in Gate 11).

---

## 9. Truth Badge Strategy

`routeIndex.ts` encodes `truthClass` for all 30 routes. This data will be consumed by the TruthBadge component when it is wired in Gate 13 (App.tsx wrap). Gate 12 creates the data layer — Gate 13 wires the visual layer.

---

## 10. Tests to Run

```powershell
corepack pnpm run check
corepack pnpm run lint
corepack pnpm run verify:ui-surface-registry
corepack pnpm run verify:ui-desktop-coverage
corepack pnpm vitest run tests/unit/navigation/routeIndex.test.ts
```

---

## 11. Rollback by Tranche

**Tranche A rollback:**
```powershell
Remove-Item -Force "src\lib\routeIndex.ts"
Remove-Item -Recurse -Force "src\components\NexusShell\"
```

**Tranches B-F rollback:**
```powershell
git restore -- "src/components/palette/commands/routes.ts"
```

**Full Gate 12 rollback:**
```powershell
Remove-Item -Force "src\lib\routeIndex.ts"
Remove-Item -Recurse -Force "src\components\NexusShell\"
git restore -- "src/components/palette/commands/routes.ts"
```

---

## 12. Stoplines

- STOP if any tranche requires route deletion or rename
- STOP if `corepack pnpm run check` fails
- STOP if `corepack pnpm run lint` fails
- STOP if any guard fails post-patch
- STOP if scope expands to App.tsx (defer to Gate 13)
- STOP if scope expands to src-tauri
- Do NOT proceed to Gate 13 automatically
