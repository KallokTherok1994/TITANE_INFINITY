# UI_DESKTOP_ROOT_CONTRACT_REPAIR_CERTIFICATION_v52

**Mission**: TITANE UI_DESKTOP_ROOT_CONTRACT_REPAIR_v52  
**Verdict**: `UI_DESKTOP_ROOT_CONTRACT_100_CONFIRMED`  
**Date**: 2026-05-10  
**AutoHeal ID**: `AH-UI-DESKTOP-ROOT-CONTRACT-v52-2026`

---

## Root Cause Identified

### Primary: Hash-Based Navigation vs BrowserRouter

The WDIO navigation used:
```
browser.url('tauri://localhost/#/route')
```

But the app uses `BrowserRouter` (not HashRouter). BrowserRouter routes by **pathname**, ignoring the hash fragment. When the WebView loaded `tauri://localhost/#/sentinel`, BrowserRouter saw `pathname = "/"` and redirected to `/titane` (the home page). The `[data-testid="page-sentinel"]` element was never present.

**Result**: 26/29 routes classified `NOT_FOUND_UNEXPECTED` despite all data-testid selectors being present in the binary frontend bundle.

### Secondary: /htf rootTestId Registry Mismatch

- Registry declared: `rootTestId: 'page-htf'`
- Actual `HTFPage.tsx` data-testid: `'htf-module-page'`

---

## Fixes Applied

### 1. Navigation Fix — path-based URL

**File**: `e2e/desktop/ui-desktop-all-routes.wdio.test.js`

```diff
- const hash = route.startsWith('/') ? route.slice(1) : route;
- await browser.url(`tauri://localhost/#/${hash}`);
+ // v52 fix: use path-based navigation (BrowserRouter requires real pathnames)
+ await browser.url(`tauri://localhost${route}`);
```

Tauri serves `index.html` (SPA fallback) for all paths under `tauri://localhost`. BrowserRouter then sees the correct pathname and renders the target page.

### 2. Strict Contract Enforcement

**File**: `e2e/desktop/ui-desktop-all-routes.wdio.test.js`

```diff
- // NOT_FOUND_UNEXPECTED accepted as known limitation
- expect(['LIVE_LOADED', 'DEGRADED_CLASSIFIED', 'DISPLAY_ONLY_LOADED', 'NOT_FOUND_UNEXPECTED'])
+ // v52: root data-testid MUST be found — NOT_FOUND_UNEXPECTED is a contract violation
+ expect(['LIVE_LOADED', 'DEGRADED_CLASSIFIED', 'DISPLAY_ONLY_LOADED'])
    .toContain(classification.classification);
```

### 3. /htf rootTestId Alignment

**File**: `src/registry/uiSurfaceRegistry.ts`

```diff
- rootTestId: 'page-htf',
+ rootTestId: 'htf-module-page', // v52 fix: aligns with actual data-testid in HTFPage.tsx
```

**File**: `docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json`

Updated `/htf` entry: `rootTestId: "htf-module-page"`, `selectors.root: "[data-testid=\"htf-module-page\"]"`

---

## Proof

### All-Routes Spec Run (2026-05-10 05:42–05:43)

```
[0-0] [v50:routes] 29/29 routes loaded | simulated=0 degraded=0 err=0 notFound=0
Spec Files: 1 passed, 1 total (100% completed) in 00:01:00
```

**Exit code: 0**

All 29 routes LIVE_LOADED or SIMULATED:

| Route | Component | truthClass |
|-------|-----------|------------|
| /titane | TitanePage | MIXED_LIVE_AND_STATIC |
| /experience | Experience | MIXED_LIVE_AND_STATIC |
| /time | TimePage | MIXED_LIVE_AND_STATIC |
| /admin | AdminPage | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI |
| /dev | DevPage | LIVE_TAURI_WITH_FALLBACK |
| /fusion | PerfectFusionDashboard | LIVE_TAURI_WITH_FALLBACK |
| /optimization | UltimateOptimizationDashboard | MIXED_LIVE_AND_STATIC |
| /total-dev | TotalDevPage | LIVE_TAURI_WITH_FALLBACK |
| /orchestration-intelligence | OrchestrationIntelligenceCenter | SIMULATED_UI ✓ |
| /orchestration-center | OrchestrationMetaCenter | LIVE_TAURI_WITH_FALLBACK |
| /reality-center | RealityCenter | LIVE_TAURI_WITH_FALLBACK |
| /hyper-center | HyperCenter | LIVE_TAURI_WITH_FALLBACK |
| /quantum-center | QuantumCenter | SIMULATED_UI ✓ |
| /twins | TwinsPage | MIXED_LIVE_AND_STATIC |
| /cloud | CloudCenter | LIVE_TAURI |
| /memory | Memory | LIVE_TAURI_SERVICE_BRIDGE |
| /research | ResearchPage | LIVE_TAURI_GOVERNED |
| /doc-center | DocCenterPage | LIVE_TAURI_GOVERNED |
| /singularity | SingularityMonitor | LIVE_TAURI_WITH_FALLBACK |
| /sentinel | Sentinel | LIVE_TAURI_WITH_FALLBACK |
| /watchdog | Watchdog | LIVE_TAURI_WITH_FALLBACK |
| /selfheal | SelfHeal | LIVE_TAURI_WITH_FALLBACK |
| /adaptive | AdaptiveEngine | LIVE_TAURI_WITH_FALLBACK |
| /skills | SkillManager | MIXED_LIVE_AND_STATIC |
| /knowledge | KnowledgeFusionPage | MIXED_LIVE_AND_STATIC |
| /creation | CreationStudio | MIXED_LIVE_AND_STATIC |
| /evolution | EvolutionMonitor | MIXED_LIVE_AND_STATIC |
| /performance | PerformanceTest | MIXED_LIVE_AND_STATIC |
| /htf | HTFPage | MIXED_LIVE_AND_STATIC |

### Gate Results

- `detect_recurrence.sh`: PASS (1756 entries, no recurrence)
- `verify_instructions.sh`: PASS (52 PASS, 0 FAIL)

---

## Rollback Plan

```bash
# Revert navigation fix
git checkout HEAD~1 -- e2e/desktop/ui-desktop-all-routes.wdio.test.js
# Revert registry
git checkout HEAD~1 -- src/registry/uiSurfaceRegistry.ts
# Revert manifest
git checkout HEAD~1 -- docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json
```

---

## VERDICT: `UI_DESKTOP_ROOT_CONTRACT_100_CONFIRMED` — PASS
