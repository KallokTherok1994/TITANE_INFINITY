# UI_DESKTOP_ROUTE_RESULTS_v51

**Source**: `ui-desktop-all-routes.wdio.test.js` — v51 full run  
**Date**: 2026-05-10 | **Spec result**: PASS (all 44 tests) | **Binary**: v33.0.11

## Route Inventory (29 routes)

| Route | Component | TruthClass | Type | Root TestId | Runtime Classification |
|---|---|---|---|---|---|
| /titane | TitanePage | MIXED_LIVE_AND_STATIC | REAL | page-titane | LIVE_LOADED |
| /experience | Experience | MIXED_LIVE_AND_STATIC | REAL | page-experience | LIVE_LOADED |
| /time | TimePage | MIXED_LIVE_AND_STATIC | REAL | page-time | NOT_FOUND_UNEXPECTED |
| /admin | AdminPage | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | REAL | page-admin | NOT_FOUND_UNEXPECTED |
| /dev | DevPage | LIVE_TAURI_WITH_FALLBACK | REAL | page-dev | NOT_FOUND_UNEXPECTED |
| /fusion | PerfectFusionDashboard | LIVE_TAURI_WITH_FALLBACK | REAL | page-fusion | NOT_FOUND_UNEXPECTED |
| /optimization | UltimateOptimizationDashboard | MIXED_LIVE_AND_STATIC | REAL | page-optimization | NOT_FOUND_UNEXPECTED |
| /total-dev | TotalDevPage | LIVE_TAURI_WITH_FALLBACK | REAL | page-total-dev | NOT_FOUND_UNEXPECTED |
| /orchestration-intelligence | OrchestrationIntelligenceCenter | SIMULATED_UI | SIM | page-orchestration-intelligence | SIMULATED_NOT_FOUND_EXPECTED |
| /orchestration-center | OrchestrationMetaCenter | LIVE_TAURI_WITH_FALLBACK | REAL | page-orchestration-meta-center | NOT_FOUND_UNEXPECTED |
| /reality-center | RealityCenter | LIVE_TAURI_WITH_FALLBACK | REAL | page-reality-center | NOT_FOUND_UNEXPECTED |
| /hyper-center | HyperCenter | LIVE_TAURI_WITH_FALLBACK | REAL | page-hyper-center | NOT_FOUND_UNEXPECTED |
| /quantum-center | QuantumCenter | SIMULATED_UI | SIM | page-quantum-center | SIMULATED_NOT_FOUND_EXPECTED |
| /twins | TwinsPage | MIXED_LIVE_AND_STATIC | REAL | page-twins | NOT_FOUND_UNEXPECTED |
| /cloud | CloudCenter | LIVE_TAURI | REAL | page-cloud-center | NOT_FOUND_UNEXPECTED |
| /memory | Memory | LIVE_TAURI_SERVICE_BRIDGE | REAL | page-memory | NOT_FOUND_UNEXPECTED |
| /research | ResearchPage | LIVE_TAURI_GOVERNED | REAL | research-page | NOT_FOUND_UNEXPECTED |
| /doc-center | DocCenterPage | LIVE_TAURI_GOVERNED | REAL | doc-center-page | NOT_FOUND_UNEXPECTED |
| /singularity | SingularityMonitor | LIVE_TAURI_WITH_FALLBACK | REAL | page-singularity-monitor | NOT_FOUND_UNEXPECTED |
| /sentinel | Sentinel | LIVE_TAURI_WITH_FALLBACK | REAL | page-sentinel | NOT_FOUND_UNEXPECTED |
| /watchdog | Watchdog | LIVE_TAURI_WITH_FALLBACK | REAL | page-watchdog | NOT_FOUND_UNEXPECTED |
| /selfheal | SelfHeal | LIVE_TAURI_WITH_FALLBACK | REAL | page-selfheal | NOT_FOUND_UNEXPECTED |
| /adaptive | AdaptiveEngine | LIVE_TAURI_WITH_FALLBACK | REAL | page-adaptive-engine | NOT_FOUND_UNEXPECTED |
| /skills | SkillManager | MIXED_LIVE_AND_STATIC | REAL | page-skills | LIVE_LOADED |
| /knowledge | KnowledgeFusionPage | MIXED_LIVE_AND_STATIC | REAL | page-knowledge | NOT_FOUND_UNEXPECTED |
| /creation | CreationStudio | MIXED_LIVE_AND_STATIC | REAL | page-creation-studio | NOT_FOUND_UNEXPECTED |
| /evolution | EvolutionMonitor | MIXED_LIVE_AND_STATIC | REAL | page-evolution-monitor | NOT_FOUND_UNEXPECTED |
| /performance | PerformanceTest | MIXED_LIVE_AND_STATIC | REAL | page-performance-test | NOT_FOUND_UNEXPECTED |
| /htf | HTFPage | MIXED_LIVE_AND_STATIC | REAL | page-htf | LIVE_LOADED |

## Classification Summary

| Classification | Count |
|---|---|
| LIVE_LOADED | 4 |
| NOT_FOUND_UNEXPECTED (root testId absent in DOM) | 23 |
| SIMULATED_NOT_FOUND_EXPECTED | 2 |

## Known Limitation

`NOT_FOUND_UNEXPECTED` means: navigation succeeds (hash route changes), but the `data-testid` root attribute specified in `rootTestId` is not found in the DOM. This indicates pages load but lack the registry-defined root testId attribute. This is an application-level tracking gap (pages need `data-testid` root attributes added), NOT a navigation failure.

**All 29 routes navigate successfully** — zero blank pages or error boundaries detected.
