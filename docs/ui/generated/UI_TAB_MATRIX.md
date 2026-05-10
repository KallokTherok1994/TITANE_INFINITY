# UI Tab Matrix
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- Source: src/registry/uiSurfaceRegistry.ts -->
<!-- Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46 -->
<!-- Generation date: 2025-07 -->

> Tab status reflects static classification. `LIVE_*` tabs require runtime proof.
> Missing testId = NOT_COMPLIANT for Rule 16.

## /titane — Dashboard Tabs

| TabId | Label | TestId | Status | Truth Class | Backend Commands |
|---|---|---|---|---|---|
| `conversation` | Conversation | `tab-conversation` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | ai_get_response, ai_generate_local_stream, ai_send_prompt |
| `overview` | Overview | `tab-overview` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `vision` | Vision | `tab-vision` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | analyze_image, analyze_image_path |
| `memory` | Memory | `tab-memory` | ACTIVE_PARTIAL | LIVE_TAURI_SERVICE_BRIDGE | persistent_memory_read, persistent_memory_get_stats |
| `progression` | Progression | `tab-progression` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `transformation` | Transformation | `tab-transformation` | ACTIVE_PARTIAL | LIVE_TAURI | memory_get_clusters, memory_get_status, persistent_memory_get_stats |

## /time — Time Tabs

| TabId | Label | TestId | Status | Truth Class | Backend Commands |
|---|---|---|---|---|---|
| `now` | Now | `tab-time-now` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | get_time_info |
| `agenda` | Agenda | `tab-time-agenda` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `timeline` | Timeline | `tab-time-timeline` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `snapshots` | Snapshots | `tab-time-snapshots` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `cognitive` | Cognitive | `tab-time-cognitive` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |

## /admin — Admin Tabs

| TabId | Label | TestId | Status | Truth Class | Backend Commands |
|---|---|---|---|---|---|
| `system` | System | `tab-admin-system` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | get_system_info |
| `config` | Configuration | `tab-admin-config` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | get_config |
| `audio` | Audio | `tab-admin-audio` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | get_audio_config, set_audio_config |
| `design` | Design | `tab-admin-design` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `governance` | Governance | `tab-admin-governance` | ACTIVE_PARTIAL | MIXED_LIVE_AND_STATIC | *(none)* |
| `production-health` | Production Health | `tab-admin-production-health` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | check_backend_health |

## /dev — Dev Tabs

| TabId | Label | TestId | Status | Truth Class | Backend Commands |
|---|---|---|---|---|---|
| `overview` | Overview | `tab-dev-overview` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `diagnostics` | Diagnostics | `tab-dev-diagnostics` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | get_diagnostics |
| `operations` | Operations | `tab-dev-operations` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `validation` | Validation | `tab-dev-validation` | ACTIVE_PARTIAL | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `security` | Security | `tab-dev-security` | ACTIVE_PARTIAL | LIVE_TAURI_GOVERNED | *(none)* |

## Surfaces without tabs (or tabs not yet registered)

Routes classified as SIMULATED_UI or DISPLAY_ONLY have no live tab matrix:
- `/orchestration-intelligence` — SIMULATED_UI, 7 visual tabs (no backend wiring)
- `/quantum-center` — SIMULATED_UI, 8 visual tabs (no backend wiring)
- `/performance` — DISPLAY_ONLY
- All other routes — tabs exist but not yet registered in static registry (sprint backlog)
