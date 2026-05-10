# UI Desktop Strict Backend Proof — Runtime Blockers Classification v60

**Gate**: TITANE_UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60
**Date**: 2026-05-10
**Total BLOCKED_BY_RUNTIME records**: 25
**Unknown blockers remaining**: 0
**All blockers accepted for v60**: YES

---

## Blocker Class Definitions

| Class | Description |
|---|---|
| `BACKEND_SERVICE_NOT_INITIALIZED` | Tauri Rust backend service returns error/empty because the service is not fully initialized in the E2E runner context (no Ollama, no DB warm-up, no persistent state). |
| `PROVIDER_UNAVAILABLE` | AI/chat provider (Ollama) is not running or not reachable in the governed E2E test environment. |
| `SAFE_SANDBOX_NOT_CONFIGURED` | Sandboxed mutation requires filesystem write + cleanup, but no writable temp sandbox path is configured in the E2E runner. |

---

## Record-Level Classification (25 records)

### 1 — ADMIN_SYSTEM / get_system_health (invoke)
- **Route**: `/admin`
- **Module**: ADMIN_SYSTEM
- **Tier**: 1
- **Command**: `get_system_health`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Tauri `get_system_health` command returns IPC error or empty payload because the admin health aggregator requires persistence layer and Ollama to be running. Neither is active in E2E context.
- **Acceptable for v60**: YES — test environment limitation, well-understood
- **Required next action**: Provide a mock IPC stub for `get_system_health` in E2E mode, or initialize the health service with a minimal warm-up.
- **v61 candidate**: YES

### 2 — ADMIN_SYSTEM / cp_get_system_info (invoke)
- **Route**: `/admin`
- **Module**: ADMIN_SYSTEM
- **Tier**: 1
- **Command**: `cp_get_system_info`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: `cp_get_system_info` aggregates CPU, memory, OS info via Rust sys crate — returns a partial error when called before the Tauri system info service is warmed up in E2E.
- **Acceptable for v60**: YES
- **Required next action**: Add E2E warm-up call or accept sysinfo stub.
- **v61 candidate**: YES

### 3 — ADMIN_CONFIG / cp_get_ai_config (invoke)
- **Route**: `/admin`
- **Module**: ADMIN_CONFIG
- **Tier**: 1
- **Command**: `cp_get_ai_config`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: AI config requires a valid Ollama endpoint and model registry read. In E2E the Ollama socket is not bound.
- **Acceptable for v60**: YES
- **Required next action**: Mock Ollama endpoint or provide config snapshot for E2E.
- **v61 candidate**: YES

### 4 — ADMIN_CONFIG / cp_get_system_info (invoke)
- **Route**: `/admin`
- **Module**: ADMIN_CONFIG
- **Tier**: 1
- **Command**: `cp_get_system_info`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Same as record 2 — sysinfo service not warmed up.
- **Acceptable for v60**: YES
- **Required next action**: Same as record 2.
- **v61 candidate**: YES

### 5 — DEV_COCKPIT / get_system_health (invoke)
- **Route**: `/dev`
- **Module**: DEV_COCKPIT
- **Tier**: 1
- **Command**: `get_system_health`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Dev cockpit reuses health aggregator — same root cause as record 1.
- **Acceptable for v60**: YES
- **Required next action**: Shared fix with ADMIN_SYSTEM health stub.
- **v61 candidate**: YES

