# 04_UI_SURFACE_MAP.md

## Discovery Source
- src/App.tsx (React Router) — 36 real routes (non-redirect)
- e2e/desktop/page-objects/uiPages.po.js — 7 top-level desktop-tested pages
- src/pages/ — page component files

## Legend
- Criticality: CRITICAL / HIGH / MEDIUM / LOW
- Truth Source: TAURI_IPC / LOCAL_STATE / STATIC / MIXED
- Tested: BROWSER_E2E / DESKTOP_E2E / BOTH / NONE
- Proven: RUNTIME_PROVEN / VISIBLE_ONLY / STATIC_ONLY / UNPROVEN

---

## Top-Level Navigation (7 nav items — from uiPages.po.js)

| Surface | Route | Type | Criticality | Truth Source | Visible | Reachable | Browser E2E | Desktop E2E | Runtime Proven | Stale-Target Risk | Stale-Artifact Risk |
|---------|-------|------|-------------|-------------|---------|-----------|-------------|-------------|----------------|-------------------|---------------------|
| TITANE (Home+Chat) | /titane | Page+Tabs | CRITICAL | TAURI_IPC | YES | YES | YES (app-launch, chat-interaction) | YES (chat-ar20, online-chat-proof) | YES (prev session PASS) | LOW | LOW |
| Time | /time | Page+Tabs | HIGH | TAURI_IPC | YES | YES | NONE | YES (smoke) | PARTIAL | LOW | LOW |
| Stats/Dev | /dev | Page+Tabs | HIGH | TAURI_IPC | YES | YES | YES (engine-navigation) | YES (v22, v24 cert) | PARTIAL | LOW | LOW |
| Admin | /admin | Page+Tabs | CRITICAL | MIXED | YES | YES | YES (admin-main-menu-truth, audio-center) | YES (admin-design-truth, preprod_admin_config) | YES (TTS session) | LOW | LOW |
| Dev (tools) | /dev | Page+Tabs | HIGH | TAURI_IPC | YES | YES | NONE | YES (ui-ultra-full) | PARTIAL | LOW | LOW |
| Fusion | /fusion | Page | MEDIUM | TAURI_IPC | YES | YES | NONE | YES (ui-ultra-smoke) | UNPROVEN | LOW | LOW |
| Optimization | /optimization | Page | MEDIUM | TAURI_IPC | YES | YES | NONE | YES (ui-ultra-smoke) | UNPROVEN | LOW | LOW |

---

## All Real Routes (36 total)

