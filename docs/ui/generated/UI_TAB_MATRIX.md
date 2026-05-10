# UI Tab Matrix
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- GENERATED_FROM: src/registry/uiSurfaceRegistry.ts -->
<!-- Generation date: 2026-05-10 -->
<!-- Mission: UI_BACKEND_RUNTIME_PROMOTION_v47 -->

> Tab status reflects static classification. `LIVE_*` tabs require runtime proof.
> Missing testId = NOT_COMPLIANT for Rule 16.

## /titane — TitanePage

| TabId | Label | TestId | Truth Class | Backend Commands |
|---|---|---|---|---|
| `conversation` | Conversation | `tab-conversation` | MIXED_LIVE_AND_STATIC | ai_get_response, ai_generate_local_stream, ai_send_prompt |
| `overview` | Overview | `tab-overview` | MIXED_LIVE_AND_STATIC | *(none)* |
| `vision` | Vision | `tab-vision` | LIVE_TAURI_WITH_FALLBACK | analyze_image, analyze_image_path |
| `memory` | Memory | `tab-memory` | LIVE_TAURI_SERVICE_BRIDGE | persistent_memory_read, persistent_memory_get_stats |
| `progression` | Progression | `tab-progression` | MIXED_LIVE_AND_STATIC | *(none)* |
| `transformation` | Transformation | `tab-transformation` | LIVE_TAURI | memory_get_clusters, memory_get_status, persistent_memory_get_stats |

## /time — TimePage

| TabId | Label | TestId | Truth Class | Backend Commands |
|---|---|---|---|---|
| `time-now` | Now | `tab-time-now` | MIXED_LIVE_AND_STATIC | read_time_runtime_context |
| `time-agenda` | Agenda | `tab-time-agenda` | LIVE_TAURI_WITH_FALLBACK | agenda_load_events, agenda_save_event, agenda_delete_event, agenda_sync |
| `time-timeline` | Timeline | `tab-time-timeline` | MIXED_LIVE_AND_STATIC | *(none)* |
| `time-snapshots` | Snapshots | `tab-time-snapshots` | LIVE_TAURI_WITH_FALLBACK | list_snapshots, restore_snapshot, delete_snapshot, force_snapshot |
| `time-cognitive` | Cognitive | `tab-time-cognitive` | MIXED_LIVE_AND_STATIC | *(none)* |

## /admin — AdminPage

| TabId | Label | TestId | Truth Class | Backend Commands |
|---|---|---|---|---|
| `admin-system` | System | `tab-admin-system` | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | *(none)* |
| `admin-config` | Config | `tab-admin-config` | LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | *(none)* |
| `admin-audio` | Audio | `tab-admin-audio` | LIVE_TAURI_WITH_FALLBACK | audio_list_devices, analyze_audio |
| `admin-design` | Design | `tab-admin-design` | STATIC_CURATED | *(none)* |
| `admin-governance` | Governance | `tab-admin-governance` | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `admin-production-health` | Production Health | `tab-admin-production-health` | LIVE_TAURI_WITH_FALLBACK | ai_check_ollama_status |

## /dev — DevPage

| TabId | Label | TestId | Truth Class | Backend Commands |
|---|---|---|---|---|
| `dev-overview` | Overview | `tab-dev-overview` | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `dev-diagnostics` | Diagnostics | `tab-dev-diagnostics` | LIVE_TAURI_WITH_FALLBACK | ai_check_ollama_status, autofix_detect_typescript_errors |
| `dev-operations` | Operations | `tab-dev-operations` | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `dev-validation` | Validation | `tab-dev-validation` | LIVE_TAURI_WITH_FALLBACK | *(none)* |
| `dev-security` | Security | `tab-dev-security` | LIVE_TAURI_WITH_FALLBACK | *(none)* |

## Summary

- Total surfaces with registered tabs: 4 / 29
- Total registered tabs: 22