### 6 — DEV_COCKPIT / cp_get_ai_config (invoke)
- **Route**: `/dev`
- **Module**: DEV_COCKPIT
- **Tier**: 1
- **Command**: `cp_get_ai_config`
- **SourceSpec**: `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Same as record 3 — Ollama socket absent.
- **Acceptable for v60**: YES
- **Required next action**: Shared fix with ADMIN_CONFIG Ollama stub.
- **v61 candidate**: YES

### 7 — AGENT_CHAT / get_system_health (invoke)
- **Route**: `/admin`
- **Module**: AGENT_CHAT
- **Tier**: 1
- **Command**: `get_system_health`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: AGENT_CHAT module uses the `/admin` route and `get_system_health` — same root cause.
- **Acceptable for v60**: YES. Note: AGENT_CHAT has NO `UI_REFLECTS_BACKEND_RESULT` record at all — it is the only Tier 1 module with best level BLOCKED.
- **Required next action**: Add a dedicated AGENT_CHAT IPC command that does NOT require full health aggregator. Or fix the shared stub.
- **v61 candidate**: YES — PRIORITY (only Tier 1 module with no proven record)

### 8 — CHAT_CONTEXT / chat_get_providers_status (invoke) [occurrence A]
- **Route**: `/titane`
- **Module**: CHAT_CONTEXT
- **Tier**: 1
- **Command**: `chat_get_providers_status`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `PROVIDER_UNAVAILABLE`
- **Exact blocker**: `chat_get_providers_status` requires at least one Ollama provider to be online. In E2E context, Ollama is not running. The IPC command returns an error or empty provider list.
- **Acceptable for v60**: YES — CHAT_CONTEXT also has `UI_REFLECTS_BACKEND_RESULT` from another record, so it IS proven for Tier 1.
- **Required next action**: Add offline/mock provider for E2E.
- **v61 candidate**: YES

### 9 — CHAT_CONTEXT / memory_get_state (invoke)
- **Route**: `/memory`
- **Module**: CHAT_CONTEXT
- **Tier**: 1
- **Command**: `memory_get_state`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Expected proof target**: `UI_REFLECTS_BACKEND_RESULT`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Memory state service requires DB initialization. E2E runner does not run the full DB warm-up sequence.
- **Acceptable for v60**: YES
- **Required next action**: Initialize memory DB in E2E setup.
- **v61 candidate**: YES

### 10 — CHAT_CONTEXT / chat_get_providers_status (invoke) [occurrence B]
- **Route**: `/titane`
- **Module**: CHAT_CONTEXT
- **Tier**: 1
- **Command**: `chat_get_providers_status`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Blocker class**: `PROVIDER_UNAVAILABLE`
- **Exact blocker**: Duplicate probe — same root cause as record 8. Two probes were emitted for two different proof contexts (agent-chat vs core). Both BLOCKED for same reason.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 11 — AGENT_CONTEXT / memory_get_state (invoke)
- **Route**: `/memory`
- **Module**: AGENT_CONTEXT
- **Tier**: 1
- **Command**: `memory_get_state`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Same as record 9 — memory DB not init.
- **Acceptable for v60**: YES — AGENT_CONTEXT also has `UI_REFLECTS_BACKEND_RESULT`.
- **v61 candidate**: YES

### 12 — AGENT_CONTEXT / chat_get_providers_status (invoke)
- **Route**: `/titane`
- **Module**: AGENT_CONTEXT
- **Tier**: 1
- **Command**: `chat_get_providers_status`
- **SourceSpec**: `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js`
- **Blocker class**: `PROVIDER_UNAVAILABLE`
- **Exact blocker**: Same as record 8 — Ollama not running in E2E.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 13 — TITANE_CHAT / chat_get_providers_status [occurrence A]
- **Route**: `/titane`
- **Module**: TITANE_CHAT
- **Tier**: 1
- **Command**: `chat_get_providers_status`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `PROVIDER_UNAVAILABLE`
- **Exact blocker**: Ollama provider not initialized in E2E context.
- **Acceptable for v60**: YES — TITANE_CHAT has `UI_REFLECTS_BACKEND_RESULT` from other records.
- **v61 candidate**: YES

### 14 — TITANE_CHAT / chat_get_memory_stats
- **Route**: `/titane`
- **Module**: TITANE_CHAT
- **Tier**: 1
- **Command**: `chat_get_memory_stats`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Memory stats aggregator depends on conversation history DB being initialized. E2E starts from a cold state.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 15 — TITANE_CHAT / chat_get_providers_status [occurrence B]
- **Route**: `/titane`
- **Module**: TITANE_CHAT
- **Tier**: 1
- **Command**: `chat_get_providers_status`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `PROVIDER_UNAVAILABLE`
- **Exact blocker**: Duplicate probe — same root cause as record 13.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 16 — TIME / read_snapshot
- **Route**: `/time`
- **Module**: TIME
- **Tier**: 1
- **Command**: `read_snapshot`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Temporal engine snapshot service requires the time/agenda state to be initialized. The E2E runner cold-starts Tauri without temporal initialization.
- **Acceptable for v60**: YES — TIME also has `UI_REFLECTS_BACKEND_RESULT`.
- **v61 candidate**: YES

### 17 — TIME / get_timeline
- **Route**: `/time`
- **Module**: TIME
- **Tier**: 1
- **Command**: `get_timeline`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Timeline requires persistent agenda data. E2E has no pre-seeded agenda.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 18 — MEMORY / memory_get_state
- **Route**: `/memory`
- **Module**: MEMORY
- **Tier**: 1
- **Command**: `memory_get_state`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Memory graph DB not initialized. Returns empty/error.
- **Acceptable for v60**: YES — MEMORY also has `UI_REFLECTS_BACKEND_RESULT`.
- **v61 candidate**: YES

### 19 — EXPERIENCE / performance_get_metrics
- **Route**: `/experience`
- **Module**: EXPERIENCE
- **Tier**: 2 (artifact tag; T1 in config — see tier mismatch note)
- **Command**: `performance_get_metrics`
- **SourceSpec**: `ui-desktop-strict-backend-proof-core.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Performance metrics require persistent telemetry collection to have run for at least one session. E2E cold start has no telemetry data.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 20 — DOC_CENTER (sandbox mutation)
- **Route**: `/doc-center`
- **Module**: DOC_CENTER
- **Tier**: 1
- **Command**: null (sandboxed mutation)
- **SourceSpec**: `ui-desktop-strict-backend-proof-sandbox.wdio.test.js`
- **Blocker class**: `SAFE_SANDBOX_NOT_CONFIGURED`
- **Exact blocker**: Sandbox mutation requires a writable temp directory to be pre-configured and accessible from the Tauri process. The E2E runner has no sandbox temp path configured for this module.
- **Acceptable for v60**: YES — DOC_CENTER has `UI_REFLECTS_BACKEND_RESULT` from the invoke spec.
- **v61 candidate**: YES

