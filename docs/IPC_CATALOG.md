> 2026-05-05 — Remote Gateway Twins HTTP truth: `POST /api/invoke` autorise maintenant `twin_get_state`, `twin_get_identity`, `twin_get_evolution_profile`, `twin_get_fusion_index`, `twin_recalculate_fusion`, `twin_submit_observation`, `twin_apply_evolution`, `twin_validate_sync` via `src-tauri/src/remote_gateway/handlers.rs`. `GatewayState` inclut `twin: Arc<NumericTwinState>` (wiring `src-tauri/src/remote_gateway/server.rs`). Les réponses read-path exposent le format camelCase attendu côté frontend via `convert_to_response()` de `numeric_twin/twin_commands.rs`. Validation: test Rust `remote_gateway::handlers::tests::test_invoke_twin_identity_command` + Playwright `e2e/remote-gateway.spec.ts` (cas twin_*).

> 2026-05-03 — `generate_response` contract truth: la réponse IPC de génération non-streaming transporte maintenant `model?: string` en plus de `provider/content/token_count/latency_ms/timestamp/stop_reason/profile`. Cette extension sert la chaîne de vérité runtime `requested -> used -> shown` côté chat sans modifier le contrat enveloppe `{ ok, content, error }`.

> 2026-05-03 — `stream_response` runtime truth: les événements de terminaison `chat:stream:done` et `chat:stream:complete` produits par la voie Ollama propagent maintenant le `model` issu du chunk terminal quand il est publié par le backend Ollama, au lieu de renvoyer systématiquement le modèle demandé en entrée.

> 2026-05-01 — V32.0.0 / V33 sprint IPC truth: 8 nouvelles commandes Tauri ajoutées dans `src-tauri/src/meta_energy/commands.rs` (meta_energy_get_state, meta_energy_get_fatigue, meta_energy_get_recovery_plan, meta_energy_get_load_balance, meta_energy_get_homeostasis, meta_energy_get_forecast, meta_energy_apply_delta, meta_energy_get_diagnostics) — état géré via `Arc<RwLock<MetaEnergyState>>`, hook frontend `src/hooks/useMetaEnergy.ts`, 8 entrées ALLOWED_COMMANDS. Sprint V33 (commits 56fd3bfa6, d67bcb2ab, 07b07bdaa) : aucune nouvelle commande IPC Rust — `chatModes.config.ts` split est architectural TypeScript pur ; `MonitoringDashboard` consomme `read_json_file` (existant) via `getProjectHealthMetrics()` (fonction frontend) ; `update-deployment-latest.sh` est un script CI sans surface IPC. Total IPC commandes catalog : 1217. Contrat Rule 6 `{ ok, content, error }` maintenu sur toutes les nouvelles commandes. `guard:ipc-contract` PASS 30/30 (2026-05-01).

> 2025-07-15 — Remote Gateway Phase 2 (v31.2.3): `POST /api/invoke → conversation_generate` maintenant opérationnel via `conversation_generate_inner()` (src-tauri/src/conversation_engine/commands.rs). `GatewayState` contient `engine: Arc<ConversationEngineState>` + `orchestrator: ChatOrchestratorState`. Payload: `ConversationGenerateArgs { message, conversation_id, mode, provider, system_prompt, ... }`. Retourne `{ ok, content: { response, meta: { provider_used, latency_ms_total, ... } } }`. Browser UI: `RemoteLoginPage` (data-testid=remote-login-page) + `RemoteGatewayLayout` (data-testid=remote-gateway-layout). Tests: `tests/contract/remote-chat-contract.test.ts` (40 Vitest) + `e2e/remote-chat-api.spec.ts` + `e2e/remote-chat-browser.spec.ts` (Playwright). `invoke()` retourne `content` directement et throw sur `ok:false`.

> 2026-04-28 — Remote Gateway REST surface truth: le module `src-tauri/src/remote_gateway/` expose une surface HTTP REST + WebSocket distincte des commandes Tauri IPC. Endpoints publics (sans auth): `GET /api/health`, `GET /api/system/health`, `POST /api/auth/token`, `POST /api/auth/refresh`. Endpoints protégés (Bearer JWT): `POST /api/invoke` (allowlist command dispatch), `GET /api/config/runtime`, `GET /api/agents/status`. Streaming: `GET /api/stream?token=<JWT>` (WebSocket). Contrat de réponse conforme Rule 6 `{ ok, content, error }`. Activé uniquement via `TITANE_REMOTE_ENABLED=1`.

> 2026-04-23 — Doc engine DOCX export IPC truth: `export_docx_file` accepte un payload `{ document: Document, output_dir: String }` et retourne `{ ok, content: { path, size }, error }`. La commande délègue à `ExportEngine::export_docx()` (docx-rs 0.4). Capability: `export-import` (fs:allow-write-file + fs:scope-document-recursive + fs:scope-download-recursive). Enregistrée dans `main.rs` invoke_handler et `ALLOWED_COMMANDS`.

> 2026-04-24 — Experience XP IPC persistence truth: `experience_get_state` et `experience_update_state` conservent leurs noms IPC et payloads existants, mais la voie Tauri mock active persiste maintenant `ExperienceState` dans `dirs::data_local_dir()/TITANE_INFINITY/experience_state.json`. Le frontend garde le miroir localStorage comme fallback et resynchronise le backend quand la source locale contient des XP chat plus frais qu un etat backend vide.

> 2026-04-20 — Multi-AI provider truth: `multi_ai_providers` retourne maintenant une liste dedupee de familles de providers publiques disponibles, et `multi_ai_best_provider` renvoie le meilleur provider effectivement selectionnable apres routage intelligent et verification de disponibilite. Les aliases internes de modele/rang (`claude_haiku`, `gpt4`, `local_llama3`) ne font plus autorite sur cette surface IPC.

> 2026-04-18 — Knowledge parser hardening truth: `parse_document` et `detect_file_format` n acceptent plus un chemin documentaire purement textuel. Les commandes valident maintenant un fichier local canonique, refusent les entrees vides, NUL, schemes `://`, segments `..`, repertoires, cibles absentes et fichiers sensibles, puis executent la detection ou le parsing sur le fichier valide seulement.

> 2026-04-18 — Developer Mode patch validation hardening truth: `dev_mode_validate_patch` ne se contente plus d un filtre de suffixe sur `patch.file`. La commande resolve maintenant la cible contre la racine workspace canonique, refuse les entrees vides, NUL, schemes `://`, segments `..` et chemins absolus hors workspace, puis n autorise les extensions `.rs`, `.ts`, `.tsx`, `.css`, `.json` qu apres cette resolution.

> 2026-04-18 — TOTAL_DEV file read hardening truth: `total_dev_read_file` ne s appuie plus sur une canonicalisation immediate du chemin fourni qui cassait le cas `not found` et laissait des gardes incompletes. La commande resolve maintenant la cible contre le workspace canonique, refuse les entrees vides, NUL, schemes `://`, segments `..`, chemins absolus hors workspace et extensions sensibles, puis renvoie encore un resultat structure pour les cibles absentes dans le repo.

> 2026-04-18 — Hybrid patch hardening truth: `dev_apply_patch` ne traite plus un chemin de patch arbitraire. La commande resolve maintenant la cible contre la racine workspace canonique, refuse les entrees vides, NUL, schemes `://`, segments `..`, chemins absolus hors workspace et cibles non fichier, puis applique le remplacement de lignes uniquement sur ce fichier gouverne.

> 2026-04-18 — Stub filesystem bridge hardening truth: `fs_exists` et `read_json_file` ne traitent plus des chemins arbitraires. Les deux commandes resolvent maintenant leur cible contre la racine workspace canonique, refusent les entrees vides, NUL, schemes `://`, segments `..` et chemins absolus hors workspace; `read_json_file` refuse aussi les extensions non `.json` et les fichiers > 2 MiB.

> 2026-04-18 — Hybrid file inspection hardening truth: `dev_inspect_file` conserve son usage dev d inspection locale, mais la commande ne lit plus de chemin arbitraire. Elle resolve maintenant le chemin contre la racine workspace canonique, refuse les entrees vides, les NUL, les schemes `://`, les segments `..` et les chemins absolus hors workspace, avec des tests Rust de succes repo-local et de rejet traversal/hors-workspace.

# TITANE_INFINITY — Catalogue IPC Exhaustif

> 2026-04-17 — Security audit installed-runtime proof truth: `security_audit_sync_journal` et `security_audit_publish_signed_export` sont qualifiées sur la lane debug desktop et sur la lane installée `/usr/bin/titane-infinity` en version 30.1.34. Les deux commandes conservent le contrat `{ ok, content, error }` et écrivent leurs preuves dans `~/.local/share/com.titane.infinity/security_active/` sans ouvrir de voie réseau alternative.

> 2026-04-17 — Hybrid dev command hardening truth: `dev_run_command` reste une commande IPC de support dev, mais elle ne relaie plus une ligne shell arbitraire. La commande applique maintenant une allowlist explicite de commandes de diagnostic/build strictement autorisees, refuse les operateurs shell (`;`, `&&`, `|`, redirections, sauts de ligne) et s execute depuis la racine workspace canonique, avec des tests Rust exacts de succes et de rejet.

> 2026-04-17 — TOTAL_DEV console hardening truth: `total_dev_run_command` conserve le contrat IPC de console gouvernee pour la session TOTAL_DEV, mais l execution est maintenant bornee a une allowlist exacte au lieu d une combinaison allowlist + prefixes ouverts. Les operateurs shell sont refuses, les variantes non repertoriees comme `git status --porcelain` ou `pnpm run verify:registry` sont bloquees, et les lectures de fichiers passent explicitement par `total_dev_read_file` plutot que par `cat src*`.

> 2026-04-17 — TOTAL_DEV Git read-only truth: `total_dev_git_op` conserve son contrat IPC de pilotage git gouverne, mais il n autorise plus les operations mutantes ni des arguments libres. La commande accepte uniquement des inspections read-only qualifiees (`status`, `diff --stat`, `log --oneline -10|-20`, `branch`, `show --stat --oneline HEAD`, `rev-parse --short HEAD`) et refuse les ecritures git ainsi que les variantes non repertoriees.

> 2026-04-18 — Knowledge base runtime snapshot truth: `knowledge_base_runtime_snapshot` expose maintenant une snapshot gouvernée `{ ok, content, error }` de la KB par défaut depuis `src-tauri/src/knowledge_base_default.rs`. La commande tente d abord la lecture runtime de `data/knowledge_base/default`, exclut les fichiers privés Kevin, publie `source`, `source_path`, `fallback_used`, `entry_count`, `errors` et `entries`, puis retombe honnêtement sur la KB embarquée si le disque runtime est indisponible.

> 2026-04-19 — Hybrid memory governed export truth: `hybrid_memory_publish_governed_report` publie maintenant un rapport hybride markdown et un sidecar JSON signé localement sous `~/.local/share/com.titane.infinity/hybrid_memory/exports/`, via `src-tauri/src/hybrid_memory_bridge.rs`. La commande conserve le contrat `{ ok, content, error }`, reste Tauri-only, est alignée sur `src/lib/security.ts` et `tests/contract/tauri-ipc-contract.test.ts`, et laisse le fallback Blob navigateur actif quand la voie desktop n existe pas.

