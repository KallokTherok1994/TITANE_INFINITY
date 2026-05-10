# UI_DESKTOP_HIDDEN_CHILD_ROUTES_RECONCILIATION_v64

**Date**: 2026-05-10  
**Version**: 33.0.13  
**Branch**: MAIN

Source of truth: `src/App.tsx`, `src/hooks/useTopNavigation.ts`, `e2e/desktop/ui-desktop-all-routes.wdio.test.js`, existing functional specs.

---

## Hidden / Child Routes

These routes are not top-level nav items but are accessible via URL or redirect from parent routes (TITANE matchRoutes, DEV matchRoutes, etc.).

| Route | In App.tsx? | In Registry? | Root selector (expected) | WDIO coverage | Functional proof | Backend proof | Classification |
|---|---|---|---|---|---|---|---|
| /experience | ✅ (Route component: Experience) | ✅ (matchRoutes of TITANE) | `page-experience` | ✅ all-routes + functional | FUNCTIONAL_READ_ONLY_PROVEN | N/A (frontend only) | **COVERED** |
| /memory | ✅ (Route: Memory) | ✅ (matchRoutes of TITANE) | `page-memory` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | Tier 2 via IPC probe | **COVERED** |
| /research | ✅ (Route: ResearchPage) | ✅ (matchRoutes of TITANE) | `page-research` | ✅ all-routes + v61/v62/v63 IPC probes | IPC_RESPONSE_PROVEN (v63) | `research_get_status` PROVEN | **IPC_RESPONSE_PROVEN** |
| /skills | ✅ (Route: SkillManager) | ✅ (matchRoutes of TITANE) | `page-skills` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /knowledge | ✅ (Route: KnowledgeFusionPage) | ✅ (matchRoutes of TITANE) | `page-knowledge` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /creation | ✅ (Route: CreationStudio) | ✅ (matchRoutes of TITANE) | `page-creation` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /evolution | ✅ (Route: EvolutionMonitor) | ✅ (matchRoutes of TITANE) | `page-evolution` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /cloud | ✅ (Route component + CloudSyncState) | ✅ (matchRoutes of FUSION) | `page-cloud` | ✅ v61/v62/v63 IPC probes | IPC_RESPONSE_PROVEN (v63) | `cloud_get_status` PROVEN | **IPC_RESPONSE_PROVEN** |
| /reality-center | ✅ (Route component, SIMULATED) | ✅ (matchRoutes of FUSION) | `page-reality-center` | ✅ all-routes | SIMULATED_DISCLOSURE_CONFIRMED | N/A | **COVERED (SIMULATED)** |
| /hyper-center | ✅ (Route component, SIMULATED) | ✅ (matchRoutes of FUSION) | `page-hyper-center` | ✅ all-routes | SIMULATED_DISCLOSURE_CONFIRMED | N/A | **COVERED (SIMULATED)** |
| /quantum-center | ✅ (Route component, SIMULATED) | ✅ (all-routes spec, line 69) | `page-quantum-center` | ✅ all-routes | SIMULATED_UI (SIMULATED_DISCLOSURE) | N/A | **COVERED (SIMULATED)** |
| /orchestration-intelligence | ✅ (Route, matchRoutes of DEV) | ✅ (matchRoutes) | `page-orchestration-intelligence` | ✅ all-routes + functional-advanced | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /orchestration-center | ✅ (Route, matchRoutes of DEV) | ✅ | `page-orchestration-center` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /singularity | ✅ (Route: Singularity, matchRoutes of DEV) | ✅ | `page-singularity` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /sentinel | ✅ (Route: Sentinel, matchRoutes of DEV) | ✅ | `page-sentinel` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /watchdog | ✅ (Route: Watchdog, matchRoutes of DEV) | ✅ | `page-watchdog` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /selfheal | ✅ (Route: SelfHeal, matchRoutes of DEV) | ✅ | `page-selfheal` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /adaptive | ✅ (Route: AdaptiveEngine, matchRoutes of DEV) | ✅ | `page-adaptive` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /doc-center | ✅ (Route component) | ✅ | `page-doc-center` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /htf | ✅ (Route component) | ✅ | `page-htf` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |
| /performance | ✅ (Route: PerformanceTest) | ✅ (matchRoutes of OPTIMIZE) | `page-performance` | ✅ all-routes | FUNCTIONAL_DISPLAY_ONLY | N/A | **COVERED** |

---

## Summary

| Metric | Value |
|---|---|
| Total hidden routes verified | 21 |
| In App.tsx | 21/21 |
| In registry/matchRoutes | 21/21 |
| WDIO coverage | 21/21 (via all-routes + functional specs) |
| IPC_RESPONSE_PROVEN routes | 2 (/research + /cloud) |
| SIMULATED_DISCLOSURE routes | 3 (/reality-center, /hyper-center, /quantum-center) |
| DISPLAY_ONLY routes | 16 (honest, frontend-only) |
| Missing selectors | 0 (all have expected root testId pattern) |
| Blockers | 0 |

**Final verdict**: `HIDDEN_ROUTE_RECONCILIATION_CONFIRMED` — all 21 hidden/child routes are accounted for in App.tsx, registry, and WDIO specs.

---

## Notes

- `/research` and `/cloud` promoted from BLOCKED to `IPC_RESPONSE_PROVEN` in v63
- SIMULATED routes (`/reality-center`, `/hyper-center`, `/quantum-center`) have `SIMULATED_DISCLOSURE_CONFIRMED` banner applied (verified in `verify:ui-surface-registry` PASS)
- All DEV matchRoutes (`/orchestration-*`, `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive`) are accessible but classified as DISPLAY_ONLY — they are active pages with no Tier 1 IPC requirement