### 21 — TIME (sandbox mutation)
- **Route**: `/time`
- **Module**: TIME
- **Tier**: 1
- **Command**: null (sandboxed mutation)
- **SourceSpec**: `ui-desktop-strict-backend-proof-sandbox.wdio.test.js`
- **Blocker class**: `SAFE_SANDBOX_NOT_CONFIGURED`
- **Exact blocker**: Same as record 20 — no E2E sandbox temp path configured.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 22 — MEMORY (sandbox mutation)
- **Route**: `/memory`
- **Module**: MEMORY
- **Tier**: 1
- **Command**: null (sandboxed mutation)
- **SourceSpec**: `ui-desktop-strict-backend-proof-sandbox.wdio.test.js`
- **Blocker class**: `SAFE_SANDBOX_NOT_CONFIGURED`
- **Exact blocker**: Same as record 20.
- **Acceptable for v60**: YES
- **v61 candidate**: YES

### 23 — ADMIN_SYSTEM (sandbox mutation)
- **Route**: `/admin`
- **Module**: ADMIN_SYSTEM
- **Tier**: 1
- **Command**: null (sandboxed mutation)
- **SourceSpec**: `ui-desktop-strict-backend-proof-sandbox.wdio.test.js`
- **Blocker class**: `SAFE_SANDBOX_NOT_CONFIGURED`
- **Exact blocker**: Same as record 20.
- **Acceptable for v60**: YES — ADMIN_SYSTEM has `UI_REFLECTS_BACKEND_RESULT` from invoke spec.
- **v61 candidate**: YES

### 24 — DOC_CENTER / get_documentation_index (utility spec)
- **Route**: `/doc-center`
- **Module**: DOC_CENTER
- **Tier**: 1
- **Command**: `get_documentation_index`
- **SourceSpec**: `ui-desktop-strict-backend-proof-utility.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Documentation index builder requires a scan of the docs directory that is not pre-triggered in E2E. Returns empty index.
- **Acceptable for v60**: YES — DOC_CENTER already has `UI_REFLECTS_BACKEND_RESULT` from core spec.
- **v61 candidate**: YES

### 25 — PERFORMANCE / performance_get_metrics (utility spec)
- **Route**: `/performance`
- **Module**: PERFORMANCE
- **Tier**: 2 (artifact tag)
- **Command**: `performance_get_metrics`
- **SourceSpec**: `ui-desktop-strict-backend-proof-utility.wdio.test.js`
- **Blocker class**: `BACKEND_SERVICE_NOT_INITIALIZED`
- **Exact blocker**: Performance metrics require telemetry warmup — same as record 19. Two probes from two specs hit the same command with the same failure.
- **Acceptable for v60**: YES — PERFORMANCE also has `UI_REFLECTS_BACKEND_RESULT` from core spec.
- **v61 candidate**: YES

---

## Summary

| Blocker Class | Count |
|---|---|
| `BACKEND_SERVICE_NOT_INITIALIZED` | 17 |
| `PROVIDER_UNAVAILABLE` | 4 |
| `SAFE_SANDBOX_NOT_CONFIGURED` | 4 |
| `UNKNOWN_BLOCKER` | **0** |

All 25 blocked records are accepted for v60. All are v61 candidates for further proof elevation.

## Tier 1 Module Status After Classification

| Module | Best Proof Level | BLOCKED Records | Tier 1 Met? |
|---|---|---|---|
| TITANE_CHAT | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES (3 proven records) |
| TIME | UI_REFLECTS_BACKEND_RESULT | 3 | ✅ YES |
| MEMORY | UI_REFLECTS_BACKEND_RESULT | 3 | ✅ YES |
| DOC_CENTER | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| ADMIN_SYSTEM | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| ADMIN_CONFIG | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| DEV_COCKPIT | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| CHAT_CONTEXT | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| AGENT_CONTEXT | UI_REFLECTS_BACKEND_RESULT | 2 | ✅ YES |
| RESEARCH | PROOF_DEPTH_GUARDED_ONLY | 0 | ⚠️ GUARDED (allowed, v61 target) |
| CLOUD | SANDBOXED_MUTATION_PROVEN | 0 | ⚠️ SANDBOXED (strong, v61 upgrade target) |
| EXPERIENCE | PROOF_DEPTH_BLOCKED_BY_RUNTIME | 1 | ⚠️ BLOCKED (BACKEND_SERVICE_NOT_INITIALIZED, v61 target) |
| AGENT_CHAT | PROOF_DEPTH_BLOCKED_BY_RUNTIME | 1 | ⚠️ BLOCKED (BACKEND_SERVICE_NOT_INITIALIZED, v61 PRIORITY) |

**9/13 Tier 1 modules fully proven (UI_REFLECTS_BACKEND_RESULT as best level)**
**4/13 Tier 1 modules guarded/blocked — all with classified acceptable blockers, no UNKNOWN_BLOCKER**
