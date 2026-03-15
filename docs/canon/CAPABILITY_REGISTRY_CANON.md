# CAPABILITY_REGISTRY_CANON.md — Registre Canonique des Capacités

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Source of Truth:** `src-tauri/src/main.rs` invoke_handler
**Total Prouvé:** 401 commandes registered (SHA c59e9b5b3, Python parse stash-confirmé) / 408 actuel (+ AUDIO patches)
**Classification:** CANON

> AVERTISSEMENT : "registered" ≠ "fully implemented and stable"
> proof_type = CODE uniquement pour toutes les entrées ci-dessous.
> cargo check non exécuté cette session.

---

## A. Boot / State Bridge — 7 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type |
|--------------|----------|--------------|-------------|------------|
| CAP-BOOT-001 | `ping` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-002 | `get_system_state` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-003 | `get_module_health` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-004 | `system_get_status` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-005 | `get_state` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-006 | `set_state` | `state_bridge_commands` | PROVEN | CODE |
| CAP-BOOT-007 | `delete_state` | `state_bridge_commands` | PROVEN | CODE |

## B. Database / Persistance Option1 (libSQL) — 8 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type |
|--------------|----------|--------------|-------------|------------|
| CAP-DB-001 | `db_put_event` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-002 | `db_get_stream` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-003 | `db_put_snapshot` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-004 | `db_get_snapshot` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-005 | `db_kv_set` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-006 | `db_kv_get` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-007 | `db_sync_now` | `commands::db_commands` | PROVEN | CODE |
| CAP-DB-008 | `db_sync_status` | `commands::db_commands` | PROVEN | CODE |

## C. Core Messaging — 2 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type |
|--------------|----------|--------------|-------------|------------|
| CAP-MSG-001 | `send_message` | `main.rs` inline | PROVEN | CODE |
| CAP-MSG-002 | `ollama_query` | `ollama::query_ollama` | PROVEN | CODE |

## D. Conversation Engine OMEGA v19.5.2 — 5 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type |
|--------------|----------|--------------|-------------|------------|
| CAP-CONV-001 | `create_new_conversation` | `conversation_engine::commands` | PROVEN | CODE |
| CAP-CONV-002 | `conversation_generate` | `conversation_engine::commands` | PROVEN | CODE |
| CAP-CONV-003 | `conversation_process_message` | `conversation_engine::commands` | PROVEN | CODE |
| CAP-CONV-004 | `conversation_health_check` | `conversation_engine::commands` | PROVEN | CODE |
| CAP-CONV-005 | `conversation_memory_stats` | `conversation_engine::commands` | PROVEN | CODE |

> Note : `chat_send_message` retiré en v27.0.5-prod. Utiliser `conversation_generate`.

## E. Chat Orchestrator v21 + R04 Memory — 8 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type |
|--------------|----------|--------------|-------------|------------|
| CAP-CHAT-001 | `chat_stream_message` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-002 | `chat_get_providers_status` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-003 | `chat_check_providers` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-004 | `chat_get_conversation` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-005 | `chat_create_conversation` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-006 | `chat_delete_conversation` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-007 | `chat_generate_suggestions` | `overdrive::chat_orchestrator` | PROVEN | CODE |
| CAP-CHAT-008 | `chat_get_memory_stats` | `overdrive::chat_orchestrator` | PROVEN | CODE |

## F. Diagnostic + Web Research + Telemetry — 3 commandes

| Capability_ID | Commande | Module Source | Real_Status | Proof_Type | Notes |
|--------------|----------|--------------|-------------|------------|-------|
| CAP-DIAG-001 | `check_online_capabilities` | `diagnostic_commands` | PROVEN | CODE | |
| CAP-WEBR-001 | `web_research` | `web_research_commands` | PROVEN | CODE | STUB — no real network |
| CAP-TELE-001 | `read_production_week1_csv` | `api::telemetry_api` | PROVEN | CODE | |

## G. Voice Engine v21 REPAIR — 17 commandes

