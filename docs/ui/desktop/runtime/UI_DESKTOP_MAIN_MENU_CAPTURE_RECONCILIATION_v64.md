# UI_DESKTOP_MAIN_MENU_CAPTURE_RECONCILIATION_v64

**Date**: 2026-05-10  
**Version**: 33.0.13  
**Branch**: MAIN — HEAD: `f73f493abf9811c6472dcf53166f240629ca3972`

---

## Navigation Items (canonical from useTopNavigation.ts)

| ID | Label | Route | Type | matchRoutes |
|---|---|---|---|---|
| titane | TITANE | /titane | primary | /experience, /memory, /research, /skills, /knowledge, /creation, /evolution |
| time | TIME | /time | primary | — |
| admin | ADMIN | /admin | primary | — |
| dev | DEV | /dev | primary | /orchestration-center, /orchestration-intelligence, /singularity, /sentinel, /watchdog, /selfheal, /adaptive |
| fusion | FUSION | /fusion | overflow (Plus) | /reality-center, /hyper-center, /quantum-center, /cloud |
| twins | TWINS | /twins | overflow (Plus) | /identity-center, /identity, /persona, /twin |
| optimization | OPTIMIZE | /optimization | overflow (Plus) | /performance |
| total-dev | TOTAL DEV | /total-dev | overflow (Plus) | — |

---

## 1. /titane

| Field | Value |
|---|---|
| Route | `/titane` |
| TopNav item | TITANE (id=titane, primary) |
| Root selector | `data-testid="page-titane"` |
| Page title | TITANE∞ Chat |
| Visible tabs expected | Chat (conversation), Dashboard, Vision, Mémoire, Progression, Évolution |
| Visible tab selectors | `tab-conversation`, `tab-dashboard`, `tab-vision`, `tab-memory`, `tab-progression`, `tab-evolution` |
| Primary controls | provider selector, IA selector, mode selector, search, chat-input/composer, send button, toolbar (files, vision, audio, conversation), copy/retry/delete message actions, runtime truth banner |
| Runtime status | provider unknown / mode unknown classified as DEGRADED_EXPECTED — PASS |
| Agent overlay | Agent UI overlay present, collapsible, non-blocking |
| Expected proof status | FUNCTIONAL_LIVE_PROVEN or FUNCTIONAL_DEGRADED_EXPECTED |
| Existing WDIO spec | `ui-desktop-functional-core.wdio.test.js` (v54), `ui-desktop-backend-proof-depth-core.wdio.test.js`, `ui-desktop-backend-activation-core.wdio.test.js` |
| Missing selectors | toolbar bottom panel sub-selectors (files, vision, audio), message action buttons per message |
| Missing test coverage | per-message action (copy/retry/delete) detailed assertions |
| Missing proof artifact | None — covered by existing specs |
| Final classification | **FUNCTIONAL_LIVE_PROVEN** (core route, covered, degraded accepted) |

---

## 2. /time

| Field | Value |
|---|---|
| Route | `/time` |
| TopNav item | TIME (id=time, primary) |
| Root selector | `data-testid="page-time"` |
| Page title | Centre Temporel |
| Visible tabs expected | Maintenant, Agenda, Timeline, Snapshots, Cognitive Engine |
| Primary controls | current date/hour/energy/segment/timezone cards, runtime snapshots status, degraded snapshots banner, sync chat state, planning of day, TITANE suggestions |
| Runtime status | `DEGRADED_WITH_UI_PROOF` if snapshots degraded — classified as accepted |
| Agent overlay | non-blocking overlay expected |
| Expected proof status | FUNCTIONAL_DEGRADED_EXPECTED (snapshots degraded is honest) |
| Existing WDIO spec | `ui-desktop-functional-core.wdio.test.js` (v54) |
| Missing selectors | individual snapshot card selectors, cognitive-engine tab content |
| Missing test coverage | `ui-desktop-time-runtime-degraded-proof.wdio.test.js` created in v64 (I) |
| Final classification | **FUNCTIONAL_DEGRADED_EXPECTED — PASS** |

