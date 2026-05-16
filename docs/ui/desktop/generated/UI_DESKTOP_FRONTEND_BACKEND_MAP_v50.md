# TITANE Desktop Frontend/Backend Action Map v50

Generated: 2026-05-16T04:43:30.675Z  
Mission: UI_DESKTOP_FULL_COVERAGE_v50

> Mapping from visible UI actions to IPC commands. Source: uiSurfaceRegistry + docs/IPC_CATALOG.md.
> Unmapped actions are marked UNMAPPED_HANDLER.

## All Actions Mapped

| Route | Tab | Label | data-testid | IPC Command | Wiring | Policy | Desktop Test |
|---|---|---|---|---|---|---|---|
| /titane | - | Send message | send_message | ai_get_response | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /titane | - | Switch AI provider | switch_provider | ai_set_model | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /titane | - | Analyze image | analyze_image | analyze_image | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /titane | - | Switch tab | switch_tab | N/A (display only) | DISPLAY_ONLY | READ_ONLY_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /experience | - | Read XP state | read_progression | N/A (display only) | DISPLAY_ONLY | READ_ONLY_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /time | - | Read time context | read_time_context | agenda_load_events | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /time | - | Save agenda event | save_event | agenda_save_event | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /time | - | Delete agenda event | delete_event | agenda_delete_event | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /time | - | Restore snapshot | restore_snapshot | restore_snapshot | WIRED_FALLBACK | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /time | - | Force snapshot | force_snapshot | force_snapshot | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /admin | - | Load admin panels | load_panels | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /admin | - | List audio devices | audio_devices | audio_list_devices | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /admin | - | Check Ollama status | check_ollama | ai_check_ollama_status | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /dev | - | Refresh dev state | refresh_dev_state | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /dev | - | Run autofix | run_autofix | autofix_fix_all | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /fusion | - | Refresh fusion state | refresh_fusion | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /optimization | - | Refresh performance metrics | refresh_metrics | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /total-dev | - | Dev AI chat | dev_chat | ai_generate_local_stream | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /orchestration-intelligence | - | Switch tab | switch_tab | N/A (display only) | DISPLAY_ONLY | READ_ONLY_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /orchestration-center | - | Get orchestrator state | get_orchestrator_state | orchestrator_get_state | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /orchestration-center | - | Run orchestration cycle | run_cycle | orchestrator_run_cycle | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /reality-center | - | Render frame | render_frame | reality_render_frame | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /reality-center | - | Toggle physics | toggle_physics | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /hyper-center | - | Hyper Think | think | hyper_think | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /hyper-center | - | Hyper Reason | reason | hyper_reason | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /quantum-center | - | Toggle quantum runtime UI | toggle_runtime | N/A (display only) | DISPLAY_ONLY | READ_ONLY_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /twins | - | Load twins page | load_twins | N/A (display only) | DISPLAY_ONLY | READ_ONLY_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /cloud | - | Get cloud status | get_status | cloud_get_status | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /cloud | - | Sync push | sync_push | cloud_sync_push | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /cloud | - | Sync pull | sync_pull | cloud_sync_pull | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /cloud | - | Verify integrity | verify_integrity | cloud_verify_integrity | WIRED_LIVE | EXTERNAL_NETWORK_SKIP_WITH_PROOF | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /memory | - | Read memory entries | read_memory | persistent_memory_read | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /memory | - | Write memory entry | write_entry | persistent_memory_write_entry | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /memory | - | Delete memory entry | delete_entry | persistent_memory_delete_entry | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /memory | - | Get memory stats | get_stats | persistent_memory_get_stats | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /research | - | Run web research | run_research | web_research | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /multiproject | - | Create project | create_project | UNMAPPED_HANDLER | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /multiproject | - | Refresh project health | refresh_health | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /multiproject | - | Assign agent to project | assign_agent | UNMAPPED_HANDLER | WIRED_LIVE | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /doc-center | - | Export DOCX | export_docx | export_docx_file | WIRED_LIVE | REQUIRES_CONFIRMATION | ui-desktop-sensitive-actions-guarded.wdio.test.js |
| /singularity | - | Get singularity state | get_state | singularity_get_state | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /sentinel | - | Subscribe sentinel events | subscribe | sentinel_subscribe | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /watchdog | - | Subscribe watchdog events | subscribe | watchdog_subscribe | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /selfheal | - | Subscribe selfheal events | subscribe | selfheal_subscribe | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /adaptive | - | Subscribe adaptive events | subscribe | adaptive_subscribe | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /skills | - | List skills | list_skills | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /skills | - | Activate skill | activate_skill | UNMAPPED_HANDLER | WIRED_FALLBACK | FALLBACK_EXPECTED | ui-desktop-safe-actions.wdio.test.js |
| /knowledge | - | Refresh knowledge | knowledge_refresh | UNMAPPED_HANDLER | TEMPLATE_ONLY | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /creation | - | Refresh creation | creation_refresh | UNMAPPED_HANDLER | TEMPLATE_ONLY | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /evolution | - | Refresh evolution | evolution_refresh | UNMAPPED_HANDLER | TEMPLATE_ONLY | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |
| /performance | - | Run performance probe | run_probe | UNMAPPED_HANDLER | TEMPLATE_ONLY | SAFE_CLICK | ui-desktop-safe-actions.wdio.test.js |

