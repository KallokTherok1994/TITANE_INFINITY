# UI Runtime Route Proof Matrix — v48 (Section F1)

**Mission**: `TITANE_UI_BACKEND_RUNTIME_PROOF_EXECUTION_v48`
**Generated**: 2026-05-10
**Lane**: Browser E2E (Playwright, Chromium, port 1420)
**Command**: `TITANE_E2E_PORT=1420 TITANE_E2E_USE_WEBSERVER=0 pnpm exec playwright test e2e/ui-runtime-route-proof.spec.ts`
**Final result**: **13/13 PASS** (28.3s)

---

## F1.1 — Priority Routes Tested (11 canonical)

| Route | testId | Priority | Badge | Browser Result | Badge Proof |
|---|---|---|---|---|---|
| `/` | `page-titane` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/titane` | `page-titane` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/time` | `page-time` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/admin` | `page-admin` | P2 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/dev` | `page-dev` | P2 | Expected | ✅ PASS (soft) | ⚠️ `BADGE_PROOF=DESKTOP_ONLY` (ErrorBoundary in browser) |
| `/experience` | `page-experience` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/memory` | `page-memory` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/research` | `research-page` | P3 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/doc-center` | `doc-center-page` | P1 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/twins` | `page-twins` | P3 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |
| `/fusion` | `page-fusion` | P2 | Expected | ✅ PASS | ✅ `surface-truth-badge-partial` visible |

---

## F1.2 — Structural Tests

| Test | Description | Result |
|---|---|---|
| `TEST_STRUCTURAL_COVERAGE_CHECK` | Validates min 10 routes in spec | ✅ PASS |
| `TEST_BADGE_TESTID_CONSISTENCY` | Validates BADGE_TESTID constant is non-empty | ✅ PASS |

---

## F1.3 — Badge Summary

| Category | Count |
|---|---|
| Routes with badge DOM-visible in browser | 10 |
| Routes with badge in code only (desktop-only) | 1 (`/dev`) |
| Routes tested | 11 |
| Total tests | 13 |
| **All tests PASS** | ✅ 13/13 |

---

## F1.4 — /dev Route Classification

**Why `/dev` is `BADGE_PROOF=DESKTOP_ONLY`**:

1. `DevPage.tsx` has `<SurfaceTruthBadge>` at 3 locations: line 819 (loading), 831 (error), 854 (ready)
2. In browser mode (`isTauri: false`), hooks `useQAMonitoring()` and `useOneCore()` throw Tauri IPC errors
3. `<ErrorBoundary context="DevCenter">` in `App.tsx` catches these throws
4. ErrorBoundary renders "⚠️ Erreur dans DevPage" — page-dev testId and badge are NOT in DOM
5. **Badge is in source code** — not a missing implementation, just browser-mode boundary

**Desktop proof required**: `/dev` badge will be provable once a Tauri rebuild is done after v48 commit.

---

## F1.5 — Routes NOT in Browser Proof (registry-only)

These 18 routes are in the registry but not in the browser E2E spec (lower priority or admin-only):

| Route | Reason |
|---|---|
| `/orchestration-intelligence` | simulationDisclosureApplied — advanced/admin |
| `/quantum-center` | simulationDisclosureApplied — advanced/admin |
| `/monitor` | Admin/monitoring — advanced surface |
| `/security` | Security surface — desktop-only |
| `/log-analysis` | Log analysis — desktop-only |
| `/explainability` | Explainability — advanced |
| `/ai-profiler` | Profiler — advanced |
| `/api-sandbox` | Sandbox — advanced |
| `/performance-center` | Performance — advanced |
| `/governance` | Governance — advanced |
| `/total-dev` | TotalDev — developer surface |
| `/time/chrono` | Sub-route |
| `/time/biorhythms` | Sub-route |
| `/time/energy-forecast` | Sub-route |
| `/time/mission-timer` | Sub-route |
| `/time/circadian` | Sub-route |
| `/time/now` | Sub-route |
| *(others)* | To be covered in future lanes |

**Classification**: `NOT_TESTED_IN_BROWSER_LANE_v48` — pending future E2E expansion or desktop lane.
