# GATE 11 — NAVIGATION DISCOVERY

**Date:** 2026-05-28
**Gate:** GATE_11
**Phase:** P2 — EXEC + STABILIZE + PROOF

---

## Current Navigation Files

| File | Role |
|------|------|
| `src/hooks/useTopNavigation.ts` | **Source of truth** — defines `TOP_NAV_SECTIONS` and `createTopNavItems` |
| `src/components/layout/TopNav.tsx` | TopNav component; accepts `items`, `maxVisibleItems` |
| `src/App.tsx` | Calls `useTopNavigation()`, renders `<TopNav maxVisibleItems={isMobile ? 3 : 5}>` |
| `src/__tests__/ui/ui-navigation.test.ts` | Anti-regression tests for nav behavior |

---

## Current Navigation Source of Truth

`src/hooks/useTopNavigation.ts` — `TOP_NAV_SECTIONS` array (9 entries):

| # | id | label | route | navMode |
|---|----|-------|-------|---------|
| 1 | titane | TITANE | /titane | DAILY |
| 2 | time | TIME | /time | DAILY |
| 3 | admin | ADMIN | /admin | SYSTEM |
| 4 | dev | DEV | /dev | DEV |
| 5 | fusion | FUSION | /fusion | SYSTEM |
| 6 | projects | PROJECTS | /multiproject | DAILY |
| 7 | twins | TWINS | /twins | DAILY |
| 8 | optimization | OPTIMIZE | /optimization | SYSTEM |
| 9 | total-dev | TOTAL DEV | /total-dev | DEV |

**maxVisibleItems=5** is already set in App.tsx. Desktop shows sections 1–5 (TITANE, TIME, ADMIN, DEV, FUSION). Sections 6–9 go into the "Plus" overflow menu.

---

## Current Daily Entries

Primary visible (1–5): TITANE, TIME, ADMIN, DEV, FUSION.
Daily visible requirement (≤5): **ALREADY MET** by existing `maxVisibleItems=5`.

However, ADMIN is a SYSTEM route and DEV is a DEV route — they appear in primary nav without mode-gating. Gate 11 introduces mode constants and annotations but does NOT restructure the nav order (that is Gate 12 scope — NEXUS Surface Migration).

---

## Current System Entries

Accessible via direct URL or `/admin`: 14 KEEP_SYSTEM routes. None appear as explicit primary nav items except `/admin` (the gateway).

---

## Current Dev/Lab Entries

| Route | Nav Status |
|-------|-----------|
| `/dev` | Visible primary nav (position 4) |
| `/total-dev` | In "Plus" overflow menu (position 9) |

`/total-dev` is ALLOWED_DEV_SURFACE with qwen3.5:9b IPC — should not be accessible in Daily mode nav per rule DV-02.

---

## SIMULATED_UI Status (CRITICAL FINDING)

**Problem found**: SIMULATED routes appear in nav `matchRoutes`, causing those nav items to highlight when user navigates to a SIMULATED page.

| SIMULATED Route | Incorrectly in matchRoutes of | Effect |
|----------------|-------------------------------|--------|
| `/orchestration-intelligence` | DEV section | DEV nav button highlights on SIMULATED page |
| `/quantum-center` | FUSION section | FUSION nav button highlights on SIMULATED page |

This violates SIM-03: "SIMULATED routes must not be registered in Daily, System, or Dev primary nav."

---

## Candidate Files to Touch

| File | Change Type | Risk |
|------|-------------|------|
| `src/lib/navigationMode.ts` | NEW | LOW — pure constants, no runtime side effects |
| `src/hooks/useTopNavigation.ts` | MODIFY | LOW — remove SIMULATED routes from matchRoutes, add navMode annotation |
| `src/__tests__/ui/ui-navigation.test.ts` | MODIFY | LOW — update test assertions to reflect corrected SIMULATED behavior |

---

## Files Explicitly NOT to Touch

```
src/App.tsx — maxVisibleItems already correct; no change needed
src/components/layout/TopNav.tsx — no change needed
src-tauri/** — forbidden
package.json / pnpm-lock.yaml — forbidden
.github/workflows/** — forbidden
All routes — no deletion, no rename
All aliases — preserved
```

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Breaking existing nav test | LOW | Update test assertions in same patch |
| SIMULATED route loses nav highlight | EXPECTED | This is correct behavior per SIM-03 |
| /total-dev visibility | LOW | Remains in "Plus" menu; navMode annotation only in Gate 11 |
| Behavioral regression | LOW | maxVisibleItems unchanged; routes unchanged |
