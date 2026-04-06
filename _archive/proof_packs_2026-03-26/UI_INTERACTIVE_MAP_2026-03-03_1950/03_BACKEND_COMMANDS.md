# Backend Commands — Registre Complet Tauri
**Source:** src-tauri/src/main.rs (invoke_handler) + src-tauri/src/commands/
**Nombre total de commandes enregistrées:** ~300
**Date:** 2026-03-03T19:50:39Z | **Commit:** e97177da

---

## Groupe 1 — CONVERSATION ENGINE (OMEGA)
*Module: conversation_engine::commands*

| Commande | Paramètres | Utilisé par |
|----------|------------|-------------|
| `conversation_generate` | ConversationRequest {user_message, conversation_id, mode, ai_config, custom_system_prompt} | ConversationSection.sendMessage() |
| `create_new_conversation` | — | ConversationSection / useConversationEngine |
| `conversation_process_message` | message, conversation_id | ConversationSection |
| `conversation_health_check` | — | useConversationEngine.autoHealthCheck |
| `conversation_memory_stats` | — | MemorySection / DevPage |

---

## Groupe 2 — CHAT ORCHESTRATOR (OVERDRIVE)
*Module: overdrive::chat_orchestrator*

| Commande | Paramètres | Utilisé par |
|----------|------------|-------------|
| `chat_stream_message` | ChatRequest {message, provider, model, streaming, images, system_prompt} | ConversationSection (streaming) |
| `chat_get_providers_status` | — | TopNav AI indicator, DevPage |
| `chat_check_providers` | — | TopNav (polling 30s) |
| `chat_get_conversation` | conversation_id | useConversationEngine |
| `chat_create_conversation` | — | useConversationEngine |
| `chat_delete_conversation` | conversation_id | ConversationSection (clear) |
| `chat_generate_suggestions` | context | ConversationSection suggestions |
| `chat_get_memory_stats` | — | MemorySection / Stats |

---

## Groupe 3 — VOICE ENGINE
*Module: overdrive::voice_engine*

| Commande | Utilisé par |
|----------|-------------|
| `voice_start_listening` | ConversationSection (voice record) |
| `voice_stop_listening` | ConversationSection |
| `voice_cancel_recording` | ConversationSection |
| `voice_is_recording` | useVoiceEngine |
| `voice_transcribe_audio` | ConversationSection |
| `voice_get_status` | VoiceControlPanel |
| `voice_get_config` | VoiceControlPanel / AdminPage |
| `voice_update_config` | AdminPage (settings) |
| `voice_play_audio` | hybridTTS |
| `voice_stop_speaking` | hybridTTS |
| `voice_test_pipeline` | AdminPage / DevPage |
| `voice_calibrate_microphone` | AdminPage |
| `voice_detect_wake_word` | useVAD |
| `voice_get_available_models` | AdminPage (audio) |
| `voice_enable_duplex` | AdminPage |
| `voice_disable_duplex` | AdminPage |
| `voice_check_interruption` | overdrive pipeline |

---

## Groupe 4 — AUDIO CENTER
*Module: audio::commands*

| Commande | Utilisé par |
|----------|-------------|
| `tts_speak` | hybridTTS / ConversationSection |
| `tts_stop` | ConversationSection |
| `test_tts` | AdminPage (audio tab) |
| `test_microphone` | AdminPage |
| `get_audio_output_devices` | AdminPage |
| `get_audio_input_devices` | AdminPage |
| `set_audio_output_device` | AdminPage |
| `set_audio_input_device` | AdminPage |
| `vad_get_state` | useVAD |
| `vad_process_frame` | useVAD |
| `vad_configure` | AdminPage |
| `vad_reset` | useVAD |
| `vad_test` | AdminPage |

---

## Groupe 5 — WINDOW CONTROLS
*Module: commands_v21::window_controls_commands*

| Commande | Déclencheur | Utilisé par |
|----------|-------------|-------------|
| `window_get_zoom` | Init | useZoomControl |
| `window_set_zoom` | Ctrl+Scroll | useZoomControl |
| `window_zoom_in` | Ctrl+Plus | useWindowControls |
| `window_zoom_out` | Ctrl+Minus | useWindowControls |
| `window_zoom_reset` | Ctrl+0 | useWindowControls |
| `window_toggle_fullscreen` | F11 | useWindowControls |
| `window_set_fullscreen` | — | useWindowControls |
| `window_is_fullscreen` | Poll | useWindowControls |

---

## Groupe 6 — SECURE API KEYS
*Module: secure_commands*

| Commande | Utilisé par |
|----------|-------------|
| `chat_set_gemini_key` | AdminPage / SecureSettings |
| `get_gemini_key_status` | AdminPage |
| `chat_set_openai_key` | AdminPage |
| `get_openai_key_status` | AdminPage |
| `chat_set_anthropic_key` | AdminPage |
| `get_anthropic_key_status` | AdminPage |
| `get_secrets_status` | AdminPage |
| `get_permission_audit` | AdminPage (governance) |
| `check_system_integrity` | DevPage / SelfHeal |

