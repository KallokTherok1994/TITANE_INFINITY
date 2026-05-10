# UI Desktop IPC Response — Command Capability Map v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Proven IPC Commands (UI_REFLECTS_BACKEND_RESULT)

| IPC Command | Rust Source | Route(s) | Avg Latency | Response Shape |
|---|---|---|---|---|
| `chat_get_providers_status` | `overdrive/chat_orchestrator.rs` | `/titane` | 597ms | object (providers array confirmed) |
| `chat_get_memory_stats` | `overdrive/chat_orchestrator.rs` | `/titane` | 553ms | object (stats confirmed) |
| `read_snapshot` | `mock_commands.rs` | `/time` | 593ms | object (snapshot confirmed) |
| `memory_get_state` | `commands/unified_memory_commands.rs` | `/memory` | 1427ms | object (state confirmed) |
| `get_system_health` | `mock_commands.rs` | `/admin`, `/dev` | 601ms | object (health confirmed) |
| `get_documentation_index` | capabilities | `/doc-center` | 586ms | object (index confirmed) |
| `performance_get_metrics` | capabilities | `/performance` | 548ms | object (metrics confirmed) |

---

## Commands Blocked by Runtime (NO_TAURI_INVOKE or arg validation)

| IPC Command | Route | Block Reason |
|---|---|---|
| `get_timeline` | `/time` | IPC channel unavailable in probe context |
| `cp_get_system_info` | `/admin` | IPC channel unavailable |
| `cp_get_ai_config` | `/admin` | IPC channel unavailable |
| `oauth_facebook_get_profile` | `/admin` | Auth token required |
| `memory_search` | `/memory` | Requires query arg in probe |

---

## Commands Guarded (available but sandboxed)

| IPC Command | Route | Guard Reason |
|---|---|---|
| — | `/research` | No stable IPC surface; guarded by UI auth layer |
| — | `/cloud` | Requires OAuth session for mutation |
| — | `/sentinel` | Read-only runtime surface, no IPC probe slot |
| — | `/watchdog` | Real-time events-only, no request/response IPC |

---

## Tier 1 Commands — Proof Level Progress

| Command | v58 Level | v59 Level | Target |
|---|---|---|---|
| `chat_get_providers_status` | BLOCKED | **UI_REFLECTS_BACKEND_RESULT** | ✅ MET |
| `chat_get_memory_stats` | BLOCKED | **UI_REFLECTS_BACKEND_RESULT** | ✅ MET |
| `memory_get_state` | BLOCKED | **UI_REFLECTS_BACKEND_RESULT** | ✅ MET |
| `get_system_health` | BLOCKED | **UI_REFLECTS_BACKEND_RESULT** | ✅ MET |
| `read_snapshot` | BLOCKED | **UI_REFLECTS_BACKEND_RESULT** | ✅ MET |
| `cp_get_ai_config` | BLOCKED | BLOCKED | ⏳ pending |
| `oauth_facebook_get_profile` | BLOCKED | BLOCKED | ⏳ needs auth mock |