## Backend Commands per Route

| Route | Backend Commands | Source |
|---|---|---|
| /titane | ai_get_response, ai_generate_local_stream, ai_send_prompt | uiSurfaceRegistry |
| /experience | - | uiSurfaceRegistry |
| /time | read_time_runtime_context | uiSurfaceRegistry |
| /admin | audio_list_devices, analyze_audio | uiSurfaceRegistry |
| /dev | ai_check_ollama_status, autofix_detect_typescript_errors | uiSurfaceRegistry |
| /fusion | ai_check_ollama_status | uiSurfaceRegistry |
| /optimization | - | uiSurfaceRegistry |
| /total-dev | ai_get_response, ai_generate_local_stream | uiSurfaceRegistry |
| /orchestration-intelligence | - | uiSurfaceRegistry |
| /orchestration-center | orchestrator_get_state, orchestrator_set_mode, orchestrator_run_cycle | uiSurfaceRegistry |
| /reality-center | reality_get_state, reality_render_frame, reality_set_config | uiSurfaceRegistry |
| /hyper-center | hyper_think, hyper_reason, hyper_imagine, hyper_generate_insight | uiSurfaceRegistry |
| /quantum-center | - | uiSurfaceRegistry |
| /twins | - | uiSurfaceRegistry |
| /cloud | cloud_get_status, cloud_sync_push, cloud_sync_pull, cloud_verify_integrity | uiSurfaceRegistry |
| /memory | persistent_memory_read, persistent_memory_get_stats, persistent_memory_write_entry, persistent_memory_delete_entry | uiSurfaceRegistry |
| /research | web_research | uiSurfaceRegistry |
| /multiproject | - | uiSurfaceRegistry |
| /doc-center | export_docx_file | uiSurfaceRegistry |
| /singularity | singularity_get_state, singularity_sync_state | uiSurfaceRegistry |
| /sentinel | sentinel_subscribe | uiSurfaceRegistry |
| /watchdog | watchdog_subscribe | uiSurfaceRegistry |
| /selfheal | selfheal_subscribe | uiSurfaceRegistry |
| /adaptive | adaptive_subscribe, adaptive_get_profile, adaptive_get_summary | uiSurfaceRegistry |
| /skills | list_skills, activate_skill, deactivate_skill, install_skill | uiSurfaceRegistry |
| /knowledge | - | uiSurfaceRegistry |
| /creation | - | uiSurfaceRegistry |
| /evolution | - | uiSurfaceRegistry |
| /performance | - | uiSurfaceRegistry |
| /htf | - | uiSurfaceRegistry |
