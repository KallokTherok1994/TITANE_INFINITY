# GATE 13 — VISUAL CAPTURE PLAN

**Date:** 2026-05-29
**Gate:** GATE_13
**Source Matrix:** `docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json`
**Source Routes:** `src/lib/routeIndex.ts`
**Source Nav Modes:** `src/lib/navigationMode.ts`

---

## Capture Groups Required

| Group | Routes | Status |
|-------|--------|--------|
| daily/ | 11 routes (KEEP_DAILY) | v79 screenshots: 10/11 captured; /multiproject missing |
| system/ | 14 routes (KEEP_SYSTEM) | v79 screenshots: 14/14 captured |
| dev/ | 2 routes (KEEP_DEV) | v79 screenshots: 2/2 captured |
| lab/ | 2 routes (KEEP_SIMULATED) | v79 screenshots: 2/2 captured |
| display_only/ | 1 route (KEEP_DISPLAY_ONLY) | v79 screenshots: 1/1 captured |
| tabs/ | /titane (6 tabs), /time (multiple), /admin | v80 metadata: tabsFound populated |
| zoom/ | 90%, 100%, 125% | v79: viewport variant captured per route |
| themes/ | dark | v79: dark theme (default) |
| failures/ | 0 blank, 0 error boundary | v80 metadata: CONFIRMED |

---

## Route Capture Requirements

### KEEP_DAILY (11 routes)

| Route | Screenshot (v79) | Metadata (v80) | Status |
|-------|-----------------|----------------|--------|
| /titane | ✓ titane.png | ✓ navActive=nav-titane, tabs: 6 | CAPTURED |
| /experience | ✓ experience.png | ✓ blankPage=false | CAPTURED |
| /time | ✓ time.png | ✓ navActive=nav-time | CAPTURED |
| /memory | ✓ memory.png | ✓ navActive=nav-titane | CAPTURED |
| /twins | ✓ twins.png | ✓ blankPage=false | CAPTURED |
| /research | ✓ research.png | ✓ navActive=nav-titane | CAPTURED |
| /multiproject | ✗ NOT CAPTURED | ✗ NOT IN v80 | MISSING |
| /skills | ✓ skills.png | ✓ navActive=nav-titane | CAPTURED |
| /knowledge | ✓ knowledge.png | ✓ navActive=nav-titane | CAPTURED |
| /creation | ✓ creation.png | ✓ navActive=nav-titane | CAPTURED |
| /evolution | ✓ evolution.png | ✓ navActive=nav-titane | CAPTURED |

### KEEP_SYSTEM (14 routes) — all captured

| Route | Screenshot (v79) | Status |
|-------|-----------------|--------|
| /admin | ✓ admin.png | CAPTURED |
| /fusion | ✓ fusion.png | CAPTURED |
| /optimization | ✓ optimization.png | CAPTURED |
| /orchestration-center | ✓ orchestration-center.png | CAPTURED |
| /reality-center | ✓ reality-center.png | CAPTURED |
| /hyper-center | ✓ hyper-center.png | CAPTURED |
| /cloud | ✓ cloud.png | CAPTURED |
| /doc-center | ✓ doc-center.png | CAPTURED |
| /singularity | ✓ singularity.png | CAPTURED |
| /sentinel | ✓ sentinel.png | CAPTURED |
| /watchdog | ✓ watchdog.png | CAPTURED |
| /selfheal | ✓ selfheal.png | CAPTURED |
| /adaptive | ✓ adaptive.png | CAPTURED |
| /htf | ✓ htf.png | CAPTURED |

### KEEP_DEV (2 routes) — all captured

| Route | Screenshot (v79) | Status |
|-------|-----------------|--------|
| /dev | ✓ dev.png | CAPTURED |
| /total-dev | ✓ total-dev.png | CAPTURED |

### KEEP_DISPLAY_ONLY (1 route)

| Route | Screenshot (v79) | Status |
|-------|-----------------|--------|
| /performance | ✓ performance.png | CAPTURED |

### KEEP_SIMULATED (2 routes, Lab context)

| Route | Screenshot (v79) | Metadata (v80) | Status |
|-------|-----------------|----------------|--------|
| /orchestration-intelligence | ✓ orchestration-intelligence.png | ✓ blankPage=false, visualStatus=VISUAL_ACTIVE | CAPTURED |
| /quantum-center | ✓ quantum-center.png | ✓ blankPage=false, visualStatus=VISUAL_ACTIVE | CAPTURED |

---

## Viewport Plan

| Viewport | Status |
|----------|--------|
| 1440x900 | v79: main variant per route |
| viewport variant | v79: viewport variant per route |

---

## Known Gaps

| Gap | Severity | Mitigation |
|-----|----------|-----------|
| `/multiproject` not captured | NON_BLOCKING | Route exists in App.tsx; added Gate 12 PALETTE_ROUTES; no screenshot yet |
| SIM-03 pixel-proof pending rebuild | NON_BLOCKING | Source fix proven by Gate 11 + 14/14 tests |
| Kevin visual validation pending | NON_BLOCKING | Part of QUALIFIED_PENDING_KEVIN_VISUAL_VALIDATION |
| v79 captured pre-Gate-11 | NON_BLOCKING | Appearance unchanged (no UI mutation in Gates 11–12) |