| Route | Component | Criticality | Browser E2E | Desktop E2E | Runtime Proven | Classification |
|-------|-----------|-------------|-------------|-------------|----------------|----------------|
| /titane | TitanePage | CRITICAL | YES | YES | YES | PROVEN_RUNTIME |
| /time | TimePage | HIGH | NONE | YES | PARTIAL | PARTIAL_CHAIN |
| /admin | AdminCenter | CRITICAL | YES | YES | YES | PROVEN_RUNTIME |
| /dev | DevCenter | HIGH | PARTIAL | YES | PARTIAL | PARTIAL_CHAIN |
| /fusion | KnowledgeFusionPage | MEDIUM | NONE | YES | UNPROVEN | UI_ONLY |
| /optimization | OptimizationPage | MEDIUM | NONE | YES | UNPROVEN | UI_ONLY |
| /cognitive-evolution | CognitiveEvolution | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /identity-memory-evolution | IdentityMemoryEvolution | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /experience | Experience | LOW | NONE | NONE | UNPROVEN | UNKNOWN |
| /orchestration-intelligence | OrchestrationIntelligence | HIGH | YES (omega) | NONE | PARTIAL | PARTIAL_CHAIN |
| /orchestration-center | OrchestrationCenter | HIGH | YES (omega) | NONE | PARTIAL | PARTIAL_CHAIN |
| /meta-center | MetaCenter | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /multi-ai-dashboard | MultiAIDashboard | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /nexus-engine | NexusEngine | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /harmonia-engine | HarmoniaEngine | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /cognitive-state | CognitiveState | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /orchestration | OrchestrationPage | HIGH | YES (omega) | NONE | PARTIAL | PARTIAL_CHAIN |
| /reality-center | RealityCenter | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /hyper-center | HyperCenter | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /quantum-center | QuantumCenter | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /identity-center | IdentityCenter | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /twins | TwinsPage | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /memory-evolution | MemoryEvolution | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /memory-evo | MemoryEvo | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /cloud | CloudCenter | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /knowledge | KnowledgeFusionPage | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /creation | CreationStudio | LOW | NONE | NONE | UNPROVEN | UNKNOWN |
| /evolution | EvolutionMonitor | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /singularity | Singularity | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /sentinel | Sentinel | HIGH | NONE | YES | PARTIAL | PARTIAL_CHAIN |
| /watchdog | Watchdog | HIGH | YES (system-resilience) | NONE | PARTIAL | PARTIAL_CHAIN |
| /selfheal | SelfHeal | HIGH | NONE | NONE | UNPROVEN | UNKNOWN |
| /adaptive | AdaptiveEngine | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /memory | Memory | CRITICAL | YES (memory-tree-viewer) | YES (memory-conversations) | PARTIAL | PARTIAL_CHAIN |
| /research | ResearchPage | MEDIUM | NONE | NONE | UNPROVEN | UNKNOWN |
| /performance | PerformanceTest | LOW | NONE | NONE | UNPROVEN | UNKNOWN |

---

## Tab/Subtab Surfaces (from uiPages.po.js)

### /titane tabs
- tab-conversation (CRITICAL — Chat surface)
- tab-overview
- tab-vision (Camera/Vision surface)
- tab-identity
- tab-memory
- tab-memory-evolution
- tab-progression
- tab-transformation

### /admin tabs
- tab-admin-system
- tab-admin-config
- tab-admin-audio (CRITICAL — TTS controls proven)
- tab-admin-design
- tab-admin-governance
- tab-admin-production-health

### /dev tabs
- tab-dev-overview
- tab-dev-diagnostic
- tab-dev-devtools
- tab-dev-command-center
- tab-dev-system-commands
- tab-dev-qa-tests
- tab-dev-orchestration
- tab-dev-security
- tab-dev-metrics
- tab-dev-optimization

---

## Special Surfaces

| Surface | Type | Criticality | Tested | Notes |
|---------|------|-------------|--------|-------|
| Boot / Splash | Loading state | CRITICAL | DESKTOP_E2E | Proven in smoke.wdio.test.js |
| Chat degraded / offline | Degraded state | CRITICAL | BROWSER_E2E | chat-provider-decision-certification |
| Error overlay | Error state | HIGH | PARTIAL | system-resilience.spec.ts |
| Empty states | Empty state | MEDIUM | NONE | Not explicitly tested |
| Toast notifications | Overlay | LOW | NONE | Not explicitly tested |
| Modals (confirm/cancel) | Modal | MEDIUM | NONE | Not explicitly tested |
| Watchdog alert | Overlay | HIGH | PARTIAL | system-resilience.spec.ts |
| Admin secure settings | Secure | HIGH | YES | governance-center.spec.ts |

## Coverage Summary
- Total real routes: 36
- PROVEN_RUNTIME (desktop): 2 (/titane, /admin)
- PARTIAL_CHAIN: 9
- UI_ONLY: 2
- UNKNOWN (no E2E): 23
- Surfaces with desktop E2E: 7 top-level nav + audio + memory + TTS

## Gap Assessment
**CRITICAL**: 23 routes classified UNKNOWN — no browser or desktop E2E coverage.
These include: /nexus-engine, /harmonia-engine, /reality-center, /identity-center, /singularity, /memory-evolution, /cloud, /cognitive-state, and 15 more.
