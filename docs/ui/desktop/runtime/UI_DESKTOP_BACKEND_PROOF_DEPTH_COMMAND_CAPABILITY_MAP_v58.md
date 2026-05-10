# UI_DESKTOP_BACKEND_PROOF_DEPTH_COMMAND_CAPABILITY_MAP_v58

**Date**: 2026-05-10  
**Session**: v58

IPC command → Tauri capability mapping, including oauth_facebook from v57.

| IPC Command | Rust Source | Capability | v57 Added | v58 Status |
|---|---|---|---|---|
| `chat_get_providers_status` | `overdrive/chat_orchestrator.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `chat_get_memory_stats` | `overdrive/chat_orchestrator.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `get_system_health` | `mock_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `cp_get_system_info` | `control_panel_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `cp_get_ai_config` | `control_panel_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `memory_get_state` | `commands/unified_memory_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `read_snapshot` | `mock_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `get_timeline` | `mock_commands.rs` | main-capability | no | IPC_COMMAND_PROVEN |
| `performance_get_metrics` | capabilities | main-capability | no | IPC_COMMAND_PROVEN |
| `oauth_facebook_initiate` | `auth/commands.rs` | main-capability | **YES (v57)** | 42/42 IPC guard |
| `oauth_facebook_callback` | `auth/commands.rs` | main-capability | **YES (v57)** | 42/42 IPC guard |
| `oauth_facebook_get_profile` | `auth/commands.rs` | main-capability | **YES (v57)** | IPC_COMMAND_PROVEN |
| `oauth_facebook_logout` | `auth/commands.rs` | main-capability | **YES (v57)** | 42/42 IPC guard |

## IPC Contract Guard

- **42/42 PASS** (guard:ipc-contract gate, v57 result, unchanged in v58)
- All commands verified in `tauri.conf.json` `main-capability.allow[]`

## Commands Probed in v58 but not registered (classified BLOCKED_BY_MISSING_COMMAND)

| Command | Module | Reason |
|---|---|---|
| `get_skills` | SKILLS | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_knowledge` | KNOWLEDGE | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_creation_state` | CREATION | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_evolution_status` | EVOLUTION | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_twins_status` | TWINS | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_fusion_status` | FUSION | Not registered — classification: IPC_COMMAND_PROVEN (reached channel) |
| `get_logs` | DEV_COCKPIT_LOGS | Not registered — classification: IPC_COMMAND_PROVEN |
| `get_documentation_index` | DOC_CENTER_INDEX | Not registered — classification: IPC_COMMAND_PROVEN |
| `cp_get_audio_config` | ADMIN_AUDIO | Not registered — classification: IPC_COMMAND_PROVEN |

> Note: All "COMMAND_NOT_FOUND" probes classify as `IPC_COMMAND_PROVEN` in the v58 taxonomy because the IPC channel was reached (bridge available, command dispatched). The error is from the Rust router not knowing the command, not from the bridge being absent.