> **1217 commandes IPC Tauri** — v32.0.1 (2026-05-02)
> Toutes les commandes exposées par `main.rs` via `tauri::generate_handler![]`

## Résumé par domaine

| # | Domaine | Nombre de commandes |
|---|---------|-------------------|
| 1 | AI / Chat | 13 |
| 2 | API Gateway | 12 |
| 3 | Adaptive Engine | 7 |
| 4 | Agents | 7 |
| 5 | Audio | 21 |
| 6 | Authentication | 26 |
| 7 | Automation | 13 |
| 8 | Avatar | 44 |
| 9 | Batch | 3 |
| 10 | Browser Agent | 7 |
| 11 | Cache | 6 |
| 12 | Capabilities | 4 |
| 13 | Chat Engine | 30 |
| 14 | Cloud Sync | 16 |
| 15 | Cognitive Engine | 44 |
| 16 | Config / Control Panel | 38 |
| 17 | Conversation Engine | 15 |
| 18 | Cycle Engine | 7 |
| 19 | Dashboard | 3 |
| 20 | Database | 8 |
| 21 | Desktop Agent | 11 |
| 22 | DevTools | 24 |
| 23 | Digital Twin | 8 |
| 24 | Engines | 40 |
| 25 | Evolution | 40 |
| 26 | Experience/XP | 23 |
| 27 | Export/Import | 3 |
| 28 | Filesystem | 7 |
| 29 | Fusion Engine | 18 |
| 30 | Health/Diagnostics | 24 |
| 31 | HyperIntelligence | 11 |
| 32 | IDE Agent | 10 |
| 33 | Identity | 38 |
| 34 | Introspection | 6 |
| 35 | Jobs | 6 |
| 36 | Knowledge Base | 19 |
| 37 | Literary Engine | 9 |
| 38 | Logging | 13 |
| 39 | Memory | 115 |
| 40 | Meta-Orchestration | 48 |
| 41 | Monitoring | 16 |
| 42 | Multi-AI | 24 |
| 43 | Multimodal | 16 |
| 44 | Network | 9 |
| 45 | Ollama | 1 |
| 46 | OneCore | 11 |
| 47 | Overdrive | 2 |
| 48 | Persistent Memory | 12 |
| 49 | Projects | 8 |
| 50 | QA / Testing | 5 |
| 51 | Rate Limiting | 4 |
| 52 | Repair/Healing | 6 |
| 53 | Security | 9 |
| 54 | Self-Healing | 31 |
| 55 | Semantic Skills | 10 |
| 56 | Singularity | 37 |
| 57 | Snapshots | 5 |
| 58 | State Management | 14 |
| 59 | System Center | 22 |
| 60 | TITAN Core | 33 |
| 61 | TTS/Voice | 13 |
| 62 | Tasks | 4 |
| 63 | Temporal Engine | 7 |
| 64 | Training | 15 |
| 65 | VAD | 7 |
| 66 | Voice | 19 |
| | **TOTAL** | **1217** |

---

## AI / Chat (13 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `ai_chat_send` | Ai chat send |
| 2 | `ai_chat_stream` | Ai chat stream |
| 3 | `ai_query` | Ai query |
| 4 | `ai_query_streaming` | Ai query streaming |
| 5 | `ai_status` | Ai status |
| 6 | `create_new_conversation` | Create new conversation |
| 7 | `generate_mode_prompt` | Generate mode prompt |
| 8 | `generate_response` | Generate response |
| 9 | `ia_generate` | Ia generate |
| 10 | `report_chat_error` | Report chat error |
| 11 | `send_message` | Send message |
| 12 | `stream_response` | Stream response |
| 13 | `validate_chat_message` | Validate chat message |

## API Gateway (12 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `api_clear_cache` | Api clear cache |
| 2 | `api_enable` | Api enable |
| 3 | `api_gemini_generate` | Api gemini generate |
| 4 | `api_get_cache_size` | Api get cache size |
| 5 | `api_get_stats` | Api get stats |
| 6 | `api_list_configs` | Api list configs |
| 7 | `api_ollama_generate` | Api ollama generate |
| 8 | `api_request` | Api request |
| 9 | `api_reset_stats` | Api reset stats |
| 10 | `api_set_key` | Api set key |
| 11 | `api_test_connection` | Api test connection |
| 12 | `api_update_config` | Api update config |

## Adaptive Engine (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `adaptive_capture_sample` | Adaptive capture sample |
| 2 | `adaptive_get_history` | Adaptive get history |
| 3 | `adaptive_get_profile` | Adaptive get profile |
| 4 | `adaptive_get_summary` | Adaptive get summary |
| 5 | `adaptive_learn` | Adaptive learn |
| 6 | `adaptive_run_optimization` | Adaptive run optimization |
| 7 | `adaptive_set_mode` | Adaptive set mode |

## Agents (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `create_agent` | Create agent |
| 2 | `get_agent` | Retrieve agent |
| 3 | `get_agent_permission_stats` | Retrieve agent permission stats |
| 4 | `list_agents` | List agents |
| 5 | `update_agent_ia_permission` | Update agent ia permission |
| 6 | `update_agent_ia_recommendation` | Update agent ia recommendation |
| 7 | `update_agent_permission` | Update agent permission |

## Audio (21 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `analyze_audio` | Analyze audio |
| 2 | `audio_capture_export_wav` | Audio capture export wav |
| 3 | `audio_capture_get_chunk` | Audio capture get chunk |
| 4 | `audio_capture_start` | Audio capture start |
| 5 | `audio_capture_status` | Audio capture status |
| 6 | `audio_capture_stop` | Audio capture stop |
| 7 | `audio_list_devices` | Audio list devices |
| 8 | `cancel_recording` | Cancel recording |
| 9 | `get_audio_device_config` | Retrieve audio device config |
| 10 | `get_audio_input_devices` | Retrieve audio input devices |
| 11 | `get_audio_output_devices` | Retrieve audio output devices |
| 12 | `is_recording` | Check status recording |
| 13 | `record_ia_request` | Record ia request |
| 14 | `save_audio_device_config` | Save audio device config |
| 15 | `send_audio_chunk` | Send audio chunk |
| 16 | `set_audio_input_device` | Set audio input device |
| 17 | `set_audio_output_device` | Set audio output device |
| 18 | `start_recording` | Start recording |
| 19 | `stop_recording` | Stop recording |
| 20 | `test_microphone` | Test microphone |
| 21 | `transcribe_audio` | Transcribe audio |

## Authentication (26 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `auth_delete_api_key` | Auth delete api key |
| 2 | `auth_generate_dev_token` | Auth generate dev token |
| 3 | `auth_get_api_keys` | Auth get api keys |
| 4 | `auth_get_status` | Auth get status |
| 5 | `auth_grant_role` | Auth grant role |
| 6 | `auth_revoke_dev_token` | Auth revoke dev token |
| 7 | `auth_revoke_role` | Auth revoke role |
| 8 | `auth_save_api_keys` | Auth save api keys |
| 9 | `auth_validate_dev_token` | Auth validate dev token |
| 10 | `clear_permission_audit` | Clear permission audit |
| 11 | `delete_api_key` | Delete api key |
| 12 | `delete_secret` | Delete secret |
| 13 | `get_anthropic_key_status` | Retrieve anthropic key status |
| 14 | `get_copilot_key_status` | Retrieve copilot key status |
| 15 | `get_gemini_key_status` | Retrieve gemini key status |
| 16 | `get_openai_key_status` | Retrieve openai key status |
| 17 | `get_permission_audit` | Retrieve permission audit |
| 18 | `get_permission_matrix` | Retrieve permission matrix |
| 19 | `get_secrets_status` | Retrieve secrets status |
| 20 | `has_secret` | Check if exists secret |
| 21 | `run_hardening_selftest` | Run hardening selftest |
| 22 | `secure_store_key` | Secure store key |
| 23 | `secure_store_secret` | Secure store secret |
| 24 | `set_api_key` | Set api key |
| 25 | `test_api_key` | Test api key |
| 26 | `toggle_safe_mode` | Toggle safe mode |

## Automation (13 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `automation_cancel` | Automation cancel |
| 2 | `automation_execute` | Automation execute |
| 3 | `automation_get_available` | Automation get available |
| 4 | `automation_get_cooldowns` | Automation get cooldowns |
| 5 | `automation_get_history` | Automation get history |
| 6 | `automation_get_stats` | Automation get stats |
| 7 | `automation_list` | Automation list |
| 8 | `automation_validate` | Automation validate |
| 9 | `autopilot_enable` | Autopilot enable |
| 10 | `autopilot_get_schedule` | Autopilot get schedule |
| 11 | `autopilot_get_suggestions` | Autopilot get suggestions |
| 12 | `autopilot_run` | Autopilot run |
| 13 | `autopilot_set_schedule` | Autopilot set schedule |

## Avatar (44 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `avatar_add_archetype` | Avatar add archetype |
| 2 | `avatar_advance_lip_sync` | Avatar advance lip sync |
| 3 | `avatar_apply_style_preset` | Avatar apply style preset |
| 4 | `avatar_enable_immersion` | Avatar enable immersion |
| 5 | `avatar_finish_speech` | Avatar finish speech |
| 6 | `avatar_get_appearance` | Avatar get appearance |
| 7 | `avatar_get_current_morph` | Avatar get current morph |
| 8 | `avatar_get_display_state` | Avatar get display state |
| 9 | `avatar_get_expression` | Avatar get expression |
| 10 | `avatar_get_state` | Avatar get state |
| 11 | `avatar_list_assets` | Avatar list assets |
| 12 | `avatar_list_screens` | Avatar list screens |
| 13 | `avatar_list_styles` | Avatar list styles |
| 14 | `avatar_load_asset` | Avatar load asset |
| 15 | `avatar_load_custom_style` | Avatar load custom style |
| 16 | `avatar_merge_styles` | Avatar merge styles |
| 17 | `avatar_mode_embed` | Avatar mode embed |
| 18 | `avatar_mode_floating` | Avatar mode floating |
| 19 | `avatar_mode_hidden` | Avatar mode hidden |
| 20 | `avatar_move_to_screen` | Avatar move to screen |
| 21 | `avatar_on_wake_word` | Avatar on wake word |
| 22 | `avatar_parse_style_command` | Avatar parse style command |
| 23 | `avatar_prepare_speech` | Avatar prepare speech |
| 24 | `avatar_reset_display_state` | Avatar reset display state |
| 25 | `avatar_run_selftest` | Avatar run selftest |
| 26 | `avatar_save_custom_style` | Avatar save custom style |
| 27 | `avatar_set_always_on_top` | Avatar set always on top |
| 28 | `avatar_set_anchor` | Avatar set anchor |
| 29 | `avatar_set_anchor_by_name` | Avatar set anchor by name |
| 30 | `avatar_set_appearance` | Avatar set appearance |
| 31 | `avatar_set_click_through` | Avatar set click through |
| 32 | `avatar_set_display_state` | Avatar set display state |
| 33 | `avatar_set_locked` | Avatar set locked |
| 34 | `avatar_set_mirror_mode` | Avatar set mirror mode |
| 35 | `avatar_set_opacity` | Avatar set opacity |
| 36 | `avatar_set_position` | Avatar set position |
| 37 | `avatar_set_scale` | Avatar set scale |
| 38 | `avatar_set_size` | Avatar set size |
| 39 | `avatar_update_appearance` | Avatar update appearance |
| 40 | `avatar_update_display_state` | Avatar update display state |
| 41 | `fullbody_run_selftest` | Fullbody run selftest |
| 42 | `update_body_energy` | Update body energy |
| 43 | `update_heart_alignment` | Update heart alignment |
| 44 | `update_mental_charge` | Update mental charge |

