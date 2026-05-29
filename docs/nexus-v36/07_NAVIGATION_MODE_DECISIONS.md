# GATE 7 — NAVIGATION MODE DECISIONS

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01

---

## Mode Definitions

| Mode | Description |
|------|-------------|
| **DAILY** | Primary user mode: productive, clean, only KEEP_DAILY surfaces visible in nav |
| **SYSTEM** | System/admin mode: KEEP_SYSTEM surfaces accessible, typically via /admin or direct URL |
| **DEV** | Developer mode: KEEP_DEV surfaces accessible, gated, not in public nav |
| **SIMULATED** | Simulated surfaces: visible with SIMULATED badge, never in DAILY nav |

---

## Daily Mode — Visible Nav Surfaces (11 routes)

These routes appear in primary TopNav / sidebar navigation in Daily mode:

| Route | Component | NavOwner | Primary Tab? |
|-------|-----------|----------|-------------|
| `/titane` | TitanePage | titane | YES — root / |
| `/experience` | Experience | titane | YES |
| `/time` | TimePage | time | YES |
| `/memory` | Memory | titane | YES |
| `/twins` | TwinsPage | twins | YES |
| `/research` | ResearchPage | titane | YES |
| `/multiproject` | MultiProjectDashboard | projects | YES |
| `/skills` | SkillManager | titane | YES |
| `/knowledge` | KnowledgeFusionPage | titane | YES |
| `/creation` | CreationStudio | titane | YES |
| `/evolution` | EvolutionMonitor | titane | YES |

**Constraint:** SIMULATED_UI routes (`/orchestration-intelligence`, `/quantum-center`) are NEVER shown in Daily nav.

---

## System Mode — Accessible Surfaces (14 routes)

Accessible via `/admin` or direct URL; not in primary Daily nav:

| Route | Component | Access Pattern |
|-------|-----------|---------------|
| `/admin` | AdminPage | TopNav (admin owner) |
| `/fusion` | PerfectFusionDashboard | Direct URL / fusion owner |
| `/optimization` | UltimateOptimizationDashboard | Direct URL |
| `/orchestration-center` | OrchestrationMetaCenter | Direct URL / /meta-center |
| `/reality-center` | RealityCenter | Direct URL / /reality |
| `/hyper-center` | HyperCenter | Direct URL / /hyper |
| `/cloud` | CloudCenter | Direct URL / /vault |
| `/doc-center` | DocCenterPage | Direct URL / /doc |
| `/singularity` | SingularityMonitor | Direct URL |
| `/sentinel` | Sentinel | Direct URL |
| `/watchdog` | Watchdog | Direct URL |
| `/selfheal` | SelfHeal | Direct URL |
| `/adaptive` | AdaptiveEngine | Direct URL |
| `/htf` | HTFPage | Direct URL only |

---

## Dev Mode — Restricted Surfaces (2 routes)

Gated to developer access; not in public nav:

| Route | Component | Restriction |
|-------|-----------|------------|
| `/dev` | DevPage | Dev access gate |
| `/total-dev` | TotalDevPage | Dev access gate; qwen3.5:9b IPC surface |

**Note:** `/total-dev` is an ALLOWED_DEV_SURFACE for qwen3.5:9b. Must not appear in product Daily nav.

---

## Simulated Mode — Badge-Required Surfaces (2 routes)

Must display SIMULATED_UI badge at all times; forbidden from Daily nav:

| Route | Component | Badge Requirement |
|-------|-----------|-----------------|
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | SIMULATED badge required; knownBlocker: "SIMULATED_UI — no live backend data" |
| `/quantum-center` | QuantumCenter | SIMULATED badge required; knownBlocker: "SIMULATED_UI — no live backend data" |

---

## Display-Only Surfaces (1 route)

Read-only; no interactive write actions:

| Route | Component | Access Pattern |
|-------|-----------|---------------|
| `/performance` | PerformanceTest | Direct URL; diagnostics access |

---

## NEXUS v36 Navigation Impact (P2 — LOCKED)

The NEXUS v36 surface (Gate 8 design, Gate 10+ implementation) will introduce a new navigation context. The decisions above establish the baseline:

- **Daily surfaces**: All 11 KEEP_DAILY routes are preserved; NEXUS may provide an alternative navigation shell but MUST NOT delete or alias-break any of them.
- **System surfaces**: Remain accessible via direct URL regardless of NEXUS navigation layer.
- **Dev surfaces**: Remain access-gated regardless of NEXUS navigation layer.
- **Simulated surfaces**: NEXUS must NOT include SIMULATED_UI routes in any Daily or System nav regardless of new shell design.

**Gate 10 prerequisite:** Surface Decision Matrix (this document) must be referenced before any P2 navigation implementation.

---

## Verdict

```
DAILY_MODE_ROUTES=11
SYSTEM_MODE_ROUTES=14
DEV_MODE_ROUTES=2
DISPLAY_ONLY_ROUTES=1
SIMULATED_ROUTES=2
SIMULATED_IN_DAILY=0
NAVIGATION_MODE_DECISIONS=COMPLETE
```
