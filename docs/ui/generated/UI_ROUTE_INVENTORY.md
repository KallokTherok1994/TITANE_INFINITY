# UI Route Inventory
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- Source: src/registry/uiSurfaceRegistry.ts -->
<!-- Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46 -->
<!-- Generation date: 2025-07 -->

> **WARNING**: Runtime status columns reflect static classification only.
> Proof lanes marked `LIVE_*` require Tauri runtime verification.
> All `ACTIVE_PARTIAL` surfaces have mixed live + static data without full runtime proof.

## Canonical Routes (29)

| Route | Page Component | Nav Owner | Status | Truth Class | Root TestId |
|---|---|---|---|---|---|
| `/titane` | TitaneDashboard | titane | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-titane` |
| `/experience` | ExperiencePage | titane | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-experience` |
| `/time` | TimePage | time | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-time` |
| `/admin` | AdminPage | admin | ACTIVE_PARTIAL | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | `page-admin` |
| `/dev` | DevPage | dev | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | `page-dev` |
| `/fusion` | FusionDashboard | fusion | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-fusion` |
| `/optimization` | UltimateOptimizationDashboard | optimization | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-optimization` |
| `/total-dev` | TotalDevPage | total-dev | ACTIVE_PARTIAL | LIVE_TAURI_GOVERNED | `page-total-dev` |
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | dev | **SIMULATED_UI** | **SIMULATED_UI** | `page-orchestration-intelligence` |
| `/orchestration-center` | OrchestrationMetaCenterPage | dev | ACTIVE_PARTIAL | LIVE_TAURI_SERVICE_BRIDGE | `page-orchestration-meta-center` |
| `/reality-center` | RealityCenterPage | fusion | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | `page-reality-center` |
| `/hyper-center` | HyperCenterPage | fusion | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-hyper-center` |
| `/quantum-center` | QuantumCenter | fusion | **SIMULATED_UI** | **SIMULATED_UI** | `page-quantum-center` |
| `/twins` | TwinsPage | twins | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-twins` |
| `/cloud` | CloudPage | fusion | ACTIVE_PARTIAL | LIVE_TAURI | `page-cloud-center` |
| `/memory` | MemoryPage | titane | ACTIVE_PARTIAL | LIVE_TAURI_SERVICE_BRIDGE | `page-memory` |
| `/research` | ResearchPage | titane | ACTIVE_PARTIAL | LIVE_TAURI_GOVERNED | `research-page` |
| `/doc-center` | DocCenterPage | (none) | ACTIVE_PARTIAL | LIVE_TAURI_GOVERNED | `doc-center-page` |
| `/singularity` | SingularityPage | dev | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | `page-singularity-monitor` |
| `/sentinel` | SentinelPage | dev | ACTIVE_PARTIAL | LIVE_TAURI | `page-sentinel` |
| `/watchdog` | WatchdogPage | dev | ACTIVE_PARTIAL | LIVE_TAURI | `page-watchdog` |
| `/selfheal` | SelfHealPage | dev | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | `page-selfheal` |
| `/adaptive` | AdaptivePage | dev | ACTIVE_PARTIAL | LIVE_TAURI_SERVICE_BRIDGE | `page-adaptive-engine` |
| `/skills` | SkillsPage | titane | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-skills` |
| `/knowledge` | KnowledgePage | titane | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-knowledge` |
| `/creation` | CreationPage | titane | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-creation-studio` |
| `/evolution` | EvolutionPage | titane | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | `page-evolution-monitor` |
| `/performance` | PerformanceTest | (none) | **DISPLAY_ONLY** | MIXED_LIVE_AND_STATIC | `page-performance-test` |
| `/htf` | HTFPage | (none) | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | `page-htf` |

## Status Summary

| Status | Count | Routes |
|---|---|---|
| ACTIVE_PARTIAL | 26 | Most canonical surfaces |
| SIMULATED_UI | 2 | `/orchestration-intelligence`, `/quantum-center` |
| DISPLAY_ONLY | 1 | `/performance` |
| ACTIVE_SYNCED | 0 | None (no runtime proof validated) |

## Navigation Ownership

| Nav Owner | Routes |
|---|---|
| titane | `/titane`, `/experience`, `/memory`, `/research`, `/skills`, `/knowledge`, `/creation`, `/evolution` |
| time | `/time` |
| admin | `/admin` |
| dev | `/dev`, `/orchestration-intelligence`, `/orchestration-center`, `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive` |
| fusion | `/fusion`, `/reality-center`, `/hyper-center`, `/quantum-center`, `/cloud` |
| optimization | `/optimization` |
| twins | `/twins` |
| total-dev | `/total-dev` |
| (none/direct) | `/doc-center`, `/performance`, `/htf` |