---

## Groupe 7 — COPILOT PROVIDER
*Module: commands::copilot_commands*

| Commande | Utilisé par |
|----------|-------------|
| `chat_generate_copilot` | ConversationSection (provider Copilot) |
| `chat_set_copilot_key` | AdminPage |
| `get_copilot_key_status` | AdminPage |
| `test_copilot_connection` | AdminPage |

---

## Groupe 8 — SINGULARITY STATE
*Module: singularity_state::commands*

| Commande | Utilisé par |
|----------|-------------|
| `singularity_get_state` | SingularityMonitor / useSingularityState |
| `singularity_get_full_state` | DevPage |
| `singularity_get_physical` | Stats |
| `singularity_get_cognitive` | Stats |
| `singularity_get_adaptive` | Stats |
| `singularity_update_*` (8 variants) | App.tsx / useEffect |
| `singularity_save_state` | Persistence hooks |
| `sync_singularity` | Auto-sync background |

---

## Groupe 9 — MEMORY SYSTEM
*Modules: api::memory_api + unified_memory_commands + memory_os_commands*

| Commande | Utilisé par |
|----------|-------------|
| `get_memory_state` | MemorySection / TitanePage |
| `memory_os_store` | useMemoryCore |
| `memory_recall_keyword` | MemorySection (search) |
| `memory_recall_semantic` | useRAG |
| `memory_recall_recent` | MemorySection |
| `memory_stats` | MemorySection / Stats |
| `memory_snapshot` | TimePage / SelfHeal |
| `memory_consolidate` | Auto-background |
| `write_snapshot` | TimePage (create snapshot) |
| `read_snapshot` | TimePage (restore) |

---

## Groupe 10 — PERSISTENCE (TITAN)
*Module: persistence::commands*

| Commande | Utilisé par |
|----------|-------------|
| `titan_persistence_init` | App startup |
| `titan_persist_event` | Event tracking |
| `titan_force_snapshot` | TimePage / DevPage |
| `titan_load_state` | App init |
| `titan_recover_state` | TimePage (restore snapshot) |
| `titan_run_self_healing` | SelfHeal page |
| `titan_memory_doctor_diagnose` | SelfHeal / AdminPage |

---

## Groupe 11 — QA & MONITORING
*Module: qa_monitoring_commands*

| Commande | Utilisé par |
|----------|-------------|
| `qa_get_state` | DevPage |
| `qa_get_system_metrics` | DevPage |
| `qa_list_test_suites` | DevPage |
| `qa_list_alerts` | DevPage |
| `qa_run_test_suite` | DevPage (run button) |
| `qa_acknowledge_alert` | DevPage (ack button) |

---

## Groupe 12 — SINGULARITY FUSION (AutoFix/AutoHeal/CrashGuard)
*Module: singularity_fusion*

| Catégorie | Nombre de commandes | Utilisé par |
|-----------|---------------------|-------------|
| autofix_* | 16 commandes | SelfHeal / DevPage |
| autoheal_* | 18 commandes | SelfHeal |
| crashguard_* | 9 commandes | Watchdog |
| performance_* | 6 commandes | DevPage metrics |
| pipeline_* | 9 commandes | Internal |

---

## Groupe 13 — AVATAR ENGINE
*Modules: avatar::avatar_commands + appearance_commands + floating_commands + fullbody_commands*

| Catégorie | Nb commandes | Utilisé par |
|-----------|-------------|-------------|
| avatar_prepare_speech / get_state / get_expression | 10 | TTS pipeline |
| avatar_get_appearance / set_appearance / styles | 10 | AdminPage (avatar section) |
| avatar floating window controls | 16 | AdminPage |
| fullbody_* engine | 11 | AdminPage / TitanePage |

---

## Groupe 14 — ONBOARDING / CONFIG / AUTH

| Commande | Utilisé par |
|----------|-------------|
| `is_onboarding_complete` | App.tsx (startup check) |
| `complete_onboarding` | OnboardingFlow.onComplete |
| `get_all_configs` | AdminPage (config hub) |
| `update_runtime_config` | AdminPage |
| `export_config` | AdminPage |
| `import_config` | AdminPage |
| `auth_get_status` | AdminPage (security) |
| `auth_save_api_keys` | AdminPage |
| `check_online_capabilities` | DevPage diagnostic |

---

## Groupe 15 — XP / PROGRESSION
*Module: commands::exp_fusion*

| Commande | Utilisé par |
|----------|-------------|
| `exp_get_global_state` | TitanePage (ProgressionSection) |
| `exp_get_categories` | ProgressionSection |
| `exp_get_projects` | ProgressionSection |
| `exp_get_talents` | ProgressionSection |
| `exp_get_timeline` | ProgressionSection |
| `exp_add_knowledge` | ConversationSection (after chat) |