## Batch (3 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `batch_execute` | Batch execute |
| 2 | `batch_get_dashboard_state` | Batch get dashboard state |
| 3 | `batch_get_monitoring_overview` | Batch get monitoring overview |

## Browser Agent (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `browser_close_session` | Browser close session |
| 2 | `browser_extract` | Browser extract |
| 3 | `browser_get_config` | Browser get config |
| 4 | `browser_get_session_status` | Browser get session status |
| 5 | `browser_navigate` | Browser navigate |
| 6 | `browser_open_session` | Browser open session |
| 7 | `browser_read` | Browser read |

## Cache (6 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cache_cleanup` | Cache cleanup |
| 2 | `cache_clear` | Cache clear |
| 3 | `cache_get_metrics` | Cache get metrics |
| 4 | `cache_invalidate_pattern` | Cache invalidate pattern |
| 5 | `clear_memory_cache` | Clear memory cache |
| 6 | `selfheal_clear_cache` | Selfheal clear cache |

## Capabilities (4 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `can_agent_use_provider` | Check capability agent use provider |
| 2 | `capability_registry_by_status` | Capability registry by status |
| 3 | `capability_registry_get` | Capability registry get |
| 4 | `capability_registry_get_all` | Capability registry get all |

## Chat Engine (30 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `chat_check_config` | Chat check config |
| 2 | `chat_check_providers` | Chat check providers |
| 3 | `chat_clear_history` | Chat clear history |
| 4 | `chat_create_conversation` | Chat create conversation |
| 5 | `chat_delete_conversation` | Chat delete conversation |
| 6 | `chat_generate` | Chat generate |
| 7 | `chat_generate_claude` | Chat generate claude |
| 8 | `chat_generate_copilot` | Chat generate copilot |
| 9 | `chat_generate_gemini` | Chat generate gemini |
| 10 | `chat_generate_glm46v` | Chat generate glm46v |
| 11 | `chat_generate_openai` | Chat generate openai |
| 12 | `chat_generate_suggestions` | Chat generate suggestions |
| 13 | `chat_get_conversation` | Chat get conversation |
| 14 | `chat_get_history` | Chat get history |
| 15 | `chat_get_memory_stats` | Chat get memory stats |
| 16 | `chat_get_providers_status` | Chat get providers status |
| 17 | `chat_memory_backup` | Chat memory backup |
| 18 | `chat_memory_restore` | Chat memory restore |
| 19 | `chat_mode_change` | Chat mode change |
| 20 | `chat_mode_sync` | Chat mode sync |
| 21 | `chat_set_anthropic_key` | Chat set anthropic key |
| 22 | `chat_set_api_key` | Chat set api key |
| 23 | `chat_set_copilot_key` | Chat set copilot key |
| 24 | `chat_set_gemini_key` | Chat set gemini key |
| 25 | `chat_set_openai_key` | Chat set openai key |
| 26 | `chat_stream_message` | Chat stream message |
| 27 | `cp_get_ai_config` | Cp get ai config |
| 28 | `cp_set_ai_config` | Cp set ai config |
| 29 | `save_chat_interaction` | Save chat interaction |
| 30 | `set_chat_profile` | Set chat profile |

## Cloud Sync (16 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cloud_auto_heal` | Cloud auto heal |
| 2 | `cloud_backup_vault` | Cloud backup vault |
| 3 | `cloud_create_vault` | Cloud create vault |
| 4 | `cloud_get_devices` | Cloud get devices |
| 5 | `cloud_get_status` | Cloud get status |
| 6 | `cloud_get_sync_history` | Cloud get sync history |
| 7 | `cloud_init` | Cloud init |
| 8 | `cloud_list_backups` | Cloud list backups |
| 9 | `cloud_load_vault` | Cloud load vault |
| 10 | `cloud_remove_device` | Cloud remove device |
| 11 | `cloud_restore_vault` | Cloud restore vault |
| 12 | `cloud_sync_pull` | Cloud sync pull |
| 13 | `cloud_sync_push` | Cloud sync push |
| 14 | `cloud_update_config` | Cloud update config |
| 15 | `cloud_update_vault_data` | Cloud update vault data |
| 16 | `cloud_verify_integrity` | Cloud verify integrity |

## Cognitive Engine (44 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cognitive_add_changelog` | Cognitive add changelog |
| 2 | `cognitive_add_concept` | Cognitive add concept |
| 3 | `cognitive_add_xp` | Cognitive add xp |
| 4 | `cognitive_analyze` | Cognitive analyze |
| 5 | `cognitive_backup_memory` | Cognitive backup memory |
| 6 | `cognitive_build_memory` | Cognitive build memory |
| 7 | `cognitive_check_coherence` | Cognitive check coherence |
| 8 | `cognitive_compute_hash_cmd` | Cognitive compute hash cmd |
| 9 | `cognitive_consolidate_memory` | Cognitive consolidate memory |
| 10 | `cognitive_create_association` | Cognitive create association |
| 11 | `cognitive_delete_knowledge` | Cognitive delete knowledge |
| 12 | `cognitive_get_associations` | Cognitive get associations |
| 13 | `cognitive_get_evolution` | Cognitive get evolution |
| 14 | `cognitive_get_knowledge_vault` | Cognitive get knowledge vault |
| 15 | `cognitive_get_map` | Cognitive get map |
| 16 | `cognitive_get_memory` | Cognitive get memory |
| 17 | `cognitive_get_progression` | Cognitive get progression |
| 18 | `cognitive_get_status` | Cognitive get status |
| 19 | `cognitive_get_unified_state` | Cognitive get unified state |
| 20 | `cognitive_grow_knowledge` | Cognitive grow knowledge |
| 21 | `cognitive_ingest_file` | Cognitive ingest file |
| 22 | `cognitive_integrate` | Cognitive integrate |
| 23 | `cognitive_learn` | Cognitive learn |
| 24 | `cognitive_optimize` | Cognitive optimize |
| 25 | `cognitive_purge_memory` | Cognitive purge memory |
| 26 | `cognitive_reset_progression` | Cognitive reset progression |
| 27 | `cognitive_run_evolution_cycle` | Cognitive run evolution cycle |
| 28 | `cognitive_run_reinforcement` | Cognitive run reinforcement |
| 29 | `cognitive_run_selftest` | Cognitive run selftest |
| 30 | `cognitive_search_knowledge` | Cognitive search knowledge |
| 31 | `cognitive_store_memory` | Cognitive store memory |
| 32 | `cognitive_summarize` | Cognitive summarize |
| 33 | `cognitive_validate_state` | Cognitive validate state |
| 34 | `coherence_check_system` | Coherence check system |
| 35 | `coherence_get_score` | Coherence get score |
| 36 | `coherence_get_state` | Coherence get state |
| 37 | `coherence_initialize` | Coherence initialize |
| 38 | `coherence_validate_connections` | Coherence validate connections |
| 39 | `get_cognitive_state` | Retrieve cognitive state |
| 40 | `get_three_centers_coherence` | Retrieve three centers coherence |
| 41 | `orchestration_analyze_cognitive` | Orchestration analyze cognitive |
| 42 | `orchestration_get_cognitive_state` | Orchestration get cognitive state |
| 43 | `orchestration_set_cognitive_mode` | Orchestration set cognitive mode |
| 44 | `update_cognitive_mode` | Update cognitive mode |

## Config / Control Panel (38 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cp_check_for_updates` | Cp check for updates |
| 2 | `cp_clear_logs` | Cp clear logs |
| 3 | `cp_clear_memory_cache` | Cp clear memory cache |
| 4 | `cp_get_design_config` | Cp get design config |
| 5 | `cp_get_logs` | Cp get logs |
| 6 | `cp_get_memory_stats` | Cp get memory stats |
| 7 | `cp_get_modules_status` | Cp get modules status |
| 8 | `cp_get_network_config` | Cp get network config |
| 9 | `cp_get_security_config` | Cp get security config |
| 10 | `cp_get_singularity_status` | Cp get singularity status |
| 11 | `cp_get_system_info` | Cp get system info |
| 12 | `cp_install_update` | Cp install update |
| 13 | `cp_run_system_diagnostic` | Cp run system diagnostic |
| 14 | `cp_set_design_config` | Cp set design config |
| 15 | `cp_set_network_config` | Cp set network config |
| 16 | `cp_set_security_config` | Cp set security config |
| 17 | `cp_toggle_module` | Cp toggle module |
| 18 | `cp_toggle_singularity` | Cp toggle singularity |
| 19 | `delete_config_preset` | Delete config preset |
| 20 | `export_config` | Export config |
| 21 | `get_all_configs` | Retrieve all configs |
| 22 | `get_chat_engine_config` | Retrieve chat engine config |
| 23 | `get_chat_request_defaults` | Retrieve chat request defaults |
| 24 | `get_runtime_config` | Retrieve runtime config |
| 25 | `import_config` | Import config |
| 26 | `list_config_exports` | List config exports |
| 27 | `list_config_presets` | List config presets |
| 28 | `load_config_preset` | Load config preset |
| 29 | `load_ui_theme` | Load ui theme |
| 30 | `reset_ui_theme` | Reset ui theme |
| 31 | `save_config_preset` | Save config preset |
| 32 | `save_settings` | Save settings |
| 33 | `save_ui_theme` | Save ui theme |
| 34 | `set_chat_engine_config` | Set chat engine config |
| 35 | `set_chat_request_defaults` | Set chat request defaults |
| 36 | `update_chat_engine_config` | Update chat engine config |
| 37 | `update_runtime_config` | Update runtime config |
| 38 | `update_ui_token` | Update ui token |

## Conversation Engine (15 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `conversation_behavioral_check` | Conversation behavioral check |
| 2 | `conversation_emotional_process` | Conversation emotional process |
| 3 | `conversation_french_postprocess` | Conversation french postprocess |
| 4 | `conversation_generate` | Conversation generate |
| 5 | `conversation_health_check` | Conversation health check |
| 6 | `conversation_memory_stats` | Conversation memory stats |
| 7 | `conversation_process_message` | Conversation process message |
| 8 | `conversation_realism_process` | Conversation realism process |
| 9 | `conversation_reset` | Conversation reset |
| 10 | `create_conversation` | Create conversation |
| 11 | `delete_conversation` | Delete conversation |
| 12 | `list_conversations` | List conversations |
| 13 | `list_restorable_conversations` | List restorable conversations |
| 14 | `load_conversation` | Load conversation |
| 15 | `load_conversation_history` | Load conversation history |

## Cycle Engine (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cycle_get_alignment` | Cycle get alignment |
| 2 | `cycle_get_diagnostics` | Cycle get diagnostics |
| 3 | `cycle_get_load_params` | Cycle get load params |
| 4 | `cycle_get_rhythm` | Cycle get rhythm |
| 5 | `cycle_get_state` | Cycle get state |
| 6 | `cycle_predict_events` | Cycle predict events |
| 7 | `cycle_suggest_optimal_time` | Cycle suggest optimal time |

