# TITANE∞ v49 — Agent/Chat UI Context Bridge — Proof Matrix

**Date**: 2026-05-10  
**Mission**: `UI_DESKTOP_AGENT_CHAT_UNIFICATION_v49`  
**Service**: `src/services/agent/agentUiContextBridge.ts`  
**Tests**: `src/services/agent/__tests__/agentUiContextBridge.test.ts`

---

## Bridge Architecture

The `agentUiContextBridge` provides a unified context surface on top of the existing `moduleRouteContext` truth bus. Both agent and chat subsystems receive the same `UnifiedTitaneContext` shape from a single localStorage source.

```
App.tsx → publishActiveModuleContext(route) → localStorage[titane_chat_active_module_context_v1]
                                                              ↓
                               agentUiContextBridge.buildUnifiedTitaneContext()
                                              /                      \
                    getActiveUiContextForAgent()           getActiveUiContextForChat()
                          (historyLimit=8)                    (historyLimit=5)
```

---

## Unified Context Shape (`UnifiedTitaneContext`)

| Field | Source | Description |
|---|---|---|
| `route` | `ModuleRouteContext.route` | Canonical route path |
| `fullRoute` | `ModuleRouteContext.fullRoute` | Route + query state |
| `pageState` | `ModuleRouteContext.pageState` | Active tab/state params |
| `aliasResolvedFrom` | `ModuleRouteContext.aliasResolvedFrom` | Original alias before normalization |
| `moduleId` | `MODULE_REGISTRY[route].moduleId` | Canonical module identifier |
| `moduleName` | `MODULE_REGISTRY[route].moduleName` | Display name |
| `moduleType` | `MODULE_REGISTRY[route].moduleType` | Category (core-chat, planning, operations…) |
| `pageTitle` | `MODULE_REGISTRY[route].pageTitle` | Page title |
| `truthClass` | `MODULE_REGISTRY[route].dataTruthClass` | Data truth classification |
| `surfaceStatus` | Derived from `truthClass` | LIVE / MIXED / SIMULATED / GOVERNED / BRIDGE |
| `capabilities` | `MODULE_REGISTRY[route].capabilities` | Available capabilities array |
| `actions` | `MODULE_REGISTRY[route].actions` | IPC actions available |
| `limits` | `MODULE_REGISTRY[route].limits` | Known limitations |
| `memoryKeys` | `MODULE_REGISTRY[route].memoryKeys` | LocalStorage keys used |
| `continuity` | `ModuleRouteContext.continuity` | Navigation chain (sequence, changeType) |
| `proofState` | Computed | `sourceType` (localStorage/fallback), `lastUpdatedAt`, `contextVersion` |
| `recentModules` | `readRecentModuleContexts()` | Last N visited modules |
| `blockers` | Derived | Runtime blockers (SIMULATED, fallback-possible…) |
| `isSimulated` | Derived | `truthClass === 'SIMULATED_UI'` |
| `isLive` | Derived | `LIVE_TAURI*` truth classes |

---

## Test Results (15/15 PASS)

```
pnpm vitest run src/services/agent/__tests__/agentUiContextBridge.test.ts
✓ core  src/services/agent/__tests__/agentUiContextBridge.test.ts (15 tests) 9ms
Test Files  1 passed (1)
Tests       15 passed (15)
Duration    764ms
```

### Test Coverage

| Test | Description | Result |
|---|---|---|
| Fallback — null context | No localStorage → FALLBACK_CONTEXT returned | PASS |
| Fallback — surfaceStatus | FALLBACK → surfaceStatus=UNKNOWN | PASS |
| /titane → titane_core | moduleId correct, sourceType=localStorage | PASS |
| /titane — surfaceStatus | MIXED_LIVE_AND_STATIC → MIXED | PASS |
| /time → time_center | moduleId and moduleName correct | PASS |
| SIMULATED_UI — isSimulated | isSimulated=true, surfaceStatus=SIMULATED | PASS |
| LIVE_TAURI_SERVICE_BRIDGE | isLive=true, surfaceStatus=BRIDGE | PASS |
| LIVE_TAURI_GOVERNED | surfaceStatus=GOVERNED, isLive=true | PASS |
| Agent vs Chat — same truth | moduleId, truthClass identical for both views | PASS |
| Immutability | Mutating result does not affect next call | PASS |
| recentModules trimmed | historyLimit=5 → ≤5 items | PASS |
| recentModules empty | Empty history → [] returned | PASS |
| Alias — present | aliasResolvedFrom='/chat' preserved | PASS |
| Alias — absent | aliasResolvedFrom=undefined when not set | PASS |
| proofState.contextVersion | Always 'v1' | PASS |

---

## Route → Module Mappings (Sample)

| Route | moduleId | truthClass | surfaceStatus |
|---|---|---|---|
| `/titane` | `titane_core` | MIXED_LIVE_AND_STATIC | MIXED |
| `/time` | `time_center` | MIXED_LIVE_AND_STATIC | MIXED |
| `/memory` | `memory_page` | LIVE_TAURI_SERVICE_BRIDGE | BRIDGE |
| `/admin` | `admin_center` | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | LIVE_WITH_FALLBACK |
| `/dev` | `dev_center` | LIVE_TAURI_WITH_FALLBACK | LIVE_WITH_FALLBACK |
| `/orchestration-intelligence` | `orchestration_intelligence` | SIMULATED_UI | SIMULATED |
| `/quantum-center` | `quantum_center` | SIMULATED_UI | SIMULATED |
| `/doc-center` | `doc_center` | LIVE_TAURI_GOVERNED | GOVERNED |
| `/research` | `research_page` | LIVE_TAURI_GOVERNED | GOVERNED |
| `/cloud` | `cloud_center` | LIVE_TAURI | LIVE |
| `<unknown>` | `unknown_module` | MIXED_LIVE_AND_STATIC | UNKNOWN (fallback) |

---

## Single Truth Source Guarantee

Both `getActiveUiContextForAgent()` and `getActiveUiContextForChat()` call `buildUnifiedTitaneContext()` which reads `readActiveModuleContext()` once. The same `moduleId`, `truthClass`, `capabilities`, `actions`, `limits` are returned to both subsystems. No contamination path between agent-dev and chat-prod exists in this bridge (bridge is read-only; `publishActiveModuleContext` is called only from `App.tsx`).

---

**Verdict**: AGENT_CHAT_BRIDGE — 15/15 PASS — single truth source confirmed