| Capability_ID | Commande | Real_Status | Proof_Type |
|--------------|----------|-------------|------------|
| CAP-VOICE-001 | `voice_start_listening` | PROVEN | CODE |
| CAP-VOICE-002 | `voice_stop_listening` | PROVEN | CODE |
| CAP-VOICE-003 | `voice_cancel_recording` | PROVEN | CODE |
| CAP-VOICE-004 | `voice_is_recording` | PROVEN | CODE |
| CAP-VOICE-005 | `voice_transcribe_audio` | PROVEN | CODE |
| CAP-VOICE-006 | `voice_get_status` | PROVEN | CODE |
| CAP-VOICE-007 | `voice_get_config` | PROVEN | CODE |
| CAP-VOICE-008 | `voice_update_config` | PROVEN | CODE |
| CAP-VOICE-009 | `voice_play_audio` | PROVEN | CODE |
| CAP-VOICE-010 | `voice_stop_speaking` | PROVEN | CODE |
| CAP-VOICE-011 | `voice_test_pipeline` | PROVEN | CODE |
| CAP-VOICE-012 | `voice_calibrate_microphone` | PROVEN | CODE |
| CAP-VOICE-013 | `voice_detect_wake_word` | PROVEN | CODE |
| CAP-VOICE-014 | `voice_get_available_models` | PROVEN | CODE |
| CAP-VOICE-015 | `voice_enable_duplex` | PROVEN | CODE |
| CAP-VOICE-016 | `voice_disable_duplex` | PROVEN | CODE |
| CAP-VOICE-017 | `voice_check_interruption` | PROVEN | CODE |

> Note : `voice_synthesize_speech` deprecated — utiliser `speak()` dans ai_chat.rs.

## H. Avatar Engine v23 — 10 commandes

| Capability_ID | Commande | Real_Status | Proof_Type |
|--------------|----------|-------------|------------|
| CAP-AVT-001 | `avatar_prepare_speech` | PROVEN | CODE |
| CAP-AVT-002 | `avatar_finish_speech` | PROVEN | CODE |
| CAP-AVT-003 | `avatar_enable_immersion` | PROVEN | CODE |
| CAP-AVT-004 | `avatar_on_wake_word` | PROVEN | CODE |
| CAP-AVT-005 | `avatar_get_current_morph` | PROVEN | CODE |
| CAP-AVT-006 | `avatar_advance_lip_sync` | PROVEN | CODE |
| CAP-AVT-007 | `avatar_get_expression` | PROVEN | CODE |
| CAP-AVT-008 | `avatar_get_state` | PROVEN | CODE |
| CAP-AVT-009 | `avatar_prepare_animation` | PROVEN | CODE |
| CAP-AVT-010 | `avatar_run_selftest` | PROVEN | CODE |

## I. Avatar Appearance — 10 commandes

| Capability_ID | Commande | Real_Status | Proof_Type |
|--------------|----------|-------------|------------|
| CAP-APP-001 | `avatar_get_appearance` | PROVEN | CODE |
| CAP-APP-002 | `avatar_set_appearance` | PROVEN | CODE |
| CAP-APP-003 | `avatar_update_appearance` | PROVEN | CODE |
| CAP-APP-004 | `avatar_apply_style_preset` | PROVEN | CODE |
| CAP-APP-005 | `avatar_parse_style_command` | PROVEN | CODE |
| CAP-APP-006 | `avatar_save_custom_style` | PROVEN | CODE |
| CAP-APP-007 | `avatar_load_custom_style` | PROVEN | CODE |
| CAP-APP-008 | `avatar_merge_styles` | PROVEN | CODE |
| CAP-APP-009 | `avatar_list_styles` | PROVEN | CODE |
| CAP-APP-010 | `avatar_add_archetype` | PROVEN | CODE |

## J. Avatar Floating (desktop-only, cfg guard) — 15+ commandes

| Commande | Real_Status | Note |
|----------|-------------|------|
| `avatar_get_display_state` | PROVEN | desktop only |
| `avatar_set_display_state` | PROVEN | desktop only |
| `avatar_update_display_state` | PROVEN | desktop only |
| `avatar_reset_display_state` | PROVEN | desktop only |
| `avatar_mode_floating` | PROVEN | desktop only |
| `avatar_mode_embed` | PROVEN | desktop only |
| `avatar_mode_hidden` | PROVEN | desktop only |
| `avatar_set_position` | PROVEN | desktop only |
| `avatar_set_size` | PROVEN | desktop only |
| `avatar_set_scale` | PROVEN | desktop only |
| `avatar_set_opacity` | PROVEN | desktop only |
| `avatar_set_always_on_top` | PROVEN | desktop only |
| `avatar_set_locked` | PROVEN | desktop only |
| `avatar_set_mirror_mode` | PROVEN | desktop only |
| `avatar_set_click_through` | PROVEN | desktop only |