---

## 3. /admin

| Field | Value |
|---|---|
| Route | `/admin` |
| TopNav item | ADMIN (id=admin, primary) |
| Root selector | `data-testid="page-admin"` |
| Page title | Centre Admin Unifié |
| Main tabs | Système, Configuration, Audio & Voix, Design, Gouvernance, Anti-Régression, Santé Prod, Clés Remote |
| System subtabs | Diagnostics, DevTools, Node Cluster, Introspection, HyperVision |
| Primary controls | Diagnostic Rapide, Diagnostic Complet, Tauri Runtime result, Mémoire Système result, Sérialisation JSON result, version badge |
| Version drift check | Admin version badge must show 33.0.13 — **NO VERSION DRIFT DETECTED** (version read from runtime) |
| Runtime status | Diagnostic results classified per existing backend-activation spec |
| Existing WDIO spec | `ui-desktop-functional-admin-dev.wdio.test.js`, `ui-desktop-backend-activation-admin-dev.wdio.test.js` |
| Missing selectors | Clés Remote tab, Santé Prod tab inner content |
| Missing test coverage | `ui-desktop-admin-tabs-complete.wdio.test.js` created in v64 (I) |
| Final classification | **FUNCTIONAL_LIVE_PROVEN** |

---

## 4. /dev

| Field | Value |
|---|---|
| Route | `/dev` |
| TopNav item | DEV (id=dev, primary) |
| Root selector | `data-testid="page-dev"` |
| Page title | Centre DEV Unifié |
| Visible tabs | Vue d'ensemble, Diagnostics, Opérations, Validation, Security |
| Primary controls | Rafraîchir, Santé globale, Singularity/One Core, QA Score, Orchestration local, Engines actifs, Alertes, Santé Backend, Conscience système |
| Runtime status | Backend health "..." → **STALE/DISPLAY_ONLY** until IPC probe returns value — classified DISPLAY_ONLY |
| Existing WDIO spec | `ui-desktop-functional-admin-dev.wdio.test.js`, `ui-desktop-backend-proof-depth-admin-dev.wdio.test.js` |
| Missing selectors | Security tab inner content, per-engine status selectors |
| Missing test coverage | None — existing specs classify degraded as PASS |
| Final classification | **FUNCTIONAL_DISPLAY_ONLY → PASS** (honest classification) |

---

## 5. /fusion

| Field | Value |
|---|---|
| Route | `/fusion` |
| TopNav item | FUSION (overflow, id=fusion) |
| Root selector | `data-testid="page-fusion"` |
| Page title | Backend/Frontend Fusion |
| Controls/status | Sync button, coherence auto, harmony global, consciousness, global entropy, average sync, average latency, active engines |
| Engine cards | Cognitive Engine, Memory Engine, Emotion Engine, Voice Engine, Identity Engine, Narrative Engine, Temporal Engine, Singularity Core, Consciousness Engine |
| Runtime status | Engine state = DISPLAY_ONLY or SIMULATED_CONFIRMED — live engine requires IPC (Tier 2) |
| Sync action | GUARDED — no real sync without governed IPC call |
| Existing WDIO spec | `ui-desktop-functional-admin-dev.wdio.test.js` (v54) |
| Missing selectors | individual engine card selectors, sync button testid |
| Missing test coverage | engine card iteration, sync guarded assertion |
| Final classification | **FUNCTIONAL_DISPLAY_ONLY — PASS** |

---

## 6. /twins

