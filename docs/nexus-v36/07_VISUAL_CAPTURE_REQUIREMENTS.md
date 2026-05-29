# GATE 7 — VISUAL CAPTURE REQUIREMENTS

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01

---

## Purpose

Visual capture establishes SurfaceTruth for each classified route before any P2 mutation.  
Screenshots taken before Gate 10 are the proof baseline for regression detection after P2 patches.

**Rule:** Visual proof is required for ALL `desktopProofRequired=true` routes before Gate 10.  
Visual proof is NOT required for `SIMULATED_UI` routes (desktopProofRequired=false).

---

## Priority 1 — KEEP_DAILY Routes (Required Before Gate 10)

These are the highest-priority captures. Any NEXUS v36 surface must not degrade these.

| Route | Component | Root TestId | Tabs | Desktop Proof Status |
|-------|-----------|-------------|------|---------------------|
| `/titane` | TitanePage | `page-titane` | 6 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/experience` | Experience | `page-experience` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/time` | TimePage | `page-time` | 5 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/memory` | Memory | `page-memory` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/twins` | TwinsPage | `page-twins` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/research` | ResearchPage | `research-page` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/multiproject` | MultiProjectDashboard | `multiproject-dashboard` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/skills` | SkillManager | `page-skills` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/knowledge` | KnowledgeFusionPage | `page-knowledge` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/creation` | CreationStudio | `page-creation-studio` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |
| `/evolution` | EvolutionMonitor | `page-evolution-monitor` | 0 tabs | desktopProofRequired=true / browserProofStatus=PASS_v48 |

**Tab-level captures required for tabbed routes:**
- `/titane`: conversation, overview, vision, memory, progression, transformation (6 captures)
- `/time`: time-now, time-agenda, time-timeline, time-snapshots, time-cognitive (5 captures)

---

## Priority 2 — KEEP_SYSTEM Routes (Required Before Gate 10)

| Route | Component | Root TestId | Desktop Proof Status |
|-------|-----------|-------------|---------------------|
| `/admin` | AdminPage | `page-admin` | desktopProofRequired=true (6 tabs) |
| `/fusion` | PerfectFusionDashboard | `page-fusion` | desktopProofRequired=true |
| `/optimization` | UltimateOptimizationDashboard | `page-optimization` | desktopProofRequired=true |
| `/orchestration-center` | OrchestrationMetaCenter | `page-orchestration-meta-center` | desktopProofRequired=true |
| `/reality-center` | RealityCenter | `page-reality-center` | desktopProofRequired=true |
| `/hyper-center` | HyperCenter | `page-hyper-center` | desktopProofRequired=true |
| `/cloud` | CloudCenter | `page-cloud-center` | desktopProofRequired=true |
| `/doc-center` | DocCenterPage | `doc-center-page` | desktopProofRequired=true |
| `/singularity` | SingularityMonitor | `page-singularity-monitor` | desktopProofRequired=true |
| `/sentinel` | Sentinel | `page-sentinel` | desktopProofRequired=true |
| `/watchdog` | Watchdog | `page-watchdog` | desktopProofRequired=true |
| `/selfheal` | SelfHeal | `page-selfheal` | desktopProofRequired=true |
| `/adaptive` | AdaptiveEngine | `page-adaptive-engine` | desktopProofRequired=true |
| `/htf` | HTFPage | `htf-module-page` | desktopProofRequired=true |

**Tab-level captures required for /admin:**
- admin-system, admin-config, admin-audio, admin-design, admin-governance, admin-production-health (6 captures)

---

## Priority 3 — KEEP_DEV Routes (Required Before Gate 10)

| Route | Component | Root TestId | Desktop Proof Status |
|-------|-----------|-------------|---------------------|
| `/dev` | DevPage | `page-dev` | desktopProofRequired=true (5 tabs) |
| `/total-dev` | TotalDevPage | `page-total-dev` | desktopProofRequired=true |

**Tab-level captures required for /dev:**
- dev-overview, dev-diagnostics, dev-operations, dev-validation, dev-security (5 captures)

---

## Priority 4 — KEEP_DISPLAY_ONLY Routes

| Route | Component | Root TestId | Desktop Proof Status |
|-------|-----------|-------------|---------------------|
| `/performance` | PerformanceTest | `page-performance-test` | desktopProofRequired=true |

---

## Exempt — SIMULATED_UI Routes (No Desktop Proof Required)

| Route | Component | Reason |
|-------|-----------|--------|
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | desktopProofRequired=false; SIMULATED_UI |
| `/quantum-center` | QuantumCenter | desktopProofRequired=false; SIMULATED_UI |

---

## Capture Protocol

For each required route:

1. **Launch Tauri app** in desktop mode (not browser mode)
2. **Navigate** to route via direct URL or nav click
3. **Verify root testId** is present: `document.querySelector('[data-testid="<rootTestId>"]')`
4. **Capture screenshot** — filename: `capture_<route-slug>_<date>.png`
5. **For tabbed routes**: click each tab, verify tab testId, capture per tab
6. **Record desktop proof status**: `PASS` (root visible) or `BLOCKED` (root missing)

**Safe actions only during capture:** Do not trigger sensitive actions (`isSensitive=true`) during visual capture.

---

## Current Desktop Proof Status

All 28 required routes: `browserProofStatus=PASS_v48` (browser baseline)  
Desktop proof: PENDING (requires Tauri app run)  
Gate 7 does not block on desktop capture — capture is a Gate 10 prerequisite, not Gate 7.

---

## Verdict

```
DAILY_ROUTES_REQUIRING_CAPTURE=11
SYSTEM_ROUTES_REQUIRING_CAPTURE=14
DEV_ROUTES_REQUIRING_CAPTURE=2
DISPLAY_ONLY_REQUIRING_CAPTURE=1
SIMULATED_EXEMPT=2
TOTAL_REQUIRED_CAPTURES=28_routes_plus_16_tabs=44_total
CAPTURE_STATUS=PENDING_GATE_10_PREREQUISITE
VISUAL_CAPTURE_REQUIREMENTS=COMPLETE
```