## K. Avatar FullBody — 12 commandes

| Commande | Real_Status | Proof_Type |
|----------|-------------|------------|
| `fullbody_initialize` | PROVEN | CODE |
| `fullbody_advance_frame` | PROVEN | CODE |
| `fullbody_activate_gesture` | PROVEN | CODE |
| `fullbody_update_expression` | PROVEN | CODE |
| `fullbody_update_lipsync` | PROVEN | CODE |
| `fullbody_update_state` | PROVEN | CODE |
| `fullbody_on_wake_word` | PROVEN | CODE |
| `fullbody_export_skeleton` | PROVEN | CODE |
| `fullbody_update_context` | PROVEN | CODE |
| `fullbody_get_posture` | PROVEN | CODE |
| `fullbody_get_stats` | PROVEN | CODE |
| `fullbody_run_selftest` | PROVEN | CODE |

## L. Security / Secrets — 13 commandes

| Commande | Real_Status | Notes |
|----------|-------------|-------|
| `chat_set_gemini_key` | PROVEN | |
| `get_gemini_key_status` | PROVEN | |
| `chat_set_openai_key` | PROVEN | |
| `get_openai_key_status` | PROVEN | |
| `chat_set_anthropic_key` | PROVEN | |
| `get_anthropic_key_status` | PROVEN | |
| `get_secrets_status` | PROVEN | |
| `secure_store_secret` | PROVEN | AES-256-GCM |
| `has_secret` | PROVEN | |
| `delete_secret` | PROVEN | |
| `get_permission_audit` | PROVEN | v26.2.3 |
| `check_system_integrity` | PROVEN | v21.5 |
| `validate_chat_message` | PROVEN | |

## M. Runtime Config — 2 commandes

| Commande | Real_Status | Proof_Type |
|----------|-------------|------------|
| `get_runtime_config` | PROVEN | CODE |
| `boot_marker_log` | PROVEN | CODE |

## N. Chat Generate + Copilot — 7 commandes

| Commande | Provider | Real_Status |
|----------|----------|-------------|
| `chat_generate_gemini` | Google Gemini | PROVEN |
| `chat_generate_openai` | OpenAI | PROVEN |
| `chat_generate_claude` | Anthropic | PROVEN |
| `chat_generate_copilot` | GitHub Copilot | PROVEN |
| `chat_set_copilot_key` | GitHub Copilot | PROVEN |
| `get_copilot_key_status` | GitHub Copilot | PROVEN |
| `test_copilot_connection` | GitHub Copilot | PROVEN |

## O. AI / Ollama — 2 commandes

| Commande | Real_Status | Proof_Type |
|----------|-------------|------------|
| `generate_mode_prompt` | PROVEN | CODE |
| `ai_check_ollama_status` | PROVEN | CODE |

## P. Auth OS — 9 commandes

| Commande | Real_Status | Proof_Type |
|----------|-------------|------------|
| `auth_get_status` | PROVEN | CODE |
| `auth_generate_dev_token` | PROVEN | CODE |
| `auth_validate_dev_token` | PROVEN | CODE |
| `auth_revoke_dev_token` | PROVEN | CODE |
| `auth_save_api_keys` | PROVEN | CODE |
| `auth_get_api_keys` | PROVEN | CODE |
| `auth_delete_api_key` | PROVEN | CODE |
| `auth_grant_role` | PROVEN | CODE |
| `auth_revoke_role` | PROVEN | CODE |

## Q. Audio / TTS / VAD / Capture — 23 commandes