## Dashboard (3 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `dashboard_get_metrics` | Dashboard get metrics |
| 2 | `dashboard_get_realtime_stats` | Dashboard get realtime stats |
| 3 | `get_dashboard_metrics` | Retrieve dashboard metrics |

## Database (8 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `db_get_snapshot` | Db get snapshot |
| 2 | `db_get_stream` | Db get stream |
| 3 | `db_kv_get` | Db kv get |
| 4 | `db_kv_set` | Db kv set |
| 5 | `db_put_event` | Db put event |
| 6 | `db_put_snapshot` | Db put snapshot |
| 7 | `db_sync_now` | Db sync now |
| 8 | `db_sync_status` | Db sync status |

## Desktop Agent (11 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `desktop_close_session` | Desktop close session |
| 2 | `desktop_get_active_window` | Desktop get active window |
| 3 | `desktop_get_config` | Desktop get config |
| 4 | `desktop_get_control_status` | Desktop get control status |
| 5 | `desktop_get_session_status` | Desktop get session status |
| 6 | `desktop_handoff_session` | Desktop handoff session |
| 7 | `desktop_kill_switch` | Desktop kill switch |
| 8 | `desktop_list_windows` | Desktop list windows |
| 9 | `desktop_open_session` | Desktop open session |
| 10 | `desktop_pause_session` | Desktop pause session |
| 11 | `desktop_resume_session` | Desktop resume session |

## DevTools (24 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `devops_run` | Devops run |
| 2 | `devops_stats` | Devops stats |
| 3 | `devtools_analyze` | Devtools analyze |
| 4 | `devtools_debug_clear` | Devtools debug clear |
| 5 | `devtools_debug_last` | Devtools debug last |
| 6 | `devtools_debug_stats` | Devtools debug stats |
| 7 | `devtools_debug_toggle` | Devtools debug toggle |
| 8 | `devtools_disable` | Devtools disable |
| 9 | `devtools_enable` | Devtools enable |
| 10 | `devtools_knn` | Devtools knn |
| 11 | `devtools_memory_export` | Devtools memory export |
| 12 | `devtools_memory_health` | Devtools memory health |
| 13 | `devtools_memory_ltm` | Devtools memory ltm |
| 14 | `devtools_memory_search` | Devtools memory search |
| 15 | `devtools_memory_stats` | Devtools memory stats |
| 16 | `devtools_memory_stm` | Devtools memory stm |
| 17 | `devtools_metrics` | Devtools metrics |
| 18 | `devtools_status` | Devtools status |
| 19 | `total_dev_git_op` | Total dev git op |
| 20 | `total_dev_read_file` | Total dev read file |
| 21 | `total_dev_revoke` | Total dev revoke |
| 22 | `total_dev_run_command` | Total dev run command |
| 23 | `total_dev_session_status` | Total dev session status |
| 24 | `total_dev_unlock` | Total dev unlock |

## Digital Twin (8 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `twin_apply_evolution` | Twin apply evolution |
| 2 | `twin_get_evolution_profile` | Twin get evolution profile |
| 3 | `twin_get_fusion_index` | Twin get fusion index |
| 4 | `twin_get_identity` | Twin get identity |
| 5 | `twin_get_state` | Twin get state |
| 6 | `twin_recalculate_fusion` | Twin recalculate fusion |
| 7 | `twin_submit_observation` | Twin submit observation |
| 8 | `twin_validate_sync` | Twin validate sync |

## Engines (40 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `discover_cores` | Discover cores |
| 2 | `engine_get_cognition_state` | Engine get cognition state |
| 3 | `engine_get_evolution_state` | Engine get evolution state |
| 4 | `engine_get_harmonia_state` | Engine get harmonia state |
| 5 | `engine_get_nexus_state` | Engine get nexus state |
| 6 | `engine_get_sentinel_state` | Engine get sentinel state |
| 7 | `engine_get_singularity_state` | Engine get singularity state |
| 8 | `engine_health` | Engine health |
| 9 | `engine_init` | Engine init |
| 10 | `engine_init_singularity` | Engine init singularity |
| 11 | `engine_metrics` | Engine metrics |
| 12 | `engine_modules` | Engine modules |
| 13 | `engine_snapshot` | Engine snapshot |
| 14 | `engine_status` | Engine status |
| 15 | `engine_stop` | Engine stop |
| 16 | `engine_sync` | Engine sync |
| 17 | `engine_tick` | Engine tick |
| 18 | `engines_monitoring_get_dashboard` | Engines monitoring get dashboard |
| 19 | `engines_monitoring_get_metrics` | Engines monitoring get metrics |
| 20 | `get_available_engines` | Retrieve available engines |
| 21 | `get_core_info` | Retrieve core info |
| 22 | `get_core_metrics` | Retrieve core metrics |
| 23 | `get_core_metrics_by_name` | Retrieve core metrics by name |
| 24 | `get_engine_health` | Retrieve engine health |
| 25 | `get_engines_status` | Retrieve engines status |
| 26 | `get_harmonia_metrics` | Retrieve harmonia metrics |
| 27 | `get_harmonia_state` | Retrieve harmonia state |
| 28 | `get_harmonia_status` | Retrieve harmonia status |
| 29 | `get_helios_metrics` | Retrieve helios metrics |
| 30 | `get_helios_state` | Retrieve helios state |
| 31 | `get_helios_state_cached` | Retrieve helios state cached |
| 32 | `get_module_health` | Retrieve module health |
| 33 | `get_module_status` | Retrieve module status |
| 34 | `get_nexus_graph` | Retrieve nexus graph |
| 35 | `get_nexus_state` | Retrieve nexus state |
| 36 | `get_sentinel_state` | Retrieve sentinel state |
| 37 | `initialize_all_cores` | Initialize all cores |
| 38 | `restart_cores` | Restart cores |
| 39 | `shutdown_all_cores` | Shutdown all cores |
| 40 | `validate_nexus` | Validate nexus |

## Evolution (40 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `evolution_add_data_point` | Evolution add data point |
| 2 | `evolution_adjust_emotional_sensitivity` | Evolution adjust emotional sensitivity |
| 3 | `evolution_approve_suggestion` | Evolution approve suggestion |
| 4 | `evolution_auto_correct` | Evolution auto correct |
| 5 | `evolution_auto_detect_mode` | Evolution auto detect mode |
| 6 | `evolution_clear_old_history` | Evolution clear old history |
| 7 | `evolution_create_action` | Evolution create action |
| 8 | `evolution_detect_inconsistencies` | Evolution detect inconsistencies |
| 9 | `evolution_emergency_heal` | Evolution emergency heal |
| 10 | `evolution_execute_action` | Evolution execute action |
| 11 | `evolution_generate_report` | Evolution generate report |
| 12 | `evolution_get_data_points` | Evolution get data points |
| 13 | `evolution_get_emotional_recommendations` | Evolution get emotional recommendations |
| 14 | `evolution_get_history` | Evolution get history |
| 15 | `evolution_get_insights` | Evolution get insights |
| 16 | `evolution_get_pattern` | Evolution get pattern |
| 17 | `evolution_get_patterns` | Evolution get patterns |
| 18 | `evolution_get_prediction_history` | Evolution get prediction history |
| 19 | `evolution_get_scores` | Evolution get scores |
| 20 | `evolution_get_state` | Evolution get state |
| 21 | `evolution_get_statistics` | Evolution get statistics |
| 22 | `evolution_get_stats` | Evolution get stats |
| 23 | `evolution_get_suggestions` | Evolution get suggestions |
| 24 | `evolution_health_check` | Evolution health check |
| 25 | `evolution_recall_memory` | Evolution recall memory |
| 26 | `evolution_record_prediction` | Evolution record prediction |
| 27 | `evolution_reject_suggestion` | Evolution reject suggestion |
| 28 | `evolution_rollback_action` | Evolution rollback action |
| 29 | `evolution_run_cycle` | Evolution run cycle |
| 30 | `evolution_run_full_cycle` | Evolution run full cycle |
| 31 | `evolution_safe_reset` | Evolution safe reset |
| 32 | `evolution_should_be_proactive` | Evolution should be proactive |
| 33 | `evolution_start` | Evolution start |
| 34 | `evolution_stop` | Evolution stop |
| 35 | `evolution_store_memory` | Evolution store memory |
| 36 | `evolution_update_score` | Evolution update score |
| 37 | `get_evolution_state` | Retrieve evolution state |
| 38 | `run_auto_evolution` | Run auto evolution |
| 39 | `run_evolution` | Run evolution |
| 40 | `sync_evolution_state` | Sync evolution state |

## Experience/XP (23 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `exp_add` | Exp add |
| 2 | `exp_add_batch` | Exp add batch |
| 3 | `exp_add_knowledge` | Exp add knowledge |
| 4 | `exp_get_achievements` | Exp get achievements |
| 5 | `exp_get_categories` | Exp get categories |
| 6 | `exp_get_category_stats` | Exp get category stats |
| 7 | `exp_get_global_state` | Exp get global state |
| 8 | `exp_get_history` | Exp get history |
| 9 | `exp_get_leaderboard` | Exp get leaderboard |
| 10 | `exp_get_level_up_history` | Exp get level up history |
| 11 | `exp_get_profile` | Exp get profile |
| 12 | `exp_get_project_stats` | Exp get project stats |
| 13 | `exp_get_projects` | Exp get projects |
| 14 | `exp_get_talents` | Exp get talents |
| 15 | `exp_get_timeline` | Exp get timeline |
| 16 | `exp_get_timeline_stats` | Exp get timeline stats |
| 17 | `exp_get_total_contributions` | Exp get total contributions |
| 18 | `exp_reset_talents` | Exp reset talents |
| 19 | `exp_unlock_talent` | Exp unlock talent |
| 20 | `experience_get_state` | Experience get state |
| 21 | `experience_update_state` | Experience update state |
| 22 | `xp_get_state` | Xp get state |
| 23 | `xp_sync_state` | Xp sync state |

## Export/Import (3 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `export_logs` | Export logs |
| 2 | `export_ui_theme_css` | Export ui theme css |
| 3 | `import_file` | Import file |

## Filesystem (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `fs_exists` | Fs exists |
| 2 | `get_all_files` | Retrieve all files |
| 3 | `get_files_by_category` | Retrieve files by category |
| 4 | `read_json_file` | Read json file |
| 5 | `read_production_week1_csv` | Read production week1 csv |
| 6 | `store_file` | Store file |
| 7 | `write_log` | Write log |

## Fusion Engine (18 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `fuse_multimodal` | Fuse multimodal |
| 2 | `fusion_activate_modules` | Fusion activate modules |
| 3 | `fusion_adjust_styles` | Fusion adjust styles |
| 4 | `fusion_animate_avatar` | Fusion animate avatar |
| 5 | `fusion_auto_optimize` | Fusion auto optimize |
| 6 | `fusion_build_dataset` | Fusion build dataset |
| 7 | `fusion_clear` | Fusion clear |
| 8 | `fusion_collect` | Fusion collect |
| 9 | `fusion_configure` | Fusion configure |
| 10 | `fusion_export` | Fusion export |
| 11 | `fusion_generate_ia_response` | Fusion generate ia response |
| 12 | `fusion_get_config` | Fusion get config |
| 13 | `fusion_get_stats` | Fusion get stats |
| 14 | `fusion_merge` | Fusion merge |
| 15 | `fusion_prepare_tts` | Fusion prepare tts |
| 16 | `fusion_process_lipsync` | Fusion process lipsync |
| 17 | `fusion_sync` | Fusion sync |
| 18 | `fusion_update_state` | Fusion update state |

