# TITANE Desktop Action Classification v50

Generated: 2026-05-16T04:43:30.675Z  

## Safe Action Policy Definitions

| Policy | Description |
|---|---|
| SAFE_CLICK | Click is safe — no mutation, no network, no secret |
| READ_ONLY_CLICK | Display/read-only — no state change expected |
| FORM_INPUT_SAFE | Form input — non-destructive, no secret |
| TEMP_DIR_ONLY | File operation using temp dir only |
| GUARDED_CLICK | Protected by enabled/disabled state |
| REQUIRES_CONFIRMATION | Destructive — requires confirm dialog before execution |
| REQUIRES_SECRET_SKIP | Involves secret/key/token — skip in E2E; classify only |
| DESTRUCTIVE_SKIP_WITH_PROOF | Destructive operation — skip + document guard proof |
| EXTERNAL_NETWORK_SKIP_WITH_PROOF | External network call — skip unless mock/local provider |
| NOT_WIRED_EXPECTED | Frontend handler not yet wired — expected no-op |
| FALLBACK_EXPECTED | Backend may be unavailable — fallback UI expected |
| DEGRADED_EXPECTED | Degraded state expected — test degraded banner, not live data |

## Action Inventory per Route

| Route | Action | Label | Wiring | Policy | Sensitive? | IPC Command |
|---|---|---|---|---|---|---|
| /titane | send_message | Send message | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | ai_get_response |
| /titane | switch_provider | Switch AI provider | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | ai_set_model |
| /titane | analyze_image | Analyze image | WIRED_FALLBACK | FALLBACK_EXPECTED | No | analyze_image |
| /titane | switch_tab | Switch tab | DISPLAY_ONLY | READ_ONLY_CLICK | No | - |
| /experience | read_progression | Read XP state | DISPLAY_ONLY | READ_ONLY_CLICK | No | - |
| /time | read_time_context | Read time context | WIRED_LIVE | SAFE_CLICK | No | agenda_load_events |
| /time | save_event | Save agenda event | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | agenda_save_event |
| /time | delete_event | Delete agenda event | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | agenda_delete_event |
| /time | restore_snapshot | Restore snapshot | WIRED_FALLBACK | REQUIRES_CONFIRMATION | ⚠️ YES | restore_snapshot |
| /time | force_snapshot | Force snapshot | WIRED_FALLBACK | FALLBACK_EXPECTED | No | force_snapshot |
| /admin | load_panels | Load admin panels | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /admin | audio_devices | List audio devices | WIRED_LIVE | SAFE_CLICK | No | audio_list_devices |
| /admin | check_ollama | Check Ollama status | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | ai_check_ollama_status |
| /dev | refresh_dev_state | Refresh dev state | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /dev | run_autofix | Run autofix | WIRED_LIVE | SAFE_CLICK | No | autofix_fix_all |
| /fusion | refresh_fusion | Refresh fusion state | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /optimization | refresh_metrics | Refresh performance metrics | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /total-dev | dev_chat | Dev AI chat | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | ai_generate_local_stream |
| /orchestration-intelligence | switch_tab | Switch tab | DISPLAY_ONLY | READ_ONLY_CLICK | No | - |
| /orchestration-center | get_orchestrator_state | Get orchestrator state | WIRED_FALLBACK | FALLBACK_EXPECTED | No | orchestrator_get_state |
| /orchestration-center | run_cycle | Run orchestration cycle | WIRED_FALLBACK | FALLBACK_EXPECTED | No | orchestrator_run_cycle |
| /reality-center | render_frame | Render frame | WIRED_FALLBACK | FALLBACK_EXPECTED | No | reality_render_frame |
| /reality-center | toggle_physics | Toggle physics | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /hyper-center | think | Hyper Think | WIRED_FALLBACK | FALLBACK_EXPECTED | No | hyper_think |
| /hyper-center | reason | Hyper Reason | WIRED_FALLBACK | FALLBACK_EXPECTED | No | hyper_reason |
| /quantum-center | toggle_runtime | Toggle quantum runtime UI | DISPLAY_ONLY | READ_ONLY_CLICK | No | - |
| /twins | load_twins | Load twins page | DISPLAY_ONLY | READ_ONLY_CLICK | No | - |
| /cloud | get_status | Get cloud status | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | cloud_get_status |
| /cloud | sync_push | Sync push | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | cloud_sync_push |
| /cloud | sync_pull | Sync pull | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | cloud_sync_pull |
| /cloud | verify_integrity | Verify integrity | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ⚠️ YES | cloud_verify_integrity |
| /memory | read_memory | Read memory entries | WIRED_LIVE | SAFE_CLICK | No | persistent_memory_read |
| /memory | write_entry | Write memory entry | WIRED_LIVE | SAFE_CLICK | No | persistent_memory_write_entry |
| /memory | delete_entry | Delete memory entry | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | persistent_memory_delete_entry |
| /memory | get_stats | Get memory stats | WIRED_LIVE | SAFE_CLICK | No | persistent_memory_get_stats |
| /research | run_research | Run web research | WIRED_LIVE | SAFE_CLICK | No | web_research |
| /multiproject | create_project | Create project | WIRED_LIVE | SAFE_CLICK | No | - |
| /multiproject | refresh_health | Refresh project health | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /multiproject | assign_agent | Assign agent to project | WIRED_LIVE | SAFE_CLICK | No | - |
| /doc-center | export_docx | Export DOCX | WIRED_LIVE | REQUIRES_CONFIRMATION | ⚠️ YES | export_docx_file |
| /singularity | get_state | Get singularity state | WIRED_FALLBACK | FALLBACK_EXPECTED | No | singularity_get_state |
| /sentinel | subscribe | Subscribe sentinel events | WIRED_FALLBACK | FALLBACK_EXPECTED | No | sentinel_subscribe |
| /watchdog | subscribe | Subscribe watchdog events | WIRED_FALLBACK | FALLBACK_EXPECTED | No | watchdog_subscribe |
| /selfheal | subscribe | Subscribe selfheal events | WIRED_FALLBACK | FALLBACK_EXPECTED | No | selfheal_subscribe |
| /adaptive | subscribe | Subscribe adaptive events | WIRED_FALLBACK | FALLBACK_EXPECTED | No | adaptive_subscribe |
| /skills | list_skills | List skills | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /skills | activate_skill | Activate skill | WIRED_FALLBACK | FALLBACK_EXPECTED | No | - |
| /knowledge | knowledge_refresh | Refresh knowledge | TEMPLATE_ONLY | SAFE_CLICK | No | - |
| /creation | creation_refresh | Refresh creation | TEMPLATE_ONLY | SAFE_CLICK | No | - |
| /evolution | evolution_refresh | Refresh evolution | TEMPLATE_ONLY | SAFE_CLICK | No | - |
| /performance | run_probe | Run performance probe | TEMPLATE_ONLY | SAFE_CLICK | No | - |