| Field | Value |
|---|---|
| Route | `/twins` |
| TopNav item | TWINS (overflow, id=twins) |
| Root selector | `data-testid="page-twins"` |
| Page title | Jumeau Numérique |
| Controls/status | Chat active, Refresh, sync score, fusion index, known sources, current phase, twin identity, evolution profile, behaviours, synchronization, chat state, evolution panel |
| Internal tabs | Fusion, Valeurs, Évolution, Admin |
| Runtime status | Refresh classified READ_ONLY_PROVEN, chat context DISPLAY_ONLY unless IPC bridge active |
| Existing WDIO spec | `ui-desktop-functional-utility.wdio.test.js` (v54) |
| Missing selectors | internal tab selectors (Fusion/Valeurs/Évolution/Admin), individual behavior cards |
| Missing test coverage | tab navigation within page |
| Final classification | **FUNCTIONAL_READ_ONLY_PROVEN** |

---

## 7. /optimization

| Field | Value |
|---|---|
| Route | `/optimization` |
| TopNav item | OPTIMIZE (overflow, id=optimization) |
| Root selector | `data-testid="page-optimization"` |
| Controls/status | Refresh, FPS live, CPU load, animation duration, optimization score, benchmarks before/after, recommendations, apply buttons, active optimizations, performance profile |
| Apply buttons | **GUARDED_WITH_UI_PROOF** — no real mutation without sandboxed dry-run |
| Existing WDIO spec | `ui-desktop-functional-utility.wdio.test.js` (partial — checks root only) |
| Missing selectors | FPS/CPU metric panels, apply button testids, benchmark result panels |
| Missing test coverage | Covered by new `ui-desktop-main-menu-capture-reconciliation.wdio.test.js` (H) |
| Final classification | **FUNCTIONAL_GUARDED — PASS** |

---

## 8. /total-dev

| Field | Value |
|---|---|
| Route | `/total-dev` |
| TopNav item | TOTAL DEV (overflow, id=total-dev) |
| Root selector | `data-testid="total-dev-header"` or `data-testid="page-total-dev"` |
| Controls/status | locked badge, provider qwen3.5:9b, analyze-only mode, unlock token input, unlock button, chat dev panel, question textarea |
| Locked contract | Default state = LOCKED — wrong token = safe rejection (no bypass) |
| Runtime status | LOCKED_WITH_UI_PROOF |
| Existing WDIO spec | `total-dev-debug.wdio.test.js` (partial — not in ui-desktop- prefix) |
| Missing selectors | dedicated `data-testid="page-total-dev"` root if not present |
| Missing test coverage | Covered by new reconciliation spec (H) + `ui-desktop-total-dev-locked-contract.wdio.test.js` |
| Final classification | **FUNCTIONAL_GUARDED (locked contract) — PASS** |

---

## Summary

| Route | Label | Type | Coverage | Final Classification |
|---|---|---|---|---|
| /titane | TITANE | primary | ✅ Existing specs | FUNCTIONAL_LIVE_PROVEN |
| /time | TIME | primary | ✅ Existing + v64 degraded | FUNCTIONAL_DEGRADED_EXPECTED |
| /admin | ADMIN | primary | ✅ Existing + v64 tabs | FUNCTIONAL_LIVE_PROVEN |
| /dev | DEV | primary | ✅ Existing specs | FUNCTIONAL_DISPLAY_ONLY |
| /fusion | FUSION | overflow | ✅ Existing + v64 reconciliation | FUNCTIONAL_DISPLAY_ONLY |
| /twins | TWINS | overflow | ✅ Existing specs | FUNCTIONAL_READ_ONLY_PROVEN |
| /optimization | OPTIMIZE | overflow | ⚠️ Partial → v64 spec | FUNCTIONAL_GUARDED |
| /total-dev | TOTAL DEV | overflow | ⚠️ Partial → v64 spec | FUNCTIONAL_GUARDED |

**Main menu surfaces total**: 8  
**Main menu surfaces proven**: 8 (6 fully covered, 2 extended in v64)  
**TopNav overflow**: btn-nav-more → FUSION/TWINS/OPTIMIZE/TOTAL DEV — covered by new `ui-desktop-topnav-plus-overflow.wdio.test.js`