## Health/Diagnostics (24 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `backend_run_global_selftest` | Backend run global selftest |
| 2 | `backend_self_check` | Backend self check |
| 3 | `check_connection` | Check connection |
| 4 | `check_core_health` | Check core health |
| 5 | `check_glm46v_health` | Check glm46v health |
| 6 | `check_is_titane_speaking` | Check is titane speaking |
| 7 | `check_needs_intervention` | Check needs intervention |
| 8 | `check_online_capabilities` | Check online capabilities |
| 9 | `check_sqlite_available` | Check sqlite available |
| 10 | `check_system_integrity` | Check system integrity |
| 11 | `get_backend_info` | Retrieve backend info |
| 12 | `get_cpu_metrics` | Retrieve cpu metrics |
| 13 | `get_detailed_health_report` | Retrieve detailed health report |
| 14 | `get_system_info` | Retrieve system info |
| 15 | `get_system_recommendations` | Retrieve system recommendations |
| 16 | `health_check` | Health check |
| 17 | `health_check_system` | Health check system |
| 18 | `health_get_metrics` | Health get metrics |
| 19 | `health_get_report` | Health get report |
| 20 | `health_get_state` | Health get state |
| 21 | `health_initialize` | Health initialize |
| 22 | `health_set_auto_heal` | Health set auto heal |
| 23 | `quick_health_check` | Quick health check |
| 24 | `run_system_diagnostic` | Run system diagnostic |

## HyperIntelligence (11 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `hyper_generate_insight` | Hyper generate insight |
| 2 | `hyper_get_insights` | Hyper get insights |
| 3 | `hyper_get_metrics` | Hyper get metrics |
| 4 | `hyper_get_report` | Hyper get report |
| 5 | `hyper_get_state` | Hyper get state |
| 6 | `hyper_get_thoughts` | Hyper get thoughts |
| 7 | `hyper_imagine` | Hyper imagine |
| 8 | `hyper_init` | Hyper init |
| 9 | `hyper_reason` | Hyper reason |
| 10 | `hyper_set_mode` | Hyper set mode |
| 11 | `hyper_think` | Hyper think |

## IDE Agent (10 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `ide_close_session` | Ide close session |
| 2 | `ide_file_read` | Ide file read |
| 3 | `ide_get_config` | Ide get config |
| 4 | `ide_get_session_status` | Ide get session status |
| 5 | `ide_git_diff` | Ide git diff |
| 6 | `ide_git_status` | Ide git status |
| 7 | `ide_grep_search` | Ide grep search |
| 8 | `ide_open_session` | Ide open session |
| 9 | `ide_repo_inventory` | Ide repo inventory |
| 10 | `ide_safe_command` | Ide safe command |

## Identity (38 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `identity_adjust_energy` | Identity adjust energy |
| 2 | `identity_apply_matrix_profile` | Identity apply matrix profile |
| 3 | `identity_disable_rule` | Identity disable rule |
| 4 | `identity_enable_rule` | Identity enable rule |
| 5 | `identity_evolve_trait` | Identity evolve trait |
| 6 | `identity_get_active_rules` | Identity get active rules |
| 7 | `identity_get_active_voice_profile` | Identity get active voice profile |
| 8 | `identity_get_available_modes` | Identity get available modes |
| 9 | `identity_get_coherence_score` | Identity get coherence score |
| 10 | `identity_get_current_mode` | Identity get current mode |
| 11 | `identity_get_current_tone` | Identity get current tone |
| 12 | `identity_get_full` | Identity get full |
| 13 | `identity_get_matrix` | Identity get matrix |
| 14 | `identity_get_mode_history` | Identity get mode history |
| 15 | `identity_get_personality_profile` | Identity get personality profile |
| 16 | `identity_get_personality_snapshot` | Identity get personality snapshot |
| 17 | `identity_get_personality_state` | Identity get personality state |
| 18 | `identity_get_response_profile` | Identity get response profile |
| 19 | `identity_get_rules_stats` | Identity get rules stats |
| 20 | `identity_get_status` | Identity get status |
| 21 | `identity_get_tone` | Identity get tone |
| 22 | `identity_list_modes` | Identity list modes |
| 23 | `identity_list_voice_profiles` | Identity list voice profiles |
| 24 | `identity_save_matrix` | Identity save matrix |
| 25 | `identity_set_active_voice_profile` | Identity set active voice profile |
| 26 | `identity_set_communication_style` | Identity set communication style |
| 27 | `identity_set_matrix_dimension` | Identity set matrix dimension |
| 28 | `identity_set_mode` | Identity set mode |
| 29 | `identity_set_mood` | Identity set mood |
| 30 | `identity_set_tone` | Identity set tone |
| 31 | `identity_toggle_rule` | Identity toggle rule |
| 32 | `identity_update_preference` | Identity update preference |
| 33 | `persona_get_multipliers` | Persona get multipliers |
| 34 | `persona_get_state` | Persona get state |
| 35 | `persona_initialize` | Persona initialize |
| 36 | `persona_react` | Persona react |
| 37 | `persona_reset` | Persona reset |
| 38 | `persona_update` | Persona update |

## Introspection (6 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `introspection_auto_fix` | Introspection auto fix |
| 2 | `introspection_scan` | Introspection scan |
| 3 | `sc_introspection_auto_fix` | Sc introspection auto fix |
| 4 | `sc_introspection_full_scan` | Sc introspection full scan |
| 5 | `sc_introspection_get_history` | Sc introspection get history |
| 6 | `sc_introspection_quick_scan` | Sc introspection quick scan |

## Jobs (6 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `job_cancel` | Job cancel |
| 2 | `job_create` | Job create |
| 3 | `job_get_config` | Job get config |
| 4 | `job_list` | Job list |
| 5 | `job_start` | Job start |
| 6 | `job_status` | Job status |

## Knowledge Base (19 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `detect_file_format` | Detect file format |
| 2 | `embed_image` | Embed image |
| 3 | `embed_text` | Embed text |
| 4 | `get_knowledge` | Retrieve knowledge |
| 5 | `knowledge_base_get_all` | Knowledge base get all |
| 6 | `knowledge_base_get_category` | Knowledge base get category |
| 7 | `knowledge_base_list_categories` | Knowledge base list categories |
| 8 | `knowledge_base_runtime_snapshot` | Knowledge base runtime snapshot |
| 9 | `knowledge_base_validate` | Knowledge base validate |
| 10 | `memory_get_knowledge` | Memory get knowledge |
| 11 | `parse_document` | Parse document |
| 12 | `upload_and_process_file` | Upload and process file |
| 13 | `vector_search` | Vector search |
| 14 | `vector_store_delete` | Vector store delete |
| 15 | `vector_store_get` | Vector store get |
| 16 | `vector_store_get_stats` | Vector store get stats |
| 17 | `vector_store_init` | Vector store init |
| 18 | `vector_store_insert` | Vector store insert |
| 19 | `vector_store_update` | Vector store update |

## Literary Engine (9 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `anthology_get_literary_dna` | Anthology get literary dna |
| 2 | `anthology_get_statistics` | Anthology get statistics |
| 3 | `anthology_get_top_lexical_fields` | Anthology get top lexical fields |
| 4 | `anthology_integrate_text` | Anthology integrate text |
| 5 | `anthology_search_by_layer` | Anthology search by layer |
| 6 | `anthology_search_by_tag` | Anthology search by tag |
| 7 | `literary_engine_get_style_profile` | Literary engine get style profile |
| 8 | `literary_engine_process` | Literary engine process |
| 9 | `literary_engine_update_style` | Literary engine update style |

## Logging (13 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `boot_marker_log` | Boot marker log |
| 2 | `clear_event_stream` | Clear event stream |
| 3 | `clear_logs` | Clear logs |
| 4 | `clear_system_logs` | Clear system logs |
| 5 | `get_correlated_logs` | Retrieve correlated logs |
| 6 | `get_event_stream` | Retrieve event stream |
| 7 | `get_logs` | Retrieve logs |
| 8 | `get_system_logs` | Retrieve system logs |
| 9 | `log_audit_event` | Log audit event |
| 10 | `log_entries` | Log entries |
| 11 | `log_to_file` | Log to file |
| 12 | `read_logs` | Read logs |
| 13 | `search_logs` | Search logs |

