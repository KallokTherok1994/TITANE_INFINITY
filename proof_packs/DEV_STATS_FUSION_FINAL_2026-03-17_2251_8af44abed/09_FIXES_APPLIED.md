# FIXES APPLIED

## FIX-1: src/App.tsx — Remove dead Stats lazy import
**Lines removed (pre-fix 119–121):**
```
// v29.1: kept for rollback — route redirected to /dev
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Stats = lazy(() => import('./pages/Stats').then(m => ({ default: m.Stats })));
```
**Rationale:** Import was declared unused (eslint-disable comment) — route already redirected to /dev. No type errors. Safe to remove.

## FIX-2: src/App.tsx — Remove STATS nav item from topNavSections
**Lines removed (pre-fix 888–893):**
```
{
  id: 'stats',
  label: 'STATS',
  route: '/dev',
  description: 'Métriques moteurs fusionnées dans DEV Cockpit > Diagnostics',
},
```
**Rationale:** DUPLICATE_NAV_AUTHORITY. Two TopNav buttons routing to same /dev surface. Removed vestigial STATS entry; DEV entry retained as canonical authority.

## FIX-3: e2e/desktop/page-objects/uiPages.po.js — Remove uiPages.stats from topLevelPageOrder
**Line removed (pre-fix line 90):** `uiPages.stats,`
**Rationale:** STALE_E2E_EXPECTATION. topLevelPageOrder drives nav smoke tests. nav-stats testid no longer exists in TopNav after FIX-2. uiPages.stats object definition kept in file as historical alias documentation.

## Defect classification
- FIX-1: STALE_IMPORT_PATH
- FIX-2: DUPLICATE_NAV_AUTHORITY
- FIX-3: STALE_E2E_EXPECTATION (coupled with FIX-2)

## Total diff
-10 lines across 2 files. No new lines added.

## AutoHeal
Entry appended: AH-2026-03-17-DEV-STATS-FUSION-FINAL (id unique, all required fields present)
