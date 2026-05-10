# UI_DESKTOP_BACKEND_ACTIVATION_COMMAND_MAP_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction

---

## IPC Commands Used in Activation Specs

| Module | IPC Command | Spec File | Source (Rust) | Status |
|---|---|---|---|---|
| TITANE_CHAT | `chat_get_providers_status` | core | `overdrive/chat_orchestrator.rs` | EXISTS |
| TITANE_CHAT | `chat_get_memory_stats` | agent-chat | `overdrive/chat_orchestrator.rs` | EXISTS |
| ADMIN_SYSTEM | `get_system_health` | core, admin-dev | `mock_commands.rs` | EXISTS |
| ADMIN_SYSTEM | `cp_get_system_info` | core | `control_panel_commands.rs` | EXISTS |
| ADMIN_CONFIG | `cp_get_ai_config` | admin-dev | `control_panel_commands.rs` | EXISTS |
| MEMORY | `memory_get_state` | core | `commands/unified_memory_commands.rs` | EXISTS |
| TIME | `read_snapshot` | core | `mock_commands.rs` | EXISTS |
| TIME | `get_timeline` | core | `mock_commands.rs` | EXISTS |
| KNOWLEDGE | `get_knowledge` | utility | TBD | BLOCKED_BY_RUNTIME if absent |
| PERFORMANCE | `performance_get_metrics` | utility | capabilities | EXISTS |
| AUTH | `oauth_facebook_initiate` | IPC guard fix | `auth/commands.rs` | EXISTS (now in tauri.conf.json) |
| AUTH | `oauth_facebook_callback` | IPC guard fix | `auth/commands.rs` | EXISTS (now in tauri.conf.json) |
| AUTH | `oauth_facebook_get_profile` | IPC guard fix | `auth/commands.rs` | EXISTS (now in tauri.conf.json) |
| AUTH | `oauth_facebook_logout` | IPC guard fix | `auth/commands.rs` | EXISTS (now in tauri.conf.json) |

## Classification Vocabulary

| Class | Meaning |
|---|---|
| `BACKEND_FLOW_PROVEN` | IPC call succeeded or UI state reflects live backend |
| `BACKEND_LOCAL_PROVIDER_PROVEN` | Local Ollama provider visible (chat context) |
| `BACKEND_READ_ONLY_PROVEN` | Page loaded, no ErrorBoundary, read-only safe |
| `BACKEND_GUARDED_PROVEN` | Sensitive action present but guarded/masked — explicitly not executed |
| `BACKEND_DEGRADED_EXPECTED` | Backend unavailable — classified as expected, not a failure |
| `BACKEND_SIMULATED_CONFIRMED` | Content is simulated/mock — confirmed, classified as expected |
| `BACKEND_DISPLAY_ONLY_CONFIRMED` | Static display, no live backend signal, confirmed |
| `BACKEND_BLOCKED_BY_RUNTIME` | Tauri IPC unavailable at runtime context |
| `BACKEND_BLOCKED_BY_PROVIDER` | Provider (Ollama) not reachable |
| `BACKEND_BLOCKED_BY_NETWORK` | Network blocked by One Door governance |
| `BACKEND_FAIL` | ErrorBoundary triggered or hard assert failed (secrets in DOM) |