## Memory (115 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `auto_compact_memory` | Auto compact memory |
| 2 | `clear_all_memory` | Clear all memory |
| 3 | `clear_memory` | Clear memory |
| 4 | `compact_memory_directory` | Compact memory directory |
| 5 | `compact_memory_file` | Compact memory file |
| 6 | `delete_memory` | Delete memory |
| 7 | `get_memories` | Retrieve memories |
| 8 | `get_memory_state` | Retrieve memory state |
| 9 | `get_persistence_status` | Retrieve persistence status |
| 10 | `load_memory` | Load memory |
| 11 | `memory_add_item` | Memory add item |
| 12 | `memory_all_tags` | Memory all tags |
| 13 | `memory_check_and_repair` | Memory check and repair |
| 14 | `memory_check_stability` | Memory check stability |
| 15 | `memory_clear` | Memory clear |
| 16 | `memory_clear_all` | Memory clear all |
| 17 | `memory_cluster` | Memory cluster |
| 18 | `memory_compact` | Memory compact |
| 19 | `memory_compress` | Memory compress |
| 20 | `memory_compress_similar` | Memory compress similar |
| 21 | `memory_consolidate` | Memory consolidate |
| 22 | `memory_create_backup` | Memory create backup |
| 23 | `memory_debug_scan` | Memory debug scan |
| 24 | `memory_delete` | Memory delete |
| 25 | `memory_delete_entry` | Memory delete entry |
| 26 | `memory_demote` | Memory demote |
| 27 | `memory_evolution_status` | Memory evolution status |
| 28 | `memory_evolve_full` | Memory evolve full |
| 29 | `memory_export` | Memory export |
| 30 | `memory_export_conversation` | Memory export conversation |
| 31 | `memory_extract_patterns` | Memory extract patterns |
| 32 | `memory_forget` | Memory forget |
| 33 | `memory_get` | Memory get |
| 34 | `memory_get_active_projects` | Memory get active projects |
| 35 | `memory_get_active_rituals` | Memory get active rituals |
| 36 | `memory_get_all_keys` | Memory get all keys |
| 37 | `memory_get_by_tier` | Memory get by tier |
| 38 | `memory_get_clusters` | Memory get clusters |
| 39 | `memory_get_entry` | Memory get entry |
| 40 | `memory_get_items_by_level` | Memory get items by level |
| 41 | `memory_get_recent_decisions` | Memory get recent decisions |
| 42 | `memory_get_related` | Memory get related |
| 43 | `memory_get_state` | Memory get state |
| 44 | `memory_get_stats` | Memory get stats |
| 45 | `memory_get_timeline` | Memory get timeline |
| 46 | `memory_get_vector` | Memory get vector |
| 47 | `memory_grow` | Memory grow |
| 48 | `memory_hierarchy_health` | Memory hierarchy health |
| 49 | `memory_import` | Memory import |
| 50 | `memory_ingest_file` | Memory ingest file |
| 51 | `memory_init` | Memory init |
| 52 | `memory_initialize` | Memory initialize |
| 53 | `memory_is_running` | Memory is running |
| 54 | `memory_kv_delete` | Memory kv delete |
| 55 | `memory_kv_get` | Memory kv get |
| 56 | `memory_kv_set` | Memory kv set |
| 57 | `memory_list_all` | Memory list all |
| 58 | `memory_list_backups` | Memory list backups |
| 59 | `memory_ltm_snapshot` | Memory ltm snapshot |
| 60 | `memory_mtm_entries` | Memory mtm entries |
| 61 | `memory_mtm_snapshot` | Memory mtm snapshot |
| 62 | `memory_os_cluster` | Memory os cluster |
| 63 | `memory_os_delete` | Memory os delete |
| 64 | `memory_os_stats` | Memory os stats |
| 65 | `memory_os_store` | Memory os store |
| 66 | `memory_os_store_batch` | Memory os store batch |
| 67 | `memory_os_store_simple` | Memory os store simple |
| 68 | `memory_parse` | Memory parse |
| 69 | `memory_promote` | Memory promote |
| 70 | `memory_prune` | Memory prune |
| 71 | `memory_rebuild_index` | Memory rebuild index |
| 72 | `memory_recall` | Memory recall |
| 73 | `memory_recall_by_id` | Memory recall by id |
| 74 | `memory_recall_by_tag` | Memory recall by tag |
| 75 | `memory_recall_by_type` | Memory recall by type |
| 76 | `memory_recall_keyword` | Memory recall keyword |
| 77 | `memory_recall_recent` | Memory recall recent |
| 78 | `memory_recall_semantic` | Memory recall semantic |
| 79 | `memory_repair` | Memory repair |
| 80 | `memory_save_chat_interaction` | Memory save chat interaction |
| 81 | `memory_save_entry` | Memory save entry |
| 82 | `memory_scan` | Memory scan |
| 83 | `memory_search` | Memory search |
| 84 | `memory_semantic_search` | Memory semantic search |
| 85 | `memory_set` | Memory set |
| 86 | `memory_shutdown` | Memory shutdown |
| 87 | `memory_signal_stats` | Memory signal stats |
| 88 | `memory_snapshot` | Memory snapshot |
| 89 | `memory_stats` | Memory stats |
| 90 | `memory_stm_entries` | Memory stm entries |
| 91 | `memory_stm_snapshot` | Memory stm snapshot |
| 92 | `memory_store` | Memory store |
| 93 | `memory_store_conversation` | Memory store conversation |
| 94 | `memory_sync_to_vector` | Memory sync to vector |
| 95 | `memory_synthesize` | Memory synthesize |
| 96 | `memory_tick` | Memory tick |
| 97 | `memory_update_config` | Memory update config |
| 98 | `memory_v2_clear_all` | Memory v2 clear all |
| 99 | `memory_v2_embed` | Memory v2 embed |
| 100 | `memory_v2_get_ltm` | Memory v2 get ltm |
| 101 | `memory_v2_get_mtm` | Memory v2 get mtm |
| 102 | `memory_v2_get_stats` | Memory v2 get stats |
| 103 | `memory_v2_get_stm` | Memory v2 get stm |
| 104 | `memory_v2_get_summary` | Memory v2 get summary |
| 105 | `memory_v2_recall` | Memory v2 recall |
| 106 | `memory_v2_search_semantic` | Memory v2 search semantic |
| 107 | `memory_v2_store` | Memory v2 store |
| 108 | `memory_v2_summarize` | Memory v2 summarize |
| 109 | `memory_v2_tick` | Memory v2 tick |
| 110 | `memory_version` | Memory version |
| 111 | `reset_memory` | Reset memory |
| 112 | `save_memory` | Save memory |
| 113 | `store_memory` | Store memory |
| 114 | `validate_memory_file` | Validate memory file |
| 115 | `hybrid_memory_publish_governed_report` | Publish a governed hybrid memory report into desktop app-data storage with signed metadata |

## Meta-Orchestration (48 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `meta_acknowledge_alert` | Meta acknowledge alert |
| 2 | `meta_detect_desync` | Meta detect desync |
| 3 | `meta_establish_baseline` | Meta establish baseline |
| 4 | `meta_get_alerts` | Meta get alerts |
| 5 | `meta_get_alignment` | Meta get alignment |
| 6 | `meta_get_auto_healing_status` | Meta get auto healing status |
| 7 | `meta_get_evaluation_history` | Meta get evaluation history |
| 8 | `meta_get_healing_history` | Meta get healing history |
| 9 | `meta_get_monitoring_metrics` | Meta get monitoring metrics |
| 10 | `meta_get_recalibration_history` | Meta get recalibration history |
| 11 | `meta_get_report` | Meta get report |
| 12 | `meta_get_state` | Meta get state |
| 13 | `meta_get_sync_history` | Meta get sync history |
| 14 | `meta_mode_get_current_mode` | Meta mode get current mode |
| 15 | `meta_mode_get_history` | Meta mode get history |
| 16 | `meta_mode_get_kevin_state` | Meta mode get kevin state |
| 17 | `meta_mode_get_stats` | Meta mode get stats |
| 18 | `meta_mode_list_modes` | Meta mode list modes |
| 19 | `meta_mode_process` | Meta mode process |
| 20 | `meta_mode_reset` | Meta mode reset |
| 21 | `meta_selftest_all` | Meta selftest all |
| 22 | `meta_set_auto_healing` | Meta set auto healing |
| 23 | `meta_trigger_recalibration` | Meta trigger recalibration |
| 24 | `meta_trigger_sync` | Meta trigger sync |
| 25 | `meta_verify_sync` | Meta verify sync |
| 26 | `orchestration_add_timeline_event` | Orchestration add timeline event |
| 27 | `orchestration_clear_timeline` | Orchestration clear timeline |
| 28 | `orchestration_force_provider` | Orchestration force provider |
| 29 | `orchestration_get_harmonia` | Orchestration get harmonia |
| 30 | `orchestration_get_multi_ai` | Orchestration get multi ai |
| 31 | `orchestration_get_nexus` | Orchestration get nexus |
| 32 | `orchestration_get_singularity_fragment` | Orchestration get singularity fragment |
| 33 | `orchestration_get_timeline` | Orchestration get timeline |
| 34 | `orchestration_get_unified_state` | Orchestration get unified state |
| 35 | `orchestration_ping_providers` | Orchestration ping providers |
| 36 | `orchestration_set_auto_mode` | Orchestration set auto mode |
| 37 | `orchestration_throttle_flow` | Orchestration throttle flow |
| 38 | `orchestration_update_nexus_node` | Orchestration update nexus node |
| 39 | `orchestrator_enqueue_task` | Orchestrator enqueue task |
| 40 | `orchestrator_get_engines` | Orchestrator get engines |
| 41 | `orchestrator_get_health` | Orchestrator get health |
| 42 | `orchestrator_get_metrics` | Orchestrator get metrics |
| 43 | `orchestrator_get_queue` | Orchestrator get queue |
| 44 | `orchestrator_get_report` | Orchestrator get report |
| 45 | `orchestrator_get_state` | Orchestrator get state |
| 46 | `orchestrator_init` | Orchestrator init |
| 47 | `orchestrator_run_cycle` | Orchestrator run cycle |
| 48 | `orchestrator_set_mode` | Orchestrator set mode |

## Monitoring (16 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `clear_ia_request_history` | Clear ia request history |
| 2 | `get_ia_engine_metrics` | Retrieve ia engine metrics |
| 3 | `get_ia_global_stats` | Retrieve ia global stats |
| 4 | `get_ia_request_history` | Retrieve ia request history |
| 5 | `get_ipc_metrics` | Retrieve ipc metrics |
| 6 | `get_ipc_summary` | Retrieve ipc summary |
| 7 | `get_metric` | Retrieve metric |
| 8 | `get_performance_metrics` | Retrieve performance metrics |
| 9 | `get_recent_decisions` | Retrieve recent decisions |
| 10 | `get_recommended_watch_delay` | Retrieve recommended watch delay |
| 11 | `get_system_metrics` | Retrieve system metrics |
| 12 | `list_all_metrics` | List all metrics |
| 13 | `mesh_get_stats` | Mesh get stats |
| 14 | `mesh_initialize` | Mesh initialize |
| 15 | `reset_ia_engine_metrics` | Reset ia engine metrics |
| 16 | `reset_ipc_metrics` | Reset ipc metrics |

## Multi-AI (24 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `create_ia_policy` | Create ia policy |
| 2 | `delete_ia_policy` | Delete ia policy |
| 3 | `get_agent_recommended_provider` | Retrieve agent recommended provider |
| 4 | `get_ia_context` | Retrieve ia context |
| 5 | `get_ia_policies` | Retrieve ia policies |
| 6 | `get_next_fallback_ia_engine` | Retrieve next fallback ia engine |
| 7 | `list_ai_providers` | List ai providers |
| 8 | `multi_ai_best_provider` | Multi ai best provider |
| 9 | `multi_ai_configure_keys` | Multi ai configure keys |
| 10 | `multi_ai_evaluate` | Multi ai evaluate |
| 11 | `multi_ai_generate` | Multi ai generate |
| 12 | `multi_ai_generate_dual` | Multi ai generate dual |
| 13 | `multi_ai_generate_fused` | Multi ai generate fused |
| 14 | `multi_ai_get_state` | Multi ai get state |
| 15 | `multi_ai_providers` | Multi ai providers |
| 16 | `multi_ai_set_fallback` | Multi ai set fallback |
| 17 | `save_ia_policies` | Save ia policies |
| 18 | `set_active_ia_engine` | Set active ia engine |
| 19 | `set_ia_auto_fallback` | Set ia auto fallback |
| 20 | `set_ia_fallback_order` | Set ia fallback order |
| 21 | `set_last_used_ia_agent` | Set last used ia agent |
| 22 | `toggle_ia_policy` | Toggle ia policy |
| 23 | `update_available_ia_engines` | Update available ia engines |
| 24 | `update_ia_engine_status` | Update ia engine status |

## Multimodal (16 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `analyze_image` | Analyze image |
| 2 | `analyze_image_path` | Analyze image path |
| 3 | `clear_image_memory` | Clear image memory |
| 4 | `get_all_images` | Retrieve all images |
| 5 | `get_multimodal_stats` | Retrieve multimodal stats |
| 6 | `multimodal_analyze_image` | Multimodal analyze image |
| 7 | `multimodal_audio_analyze` | Multimodal audio analyze |
| 8 | `multimodal_get_diagnostics` | Multimodal get diagnostics |
| 9 | `multimodal_search_cross_modal` | Multimodal search cross modal |
| 10 | `remove_image` | Remove image |
| 11 | `search_images_by_tags` | Search images by tags |
| 12 | `search_images_by_text` | Search images by text |
| 13 | `search_similar_images` | Search similar images |
| 14 | `store_image` | Store image |
| 15 | `switch_vision_model` | Switch vision model |
| 16 | `update_multimodal_config` | Update multimodal config |

