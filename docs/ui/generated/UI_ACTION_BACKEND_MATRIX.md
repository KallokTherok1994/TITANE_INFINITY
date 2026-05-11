# UI Action → Backend Matrix
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- GENERATED_FROM: src/registry/uiSurfaceRegistry.ts -->
<!-- Generation date: 2026-05-11 -->
<!-- Mission: UI_BACKEND_RUNTIME_PROMOTION_v47 -->

> Actions classified as NOT_WIRED or DISPLAY_ONLY have no IPC backend connection.
> WIRED_LIVE requires IPC command verification against docs/IPC_CATALOG.md or src/lib/security.ts.

## Wiring Status Key

| Status | Meaning |
|---|---|
| WIRED_LIVE | Connected to verified IPC command |
| WIRED_FALLBACK | Connected; graceful degradation if backend fails |
| TEMPLATE_ONLY | Action UI exists, no backend wiring yet |
| DISPLAY_ONLY | Read-only display; no action |
| BLOCKED_BY_RUNTIME | Would wire but runtime unavailable |
| BLOCKED_BY_PERMISSION | Gate/permission prevents action |
| NOT_WIRED | No backend connection at all |
| DEPRECATED | Action deprecated |

## /titane — TitanePage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `send_message` | Send message | **WIRED_LIVE** | ai_get_response |  |
| `switch_provider` | Switch AI provider | **WIRED_LIVE** | ai_set_model |  |
| `analyze_image` | Analyze image | **WIRED_FALLBACK** | analyze_image |  |
| `switch_tab` | Switch tab | **DISPLAY_ONLY** | *(none)* |  |

## /experience — Experience

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `read_progression` | Read XP state | **DISPLAY_ONLY** | *(none)* |  |

## /time — TimePage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `read_time_context` | Read time context | **WIRED_LIVE** | agenda_load_events |  |
| `save_event` | Save agenda event | **WIRED_LIVE** | agenda_save_event |  |
| `delete_event` | Delete agenda event | **WIRED_LIVE** | agenda_delete_event |  |
| `restore_snapshot` | Restore snapshot | **WIRED_FALLBACK** | restore_snapshot |  |
| `force_snapshot` | Force snapshot | **WIRED_FALLBACK** | force_snapshot |  |

## /admin — AdminPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `load_panels` | Load admin panels | **WIRED_FALLBACK** | *(none)* |  |
| `audio_devices` | List audio devices | **WIRED_LIVE** | audio_list_devices |  |
| `check_ollama` | Check Ollama status | **WIRED_LIVE** | ai_check_ollama_status |  |

## /dev — DevPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `refresh_dev_state` | Refresh dev state | **WIRED_FALLBACK** | *(none)* |  |
| `run_autofix` | Run autofix | **WIRED_LIVE** | autofix_fix_all |  |

## /fusion — PerfectFusionDashboard

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `refresh_fusion` | Refresh fusion state | **WIRED_FALLBACK** | *(none)* |  |

## /optimization — UltimateOptimizationDashboard

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `refresh_metrics` | Refresh performance metrics | **WIRED_FALLBACK** | *(none)* |  |

## /total-dev — TotalDevPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `dev_chat` | Dev AI chat | **WIRED_LIVE** | ai_generate_local_stream | Uses qwen2.5-coder, not PROD model |

## /orchestration-intelligence — OrchestrationIntelligenceCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `switch_tab` | Switch tab | **DISPLAY_ONLY** | *(simulated)* | SIMULATED — no real IPC |

## /orchestration-center — OrchestrationMetaCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `get_orchestrator_state` | Get orchestrator state | **WIRED_FALLBACK** | orchestrator_get_state |  |
| `run_cycle` | Run orchestration cycle | **WIRED_FALLBACK** | orchestrator_run_cycle |  |

## /reality-center — RealityCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `render_frame` | Render frame | **WIRED_FALLBACK** | reality_render_frame |  |
| `toggle_physics` | Toggle physics | **WIRED_FALLBACK** | *(none)* |  |

## /hyper-center — HyperCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `think` | Hyper Think | **WIRED_FALLBACK** | hyper_think |  |
| `reason` | Hyper Reason | **WIRED_FALLBACK** | hyper_reason |  |

## /quantum-center — QuantumCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `toggle_runtime` | Toggle quantum runtime UI | **DISPLAY_ONLY** | *(simulated)* | SIMULATED — no real IPC |

## /twins — TwinsPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `load_twins` | Load twins page | **DISPLAY_ONLY** | *(none)* |  |

## /cloud — CloudCenter

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `get_status` | Get cloud status | **WIRED_LIVE** | cloud_get_status |  |
| `sync_push` | Sync push | **WIRED_LIVE** | cloud_sync_push | Requires passphrase initialization |
| `sync_pull` | Sync pull | **WIRED_LIVE** | cloud_sync_pull | Requires passphrase initialization |
| `verify_integrity` | Verify integrity | **WIRED_LIVE** | cloud_verify_integrity |  |

## /memory — Memory

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `read_memory` | Read memory entries | **WIRED_LIVE** | persistent_memory_read |  |
| `write_entry` | Write memory entry | **WIRED_LIVE** | persistent_memory_write_entry |  |
| `delete_entry` | Delete memory entry | **WIRED_LIVE** | persistent_memory_delete_entry |  |
| `get_stats` | Get memory stats | **WIRED_LIVE** | persistent_memory_get_stats |  |

## /research — ResearchPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `run_research` | Run web research | **WIRED_LIVE** | web_research | Governed; can be blocked by policy or missing credentials |

## /doc-center — DocCenterPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `export_docx` | Export DOCX | **WIRED_LIVE** | export_docx_file | Browser mode shows visible IPC error |

## /singularity — SingularityMonitor

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `get_state` | Get singularity state | **WIRED_FALLBACK** | singularity_get_state |  |

## /sentinel — Sentinel

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `subscribe` | Subscribe sentinel events | **WIRED_FALLBACK** | sentinel_subscribe |  |

## /watchdog — Watchdog

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `subscribe` | Subscribe watchdog events | **WIRED_FALLBACK** | watchdog_subscribe |  |

## /selfheal — SelfHeal

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `subscribe` | Subscribe selfheal events | **WIRED_FALLBACK** | selfheal_subscribe |  |

## /adaptive — AdaptiveEngine

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `subscribe` | Subscribe adaptive events | **WIRED_FALLBACK** | adaptive_subscribe |  |

## /skills — SkillManager

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `list_skills` | List skills | **WIRED_FALLBACK** | *(none)* |  |
| `activate_skill` | Activate skill | **WIRED_FALLBACK** | *(none)* |  |

## /knowledge — KnowledgeFusionPage

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `knowledge_refresh` | Refresh knowledge | **TEMPLATE_ONLY** | *(none)* |  |

## /creation — CreationStudio

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `creation_refresh` | Refresh creation | **TEMPLATE_ONLY** | *(none)* |  |

## /evolution — EvolutionMonitor

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `evolution_refresh` | Refresh evolution | **TEMPLATE_ONLY** | *(none)* |  |

## /performance — PerformanceTest

| ActionId | Label | Wiring | Backend Commands | Notes |
|---|---|---|---|---|
| `run_probe` | Run performance probe | **TEMPLATE_ONLY** | *(none)* |  |

## Summary

| Metric | Count |
|---|---|
| Total actions | 48 |
| WIRED_LIVE | 19 |
| NOT_WIRED | 0 |
| Surfaces with no registered actions | 1 |