| Commande | Catégorie | Real_Status |
|----------|-----------|-------------|
| `tts_speak` | TTS | PROVEN |
| `tts_stop` | TTS | PROVEN |
| `test_tts` | TTS | PROVEN |
| `test_microphone` | Microphone | PROVEN |
| `get_audio_output_devices` | Devices | PROVEN |
| `get_audio_input_devices` | Devices | PROVEN |
| `set_audio_output_device` | Devices | PROVEN |
| `set_audio_input_device` | Devices | PROVEN |
| `vad_get_state` | VAD | PROVEN |
| `vad_process_frame` | VAD | PROVEN |
| `vad_configure` | VAD | PROVEN |
| `vad_reset` | VAD | PROVEN |
| `vad_test` | VAD | PROVEN |
| `audio_capture_start` | Capture | PROVEN |
| `audio_capture_stop` | Capture | PROVEN |
| `audio_capture_status` | Capture | PROVEN |
| `audio_capture_get_chunk` | Capture | PROVEN |
| `audio_capture_export_wav` | Capture | PROVEN |
| `audio_list_devices` | Capture | PROVEN |
| `speak` | Legacy Audio | PROVEN |
| `start_recording` | Legacy Audio | PROVEN |
| `stop_recording` | Legacy Audio | PROVEN |
| `cancel_recording` | Legacy Audio | PROVEN |

## R. Memory API + Helios — 9 commandes

| Commande | Module | Real_Status |
|----------|--------|-------------|
| `get_helios_state` | `api::helios_api` | PROVEN |
| `get_memory_state` | `api::memory_api` | PROVEN |
| `write_snapshot` | `api::memory_api` | PROVEN |
| `read_snapshot` | `api::memory_api` | PROVEN |
| `write_log` | `api::memory_api` | PROVEN |
| `read_logs` | `api::memory_api` | PROVEN |
| `add_timeline_event` | `api::memory_api` | PROVEN |
| `memory_get_active_projects` | `api::memory_api` | PROVEN |
| `memory_get_recent_decisions` | `api::memory_api` | PROVEN |

## S. System Center — 23+ commandes

Logs (4) : `sc_get_logs`, `sc_get_log_stats`, `sc_clear_logs`, `sc_add_log`
Cluster (4) : `sc_get_cluster_status`, `sc_get_cluster_peers`, `sc_initialize_cluster`, `sc_shutdown_cluster`
HyperVision (8) : `sc_hypervision_start`, `sc_hypervision_stop`, `sc_hypervision_get_state`, `sc_hypervision_get_metrics`, `sc_hypervision_get_layers`, `sc_hypervision_get_anomalies`, `sc_hypervision_clear_anomalies`, `sc_hypervision_resolve_anomaly`
Introspection (3) : `sc_introspection_quick_scan`, `sc_introspection_full_scan`, `sc_introspection_auto_fix`
Diagnostics (3) : `sc_run_quick_diagnostics`, `sc_run_full_diagnostics`, `sc_get_diagnostic_status`
Env (1) : `sc_get_env`

## T. Titan Persistence — 27 commandes

`titan_persistence_init`, `titan_persist_event`, `titan_force_snapshot`, `titan_get_persistence_status`,
`titan_check_integrity`, `titan_compact_journal`, `titan_load_state`, `titan_get_events_since`,
`titan_list_snapshots`, `titan_recover_state`, `titan_verify_integrity`, `titan_persistence_shutdown`,
`titan_migrate_state`, `titan_get_schema_version`, `titan_export_data`, `titan_validate_archive`,
`titan_import_data`, `titan_get_memory_health`, `titan_run_self_healing`, `titan_reset_module`,
`titan_dump_raw_state`, `titan_run_full_integrity_check`, `titan_memory_doctor_diagnose`,
`titan_memory_doctor_summary`, `titan_memory_doctor_heal`, `titan_memory_doctor_compact`,
`titan_memory_doctor_export`

---

**TOTAL PROUVÉ : 401 commandes registered à SHA c59e9b5b3 (408 avec patches AUDIO non committés)**

CORRECTION: "378" était un artefact grep tronqué — RÉTRACTÉ.
Les domaines non listés en détail (Singularity Fusion ~66, Governance, Memory OS, Coherence,
Unified Memory, System Health, DevTools, Whisper, Persistent Memory, Self-Healing, Window Controls,
Config Hub, Onboarding, Fusion, Control Panel, Identity, Legacy AI Bridge, UI Theme) sont présents
dans le invoke_handler et constituent le solde jusqu'à 401/408.

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*