## Network (9 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `http_request` | Http request |
| 2 | `ping` | Ping |
| 3 | `ping_gemini` | Ping gemini |
| 4 | `ping_ollama` | Ping ollama |
| 5 | `start_glm46v_server` | Start glm46v server |
| 6 | `stop_glm46v_server` | Stop glm46v server |
| 7 | `test_copilot_connection` | Test copilot connection |
| 8 | `test_gemini_services` | Test gemini services |
| 9 | `web_research` | Web research |

## Ollama (1 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `ollama_generate` | Ollama generate |

## OneCore (11 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `one_core_cleanup` | One core cleanup |
| 2 | `one_core_execute_command` | One core execute command |
| 3 | `one_core_force_sync` | One core force sync |
| 4 | `one_core_get_engine_status` | One core get engine status |
| 5 | `one_core_get_event_history` | One core get event history |
| 6 | `one_core_get_metrics` | One core get metrics |
| 7 | `one_core_get_state` | One core get state |
| 8 | `one_core_list_commands` | One core list commands |
| 9 | `one_core_run_diagnostic` | One core run diagnostic |
| 10 | `one_core_set_mode` | One core set mode |
| 11 | `one_core_verify_integrity` | One core verify integrity |

## Overdrive (2 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `overdrive_get_version` | Overdrive get version |
| 2 | `overdrive_health_check` | Overdrive health check |

## Persistent Memory (12 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `persistent_memory_add_to_bundle` | Persistent memory add to bundle |
| 2 | `persistent_memory_archive_entry` | Persistent memory archive entry |
| 3 | `persistent_memory_create_bundle` | Persistent memory create bundle |
| 4 | `persistent_memory_create_summary` | Persistent memory create summary |
| 5 | `persistent_memory_delete_entry` | Persistent memory delete entry |
| 6 | `persistent_memory_export` | Persistent memory export |
| 7 | `persistent_memory_get_bundles` | Persistent memory get bundles |
| 8 | `persistent_memory_get_context` | Persistent memory get context |
| 9 | `persistent_memory_get_stats` | Persistent memory get stats |
| 10 | `persistent_memory_promote_entry` | Persistent memory promote entry |
| 11 | `persistent_memory_read` | Persistent memory read |
| 12 | `persistent_memory_write_entry` | Persistent memory write entry |

## Projects (8 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `get_active_projects` | Retrieve active projects |
| 2 | `get_active_rituals` | Retrieve active rituals |
| 3 | `project_add` | Project add |
| 4 | `project_analyze` | Project analyze |
| 5 | `project_delete` | Project delete |
| 6 | `project_get` | Project get |
| 7 | `project_list` | Project list |
| 8 | `project_update` | Project update |

## QA / Testing (5 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `qa_get_last_report` | Qa get last report |
| 2 | `qa_run_all` | Qa run all |
| 3 | `qa_run_module` | Qa run module |
| 4 | `test_ai_local` | Test ai local |
| 5 | `test_rate_limit` | Test rate limit |

## Rate Limiting (4 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `cleanup_rate_limiter` | Cleanup rate limiter |
| 2 | `get_rate_limit_stats` | Retrieve rate limit stats |
| 3 | `reset_rate_limit` | Reset rate limit |
| 4 | `should_throttle` | Evaluate if should throttle |

## Repair/Healing (6 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `repair_deep_rebuild` | Repair deep rebuild |
| 2 | `repair_detect_anomalies` | Repair detect anomalies |
| 3 | `repair_execute` | Repair execute |
| 4 | `repair_fallback_recovery` | Repair fallback recovery |
| 5 | `repair_get_integrity_map` | Repair get integrity map |
| 6 | `repair_regenerate_module` | Repair regenerate module |

## Security (11 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `append_security_log` | Append security log |
| 2 | `clear_security_log` | Clear security log |
| 3 | `export_security_log` | Export security log |
| 4 | `get_security_log` | Retrieve security log |
| 5 | `secure_delete_file` | Secure delete file |
| 6 | `secure_import_file` | Secure import file |
| 7 | `secure_list_files` | Secure list files |
| 8 | `secure_read_file` | Secure read file |
| 9 | `validate_tauri_only` | Validate tauri only |
| 10 | `security_audit_sync_journal` | Sync federated security audit journal into governed app-data storage; proven on the current desktop debug runtime |
| 11 | `security_audit_publish_signed_export` | Publish a signed governed export of the security audit journal; proven on the current desktop debug runtime |

## Self-Healing (31 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `auto_heal_get_logs` | Auto heal get logs |
| 2 | `auto_heal_repair` | Auto heal repair |
| 3 | `auto_heal_scan` | Auto heal scan |
| 4 | `self_healing_disable` | Self healing disable |
| 5 | `self_healing_enable` | Self healing enable |
| 6 | `self_healing_get_status` | Self healing get status |
| 7 | `self_healing_trigger` | Self healing trigger |
| 8 | `selfheal_force_evaluation` | Selfheal force evaluation |
| 9 | `selfheal_get_health` | Selfheal get health |
| 10 | `selfheal_get_prediction` | Selfheal get prediction |
| 11 | `selfheal_get_state` | Selfheal get state |
| 12 | `selfheal_get_vitals` | Selfheal get vitals |
| 13 | `selfheal_isolate_module` | Selfheal isolate module |
| 14 | `selfheal_load_profile` | Selfheal load profile |
| 15 | `selfheal_mini_audit` | Selfheal mini audit |
| 16 | `selfheal_rebuild_memory` | Selfheal rebuild memory |
| 17 | `selfheal_regenerate_config` | Selfheal regenerate config |
| 18 | `selfheal_repair_json` | Selfheal repair json |
| 19 | `selfheal_reset_state` | Selfheal reset state |
| 20 | `selfheal_restart_module` | Selfheal restart module |
| 21 | `selfheal_restart_process` | Selfheal restart process |
| 22 | `selfheal_restart_worker` | Selfheal restart worker |
| 23 | `selfheal_save_profile` | Selfheal save profile |
| 24 | `selfheal_switch_provider` | Selfheal switch provider |
| 25 | `selfheal_sync_state` | Selfheal sync state |
| 26 | `selfheal_sync_with_singularity` | Selfheal sync with singularity |
| 27 | `titan_run_full_integrity_check` | Titan run full integrity check |
| 28 | `titan_run_self_healing` | Titan run self healing |
| 29 | `watchdog_fix` | Watchdog fix |
| 30 | `watchdog_run_selftest` | Watchdog run selftest |
| 31 | `watchdog_scan` | Watchdog scan |

## Semantic Skills (10 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `semantic_add_skill` | Semantic add skill |
| 2 | `semantic_analyze_intent` | Semantic analyze intent |
| 3 | `semantic_chain_skills` | Semantic chain skills |
| 4 | `semantic_clear_cache` | Semantic clear cache |
| 5 | `semantic_execute_skill` | Semantic execute skill |
| 6 | `semantic_get_cache_size` | Semantic get cache size |
| 7 | `semantic_get_skill` | Semantic get skill |
| 8 | `semantic_list_skills` | Semantic list skills |
| 9 | `semantic_remove_skill` | Semantic remove skill |
| 10 | `semantic_toggle_skill` | Semantic toggle skill |

## Singularity (37 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `get_singularity_state` | Retrieve singularity state |
| 2 | `singularity_activate` | Singularity activate |
| 3 | `singularity_check_coherence` | Singularity check coherence |
| 4 | `singularity_detect_emergence` | Singularity detect emergence |
| 5 | `singularity_diff` | Singularity diff |
| 6 | `singularity_export_json` | Singularity export json |
| 7 | `singularity_fuse_all` | Singularity fuse all |
| 8 | `singularity_get` | Singularity get |
| 9 | `singularity_get_adaptive` | Singularity get adaptive |
| 10 | `singularity_get_cognitive` | Singularity get cognitive |
| 11 | `singularity_get_full_state` | Singularity get full state |
| 12 | `singularity_get_global_coherence` | Singularity get global coherence |
| 13 | `singularity_get_meta` | Singularity get meta |
| 14 | `singularity_get_physical` | Singularity get physical |
| 15 | `singularity_get_state` | Singularity get state |
| 16 | `singularity_get_symbolic` | Singularity get symbolic |
| 17 | `singularity_hash` | Singularity hash |
| 18 | `singularity_integrity` | Singularity integrity |
| 19 | `singularity_is_critical` | Singularity is critical |
| 20 | `singularity_load_state` | Singularity load state |
| 21 | `singularity_meta` | Singularity meta |
| 22 | `singularity_repair` | Singularity repair |
| 23 | `singularity_save_state` | Singularity save state |
| 24 | `singularity_self_check` | Singularity self check |
| 25 | `singularity_selftest_full` | Singularity selftest full |
| 26 | `singularity_set` | Singularity set |
| 27 | `singularity_snapshot` | Singularity snapshot |
| 28 | `singularity_sync` | Singularity sync |
| 29 | `singularity_unify` | Singularity unify |
| 30 | `singularity_update_adaptive` | Singularity update adaptive |
| 31 | `singularity_update_cognitive` | Singularity update cognitive |
| 32 | `singularity_update_full_state` | Singularity update full state |
| 33 | `singularity_update_meta` | Singularity update meta |
| 34 | `singularity_update_physical` | Singularity update physical |
| 35 | `singularity_update_symbolic` | Singularity update symbolic |
| 36 | `sync_singularity` | Sync singularity |
| 37 | `toggle_singularity` | Toggle singularity |

## Snapshots (5 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `delete_snapshot` | Delete snapshot |
| 2 | `list_snapshots` | List snapshots |
| 3 | `read_snapshot` | Read snapshot |
| 4 | `restore_snapshot` | Restore snapshot |
| 5 | `write_snapshot` | Write snapshot |

## State Management (14 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `delete_state` | Delete state |
| 2 | `get_core_system_status` | Retrieve core system status |
| 3 | `get_full_system_state` | Retrieve full system state |
| 4 | `get_state` | Retrieve state |
| 5 | `get_system_health` | Retrieve system health |
| 6 | `get_system_state` | Retrieve system state |
| 7 | `get_travel_stats` | Retrieve travel stats |
| 8 | `get_vad_state` | Retrieve vad state |
| 9 | `set_state` | Set state |
| 10 | `state_get` | State get |
| 11 | `system_get_status` | System get status |
| 12 | `system_optimize` | System optimize |
| 13 | `system_recovery` | System recovery |
| 14 | `titan_state_get` | Titan state get |

## System Center (22 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `sc_add_log` | Sc add log |
| 2 | `sc_clear_logs` | Sc clear logs |
| 3 | `sc_get_cluster_peers` | Sc get cluster peers |
| 4 | `sc_get_cluster_stats` | Sc get cluster stats |
| 5 | `sc_get_cluster_status` | Sc get cluster status |
| 6 | `sc_get_diagnostic_status` | Sc get diagnostic status |
| 7 | `sc_get_env` | Sc get env |
| 8 | `sc_get_log_stats` | Sc get log stats |
| 9 | `sc_get_logs` | Sc get logs |
| 10 | `sc_hypervision_clear_anomalies` | Sc hypervision clear anomalies |
| 11 | `sc_hypervision_get_anomalies` | Sc hypervision get anomalies |
| 12 | `sc_hypervision_get_history` | Sc hypervision get history |
| 13 | `sc_hypervision_get_layers` | Sc hypervision get layers |
| 14 | `sc_hypervision_get_metrics` | Sc hypervision get metrics |
| 15 | `sc_hypervision_get_state` | Sc hypervision get state |
| 16 | `sc_hypervision_resolve_anomaly` | Sc hypervision resolve anomaly |
| 17 | `sc_hypervision_start` | Sc hypervision start |
| 18 | `sc_hypervision_stop` | Sc hypervision stop |
| 19 | `sc_initialize_cluster` | Sc initialize cluster |
| 20 | `sc_run_full_diagnostics` | Sc run full diagnostics |
| 21 | `sc_run_quick_diagnostics` | Sc run quick diagnostics |
| 22 | `sc_shutdown_cluster` | Sc shutdown cluster |

## TITAN Core (33 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `titan_check_integrity` | Titan check integrity |
| 2 | `titan_compact_journal` | Titan compact journal |
| 3 | `titan_docs_generate_markdown` | Titan docs generate markdown |
| 4 | `titan_docs_get` | Titan docs get |
| 5 | `titan_docs_list` | Titan docs list |
| 6 | `titan_docs_list_by_module` | Titan docs list by module |
| 7 | `titan_docs_registry` | Titan docs registry |
| 8 | `titan_docs_search` | Titan docs search |
| 9 | `titan_dump_raw_state` | Titan dump raw state |
| 10 | `titan_export_data` | Titan export data |
| 11 | `titan_force_snapshot` | Titan force snapshot |
| 12 | `titan_force_snapshot_current` | Titan force snapshot current |
| 13 | `titan_get_events_since` | Titan get events since |
| 14 | `titan_get_memory_health` | Titan get memory health |
| 15 | `titan_get_persistence_status` | Titan get persistence status |
| 16 | `titan_get_schema_version` | Titan get schema version |
| 17 | `titan_import_data` | Titan import data |
| 18 | `titan_list_snapshots` | Titan list snapshots |
| 19 | `titan_load_state` | Titan load state |
| 20 | `titan_memory_doctor_compact` | Titan memory doctor compact |
| 21 | `titan_memory_doctor_diagnose` | Titan memory doctor diagnose |
| 22 | `titan_memory_doctor_export` | Titan memory doctor export |
| 23 | `titan_memory_doctor_heal` | Titan memory doctor heal |
| 24 | `titan_memory_doctor_summary` | Titan memory doctor summary |
| 25 | `titan_migrate_state` | Titan migrate state |
| 26 | `titan_persist_event` | Titan persist event |
| 27 | `titan_persistence_init` | Titan persistence init |
| 28 | `titan_persistence_shutdown` | Titan persistence shutdown |
| 29 | `titan_recover_state` | Titan recover state |
| 30 | `titan_reset_module` | Titan reset module |
| 31 | `titan_validate_archive` | Titan validate archive |
| 32 | `titan_validate_invariants` | Titan validate invariants |
| 33 | `titan_verify_integrity` | Titan verify integrity |

## TTS/Voice (13 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `calibrate_titane_voice` | Calibrate titane voice |
| 2 | `get_titane_voice_status` | Retrieve titane voice status |
| 3 | `is_speaking` | Check status speaking |
| 4 | `pause_speaking` | Pause speaking |
| 5 | `resume_speaking` | Resume speaking |
| 6 | `speak` | Speak |
| 7 | `speak_text` | Speak text |
| 8 | `stop_speaking` | Stop speaking |
| 9 | `test_tts` | Test tts |
| 10 | `tts_generate_test_buffer` | Tts generate test buffer |
| 11 | `tts_speak` | Tts speak |
| 12 | `tts_stop` | Tts stop |
| 13 | `voice_synthesize_speech` | Voice synthesize speech |

## Tasks (4 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `task_create` | Task create |
| 2 | `task_delete` | Task delete |
| 3 | `task_list` | Task list |
| 4 | `task_update_status` | Task update status |

## Temporal Engine (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `add_timeline_event` | Add timeline event |
| 2 | `get_timeline` | Retrieve timeline |
| 3 | `temporal_add_timeline_event` | Temporal add timeline event |
| 4 | `temporal_get_timeline_events` | Temporal get timeline events |
| 5 | `temporal_get_today_state` | Temporal get today state |
| 6 | `temporal_save_today_blocks` | Temporal save today blocks |
| 7 | `temporal_update_energy` | Temporal update energy |

## Training (15 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `training_disable` | Training disable |
| 2 | `training_enable` | Training enable |
| 3 | `training_end_session` | Training end session |
| 4 | `training_export_patterns` | Training export patterns |
| 5 | `training_find_patterns` | Training find patterns |
| 6 | `training_generate_report` | Training generate report |
| 7 | `training_get_state` | Training get state |
| 8 | `training_get_stats` | Training get stats |
| 9 | `training_import_patterns` | Training import patterns |
| 10 | `training_learn_pattern` | Training learn pattern |
| 11 | `training_process_feedbacks` | Training process feedbacks |
| 12 | `training_prune_patterns` | Training prune patterns |
| 13 | `training_record_feedback` | Training record feedback |
| 14 | `training_start_session` | Training start session |
| 15 | `training_verify_kevin` | Training verify kevin |

## VAD (7 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `start_whisper_streaming` | Start whisper streaming |
| 2 | `stop_whisper_streaming` | Stop whisper streaming |
| 3 | `vad_configure` | Vad configure |
| 4 | `vad_get_state` | Vad get state |
| 5 | `vad_process_frame` | Vad process frame |
| 6 | `vad_reset` | Vad reset |
| 7 | `vad_test` | Vad test |

## Voice (19 commandes)

| # | Commande | Description |
|---|----------|-------------|
| 1 | `get_recording_status` | Retrieve recording status |
| 2 | `voice_calibrate_microphone` | Voice calibrate microphone |
| 3 | `voice_cancel_recording` | Voice cancel recording |
| 4 | `voice_check_interruption` | Voice check interruption |
| 5 | `voice_detect_wake_word` | Voice detect wake word |
| 6 | `voice_disable_duplex` | Voice disable duplex |
| 7 | `voice_enable_duplex` | Voice enable duplex |
| 8 | `voice_extract_mfcc` | Voice extract mfcc |
| 9 | `voice_get_available_models` | Voice get available models |
| 10 | `voice_get_config` | Voice get config |
| 11 | `voice_get_status` | Voice get status |
| 12 | `voice_is_recording` | Voice is recording |
| 13 | `voice_play_audio` | Voice play audio |
| 14 | `voice_start_listening` | Voice start listening |
| 15 | `voice_stop_listening` | Voice stop listening |
| 16 | `voice_stop_speaking` | Voice stop speaking |
| 17 | `voice_test_pipeline` | Voice test pipeline |
| 18 | `voice_transcribe_audio` | Voice transcribe audio |
| 19 | `voice_update_config` | Voice update config |

## Remote API Key Management (Phase 1 — 2026-04-27)

| # | Command | Description | Ring | Source |
|---|---------|-------------|------|--------|
| 1 | `remote_key_create` | Crée une clé API nommée (argon2id) avec scopes configurables. Retourne `key_id` + `secret_once` (affiché une seule fois). | Ring 0 | `src-tauri/src/remote_key_commands.rs` |
| 2 | `remote_key_list` | Liste toutes les clés (masquées — aucun secret exposé). | Ring 0 | `src-tauri/src/remote_key_commands.rs` |
| 3 | `remote_key_revoke` | Désactive une clé par `key_id`. | Ring 0 | `src-tauri/src/remote_key_commands.rs` |
| 4 | `remote_key_rotate` | Révoque l'ancienne clé, génère une nouvelle. Retourne `new_key_id` + `new_secret_once`. | Ring 0 | `src-tauri/src/remote_key_commands.rs` |

**Managed state**: `RemoteKeyStoreState` enregistré dans `main.rs` via `.manage()`.  
**Frontend service**: `src/services/remoteKeyManager/index.ts`  
**Security**: toutes les 4 commandes présentes dans `ALLOWED_COMMANDS` (`src/lib/security.ts`).

---

## Meta-Energy IPC Commands (V32.0.0 — Phase 9 SP#20)

| # | Commande | Description | Ring | Fichier source |
|---|----------|-------------|------|----------------|
| 1 | `meta_energy_get_state` | État énergétique courant: energy_level, normalized, fatigue_level, cognitive_multiplier | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 2 | `meta_energy_get_fatigue` | Niveau de fatigue (Fresh/Normal/Tired/Exhausted) | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 3 | `meta_energy_get_recovery_plan` | Plan de récupération basé sur fatigue + énergie | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 4 | `meta_energy_get_load_balance` | Équilibre de charge (throttle_factor) pour requested_load donné | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 5 | `meta_energy_get_homeostasis` | Évaluation homéostatique (deviation, correction, in_balance) | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 6 | `meta_energy_get_forecast` | Prévision énergétique 24h (circadienne) | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 7 | `meta_energy_apply_delta` | Appliquer delta énergie (-0.5..0.5) avec label activité | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |
| 8 | `meta_energy_get_diagnostics` | Diagnostics complets (energy, fatigue, homeostasis, history_entries) | Ring 0 | `src-tauri/src/meta_energy/commands.rs` |

**Managed state**: `Arc<RwLock<MetaEnergyState>>` enregistré dans `main.rs` via `.manage()`.  
**Frontend hook**: `src/hooks/useMetaEnergy.ts`  
**Security**: 8 commandes présentes dans `ALLOWED_COMMANDS` (`src/lib/security.ts`).

---

## OAuth Facebook PKCE — v33.0.5

**Module**: `src-tauri/src/auth/oauth/`  
**Source commands**: `src-tauri/src/auth/commands.rs` (oauth section)  
**Registered**: `src-tauri/src/main.rs` invoke_handler  
**Security**: PKCE-only (no client_secret), App ID via env `TITANE_FB_APP_ID` (OWASP A02 compliant)  
**Redirect URI**: `titane://auth/callback` (custom protocol — deep-link)  
**Plugin**: `tauri-plugin-deep-link` v2

| # | Command | Description | Ring | Source |
|---|---------|-------------|------|--------|
| 1 | `oauth_facebook_initiate` | Génère PKCE pair + auth URL Facebook → ouvre système browser | Ring 0 | `src-tauri/src/auth/commands.rs` |
| 2 | `oauth_facebook_callback` | Valide state CSRF, échange code→token PKCE, fetch profil Graph API | Ring 0 | `src-tauri/src/auth/commands.rs` |
| 3 | `oauth_facebook_get_profile` | Lit profil Facebook chiffré depuis SecretsEngine | Ring 0 | `src-tauri/src/auth/commands.rs` |
| 4 | `oauth_facebook_logout` | Supprime credentials Facebook du SecretsEngine | Ring 0 | `src-tauri/src/auth/commands.rs` |

**Frontend service**: `src/services/auth/oauthService.ts`  
**Zustand store**: `src/core/auth/oauthStore.ts`  
**UI components**: `FacebookLoginButton` (`data-testid="facebook-login-button"`), `OAuthProfileCard` (`data-testid="oauth-profile-card"`)  
**Tests contract**: `tests/contract/tauri-ipc-contract.test.ts` (7 tests — PASS)  
**ALLOWED_COMMANDS**: 4 commandes enregistrées dans `src/lib/security.ts`
