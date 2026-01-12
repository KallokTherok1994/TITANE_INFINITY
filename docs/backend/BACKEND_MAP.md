# TITANE∞ Backend Map v26.2.0

**Date:** 2026-01-03  
**Version:** 26.2.0  
**Architecture:** 4-Ring Model + 9 Cognitive Engines + OMEGA Pipeline v2

> NOTE (gouvernance): document historique (v26.2.0). Runtime actuel: v26.3.0.
> Production: EN ATTENTE (autorisation explicite requise).

---

## Table of Contents
1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Module Structure](#module-structure)
3. [Tauri Commands Registry](#tauri-commands-registry)
4. [Events & Listeners](#events--listeners)
5. [External API Integrations](#external-api-integrations)
6. [Security Surface](#security-surface)
7. [Storage & Persistence](#storage--persistence)

---

## Backend Architecture Overview

### Core Stack
- **Runtime:** Tauri v2.2.0 + Rust 1.83 (edition 2021)
- **Async:** Tokio 1.35 (full features)
- **Build Profile:**
  - Dev: opt-level=1, debug=true, incremental=true
  - Release: opt-level=3, lto="thin", codegen-units=16, strip=false (Tauri bundle compatibility)

### 4-Ring Architecture Model

```
Ring 4 (OS/UI)
  ├─ src-tauri/src/main.rs (350+ commands)
  ├─ React components (src/)
  │
Ring 3 (Services - I/O Orchestration)
  ├─ overdrive/* (Chat, Voice)
  ├─ auth/* (Authentication)
  ├─ cloud/* (Sync)
  ├─ audio/* (TTS, Recording)
  ├─ api/* (Helios, Memory)
  │
Ring 2 (Engines - Pure Logic)
  ├─ conversation_engine (OMEGA Pipeline v2)
  ├─ singularity_fusion (AutoFix, AutoHeal, CrashGuard)
  ├─ avatar/* (Appearance, FullBody)
  ├─ cognitive_learning/*
  ├─ engines/unified_memory/*
  │
Ring 1 (Core - Types & Constants)
  ├─ types/* (memory_chat, nexus, sentinel, etc.)
  ├─ core/* (tapi_error, utils, legacy)
  ├─ error.rs (TitaneError, TAPIError)
```

### 9 Cognitive Engines

1. **Orchestrator** — Global coordination (src/engines/orchestrator)
2. **StyleEngine** — Theme & appearance (src/engines/style)
3. **CoherenceEngine** — Context consistency (commands/coherence_commands.rs)
4. **ReflectionEngine** — Self-analysis (cognitive/)
5. **EmotionEngine** — Emotional states (emotion/)
6. **UnifiedMemory** — STM/MTM/LTM (engines/unified_memory/)
7. **BehaviorEngine** — Pattern learning (adaptive/)
8. **AdaptationEngine** — Context adaptation (adaptive/)
9. **SystemHealth** — Monitoring (commands/system_health_commands.rs)

---

## Module Structure

### Backend Modules (src-tauri/src/)

#### Core Infrastructure (Ring 1)
- `main.rs` — Entry point, 350+ command registrations
- `lib.rs` — Library exports
- `error.rs` — TitaneError enum (23 variants)
- `types/` — Core types (memory_chat, nexus, sentinel, helios)
- `core/` — Utilities, legacy bridges
- `state.rs` — Global app state
- `bounded.rs` — Bounded channel helpers

#### Cognitive & AI (Ring 2)
- `conversation_engine/` — OMEGA Pipeline v2 (conversation_generate)
- `chat_engine/` — Legacy chat system (DEPRECATED)
- `cognitive/` — Cognitive adapters
- `cognitive_learning/` — Knowledge growth, summarization
- `ai/` — Multi-provider router (OpenAI, Claude, Gemini, Copilot, Ollama)
  - `router.rs` — Intelligent routing
  - `orchestrator_multi.rs` — Multi-model orchestration
  - `providers/` — Provider implementations
  - `cache.rs` — LRU response cache
- `neuro_symbolic/` — Symbolic reasoning + neural fusion

#### Avatar & Voice (Ring 2/3)
- `avatar/` — Immersive avatar engine
  - `avatar_commands.rs` — 9 commands (prepare_speech, advance_lip_sync, etc.)
  - `appearance_commands.rs` — 10 commands (style management)
  - `avatar_floating_commands.rs` — 18 commands (window positioning)
  - `fullbody_commands.rs` — 12 commands (gesture, expression, posture)
  - `avatar_selftest.rs` + `fullbody_selftest.rs` — Health checks
- `audio/` — Audio subsystem
  - `commands.rs` — 13 commands (TTS, VAD, device selection)
  - `recording_engine.rs` — Microphone capture
- `overdrive/voice_engine.rs` — 17 commands (voice pipeline)
- `tts/` — Text-to-speech engine

#### Memory & State (Ring 2/3)
- `engines/unified_memory/` — Ring 2 pure logic
  - `api.rs` — Tauri commands (6 commands)
  - Memory layers: STM (short-term), MTM (mid-term), LTM (long-term)
- `memory_os/` — Operating system-level memory (Ring 3)
  - `commands.rs` — 5 commands (memory_scan, memory_store, etc.)
  - `api.rs` — Additional memory APIs
- `memory_persistence.rs` — Persistence layer
- `memory_compactor.rs` — Memory optimization (DEPRECATED → unified_memory_v2)
- `api/memory_api.rs` — 9 commands (timeline, snapshots, logs)

#### Singularity Fusion (Ring 2)
- `singularity_fusion/` — Self-repair & optimization (70 commands)
  - `auto_fix.rs` — 16 commands (detect/fix Rust/TS/React issues)
  - `auto_heal.rs` — 27 commands (module healing, state resync)
  - `crash_guard.rs` — 9 commands (threat detection, emergency shutdown)
  - `performance.rs` — 6 commands (CPU throttle, GPU optimize, memory compress)
  - `unified_pipeline.rs` — 9 commands (cognitive pipeline orchestration)
  - `fusion_engine.rs` — Core fusion logic
- `singularity_state/` — 5-layer unified state (17 commands)
  - Physical, Cognitive, Symbolic, Adaptive, Meta layers
  - `commands.rs` — Get/update/save/load state

#### System & Diagnostics (Ring 3/4)
- `system_center/` — System monitoring (11 commands)
  - `diagnostics.rs` — Quick/full diagnostics
  - `hypervision.rs` — Supervisor mode
  - `introspection.rs` — Self-analysis
  - `cluster.rs` — Node cluster management
  - `logs.rs` — Log management
- `devtools/` — Developer tools (3 commands)
- `backend_selftest.rs` — Backend health checks
- `watchdog/commands.rs` — Watchdog monitoring

#### Security & Auth (Ring 3)
- `security/` — Security subsystem
  - `secrets_engine.rs` — AES-256-GCM encrypted key-value store
  - `permission_guard.rs` — Role-based access control (Admin/User/Guest)
  - `permissions.rs` — Permission definitions
  - `sandbox.rs` — Execution isolation
  - `validation.rs` — Input sanitization
  - `rate_limit.rs` — Adaptive rate limiting
  - `shell_guard.rs` — Secured shell command execution
  - `audit.rs` — Security audit logging
- `auth/commands.rs` — 9 commands (token management, API keys, roles)
- `secure_commands.rs` — 7 commands (API key storage/retrieval)
- `secure_engine.rs` — Security core

#### Commands Hub (Ring 4)
- `commands/` — 50+ command files
  - `governance_commands.rs` — 11 commands (IA policies, permissions)
  - `system_center_commands.rs` — 7 commands (logs, cluster, hypervision)
  - `memory_os_commands.rs` — 5 commands (scan, store, clear)
  - `devtools_commands.rs` — 3 commands (docs navigation)
  - `coherence_commands.rs` — 5 commands (coherence engine)
  - `unified_memory_commands.rs` — 6 commands (memory layers)
  - `system_health_commands.rs` — 9 commands (health monitoring)
  - `chat_generate_commands.rs` — 3 commands (provider-specific generation)
  - `copilot_commands.rs` — 4 commands (GitHub Copilot integration)
  - `ia_commands.rs` — Legacy IA commands
  - `exp_fusion.rs` — 8 commands (XP/EXP UI)
  - `state_bridge_commands.rs` — 7 commands (Frontend OS bridge)
  - Many more...

#### Specialized Engines (Ring 2/3)
- `hyper_evolution/` — Structural rewriting (5 commands)
- `evolution/` — Evolution loop
- `creation/` — Content generation
- `narrative/` — Story engine
- `meta_orchestrator/` — Meta-level coordination
- `numeric_twin/` — Digital twin
- `design_center/` — Theme management
- `reality_renderer/` — Reality simulation
- `harmonic_os/` — Harmonic coordination
- `harmonia_engine.rs` — Harmony engine

#### Configuration & Persistence (Ring 3)
- `config/` — Configuration hub (9 commands)
  - `io.rs` — Load/save
  - `presets.rs` — Preset management
  - `update.rs` — Config updates
- `onboarding/` — Onboarding system (3 commands)
- `persistence/commands.rs` — Persistence layer

---

## Tauri Commands Registry

**Total Commands:** ~350 commands

### Command Categories

#### 1. Frontend OS Bridge (7 commands)
| Command | File | Purpose | Frontend Callers |
|---------|------|---------|------------------|
| `ping` | state_bridge_commands.rs | Health check | All components |
| `get_system_state` | state_bridge_commands.rs | Get full system state | System monitors |
| `get_module_health` | state_bridge_commands.rs | Module health status | Dashboard |
| `system_get_status` | state_bridge_commands.rs | System status | Status bar |
| `get_state` | state_bridge_commands.rs | Get generic state | Multiple |
| `set_state` | state_bridge_commands.rs | Set generic state | Multiple |
| `delete_state` | state_bridge_commands.rs | Delete state | Cleanup routines |

#### 2. Core Messaging (2 commands)
| Command | File | Purpose | Status |
|---------|------|---------|--------|
| `send_message` | main.rs | Legacy message send | ⚠️ DEPRECATED |
| `ollama_query` | ollama.rs | Ollama local LLM | ✅ Active |

#### 3. OMEGA Conversation Engine (5 commands)
| Command | File | Purpose | Status |
|---------|------|---------|--------|
| `create_new_conversation` | conversation_engine/commands.rs | Create conversation | ✅ v2 |
| `conversation_generate` | conversation_engine/commands.rs | **PRIMARY: Generate response with conversationId** | ✅ v2 REQUIRED |
| `conversation_process_message` | conversation_engine/commands.rs | Process message | ✅ v2 |
| `conversation_health_check` | conversation_engine/commands.rs | Pipeline health | ✅ v2 |
| `conversation_memory_stats` | conversation_engine/commands.rs | Memory statistics | ✅ v2 |

**Migration Note:** `chat_send_message` (OMEGA v1) → `conversation_generate` (OMEGA v2) with mandatory `conversationId`

#### 4. Chat Orchestrator (9 commands)
All in `overdrive/chat_orchestrator.rs`:
- `chat_send_message` (⚠️ Legacy, use conversation_generate)
- `chat_stream_message` (Streaming responses)
- `chat_get_providers_status` (Provider health)
- `chat_check_providers` (Check availability)
- `chat_get_conversation` (Get conversation)
- `chat_create_conversation` (Create new)
- `chat_delete_conversation` (Delete)
- `chat_generate_suggestions` (AI suggestions)
- `chat_get_memory_stats` (R04 memory integration)

#### 5. Voice Engine (17 commands)
All in `overdrive/voice_engine.rs`:
- `voice_start_listening` — Start voice capture
- `voice_stop_listening` — Stop capture
- `voice_cancel_recording` — Cancel active recording
- `voice_is_recording` — Check recording status
- `voice_transcribe_audio` — Transcribe audio to text
- `voice_get_status` — Voice engine status
- `voice_get_config` — Get configuration
- `voice_update_config` — Update settings
- `voice_play_audio` — Play audio buffer
- `voice_stop_speaking` — Stop playback
- `voice_test_pipeline` — Test voice pipeline
- `voice_calibrate_microphone` — Calibrate mic sensitivity
- `voice_detect_wake_word` — Wake word detection
- `voice_get_available_models` — List STT models
- `voice_enable_duplex` — Enable full-duplex mode
- `voice_disable_duplex` — Disable full-duplex
- `voice_check_interruption` — Check if user interrupted

#### 6. Avatar Engine (53 commands)

**Avatar Core (9 commands)** - `avatar/avatar_commands.rs`:
- `avatar_prepare_speech`, `avatar_finish_speech`
- `avatar_enable_immersion`, `avatar_on_wake_word`
- `avatar_get_current_morph`, `avatar_advance_lip_sync`
- `avatar_get_expression`, `avatar_get_state`, `avatar_prepare_animation`
- `avatar_run_selftest` (avatar_selftest.rs)

**Appearance (10 commands)** - `avatar/appearance_commands.rs`:
- `avatar_get_appearance`, `avatar_set_appearance`, `avatar_update_appearance`
- `avatar_apply_style_preset`, `avatar_parse_style_command`
- `avatar_save_custom_style`, `avatar_load_custom_style`
- `avatar_merge_styles`, `avatar_list_styles`, `avatar_add_archetype`

**Floating Window (18 commands)** - `avatar/avatar_floating_commands.rs`:
- `avatar_get_display_state`, `avatar_set_display_state`, `avatar_update_display_state`, `avatar_reset_display_state`
- `avatar_mode_floating`, `avatar_mode_embed`, `avatar_mode_hidden`
- `avatar_set_position`, `avatar_set_size`, `avatar_set_scale`, `avatar_set_opacity`
- `avatar_set_always_on_top`, `avatar_set_locked`, `avatar_set_mirror_mode`
- `avatar_set_click_through`, `avatar_set_anchor`, `avatar_set_anchor_by_name`
- `avatar_list_screens`, `avatar_move_to_screen`

**FullBody (12 commands)** - `avatar/fullbody_commands.rs`:
- `fullbody_initialize`, `fullbody_advance_frame`
- `fullbody_activate_gesture`, `fullbody_update_expression`, `fullbody_update_lipsync`
- `fullbody_update_state`, `fullbody_on_wake_word`, `fullbody_export_skeleton`
- `fullbody_update_context`, `fullbody_get_posture`, `fullbody_get_stats`
- `fullbody_run_selftest` (fullbody_selftest.rs)

#### 7. Singularity Fusion (70 commands)

**AutoFix (16 commands)** - `singularity_fusion/auto_fix.rs`:
- Detection: `autofix_detect_rust_warnings`, `autofix_detect_typescript_errors`, `autofix_detect_react_hook_violations`, `autofix_detect_invalid_states`
- Fixing: `autofix_fix_issue`, `autofix_fix_all`
- Management: `autofix_get_history`, `autofix_get_stats`, `autofix_reset`
- Specific fixes: `autofix_rust_warning`, `autofix_typescript_error`, `autofix_reset_state`, `autofix_restart_pipeline`, `autofix_restart_tauri_command`, `autofix_resync_lipsync`, `autofix_add_mutex`

**AutoHeal (27 commands)** - `singularity_fusion/auto_heal.rs`:
- Detection: `autoheal_detect_broken`, `autoheal_detect_broken_modules`
- Module resets: `autoheal_reset_cognitive`, `autoheal_init_cognitive`, `autoheal_reset_adaptive`, `autoheal_clear_narrative`, `autoheal_init_narrative`
- Avatar healing: `autoheal_stop_avatar`, `autoheal_reload_avatar`, `autoheal_start_avatar`
- TTS healing: `autoheal_clear_tts_queue`, `autoheal_init_tts`, `autoheal_resync_lipsync`
- Memory healing: `autoheal_rebuild_memory_index`, `autoheal_validate_memory`
- Pipeline healing: `autoheal_stop_pipeline`, `autoheal_clear_pipeline`, `autoheal_start_pipeline`
- Targeted healing: `autoheal_heal_cognitive_module`, `autoheal_heal_avatar_module`, `autoheal_heal_tts_module`, `autoheal_heal_lipsync_module`, `autoheal_heal_memory_module`, `autoheal_heal_pipeline`
- Management: `autoheal_resync_state`, `autoheal_get_history`, `autoheal_reset`

**CrashGuard (9 commands)** - `singularity_fusion/crash_guard.rs`:
- `crashguard_detect_threats`, `crashguard_clear_memory`, `crashguard_kill_thread`
- `crashguard_restart_module`, `crashguard_emergency_shutdown`, `crashguard_reset_pipeline`
- `crashguard_emergency_rollback`, `crashguard_get_active_threats`, `crashguard_get_stats`

**Performance (6 commands)** - `singularity_fusion/performance.rs`:
- `performance_get_metrics`, `performance_throttle_cpu`, `performance_optimize_gpu`
- `performance_reduce_render_quality`, `performance_compress_memory`, `performance_reset_optimizations`

**Unified Pipeline (9 commands)** - `singularity_fusion/unified_pipeline.rs`:
- `pipeline_analyze_intention`, `pipeline_generate_cognitive_response`
- `pipeline_prepare_tts`, `pipeline_prepare_avatar_animation`
- `pipeline_get_stats`, `pipeline_pause`, `pipeline_resume`, `pipeline_reset`, `pipeline_validate`

**Singularity State (17 commands)** - `singularity_state/commands.rs`:
- Getters: `singularity_get_full_state`, `singularity_get_physical`, `singularity_get_cognitive`, `singularity_get_symbolic`, `singularity_get_adaptive`, `singularity_get_meta`, `singularity_get_global_coherence`, `singularity_is_critical`
- Updaters: `singularity_update_physical`, `singularity_update_cognitive`, `singularity_update_symbolic`, `singularity_update_adaptive`, `singularity_update_meta`, `singularity_update_full_state`
- Sync/Persistence: `sync_singularity`, `singularity_save_state`, `singularity_load_state`

#### 8. Audio System (13 commands)
All in `audio/commands.rs`:
- TTS: `tts_speak`, `tts_stop`, `test_tts`
- Microphone: `test_microphone`
- Devices: `get_audio_output_devices`, `get_audio_input_devices`, `set_audio_output_device`, `set_audio_input_device`
- VAD: `vad_get_state`, `vad_process_frame`, `vad_configure`, `vad_reset`, `vad_test`

#### 9. Memory & Timeline (15 commands)

**Memory API** - `api/memory_api.rs`:
- `get_memory_state`, `write_snapshot`, `read_snapshot`
- `write_log`, `read_logs`
- `add_timeline_event`, `memory_get_active_projects`, `memory_get_recent_decisions`

**Memory OS** - `memory_os/commands.rs` + `memory_os/api.rs`:
- `memory_scan`, `memory_store`, `memory_clear`
- `clear_all_memory`, `memory_get_stats`

**Unified Memory** - `engines/unified_memory/api.rs`:
- (6 commands for STM/MTM/LTM management - see Phase 2 Fusion)

#### 10. Secure API Keys (13 commands)

**Key Management** - `secure_commands.rs`:
- Gemini: `chat_set_gemini_key`, `get_gemini_key_status`
- OpenAI: `chat_set_openai_key`, `get_openai_key_status`
- Anthropic: `chat_set_anthropic_key`, `get_anthropic_key_status`
- System: `check_system_integrity`

**Provider Generation** - `commands/chat_generate_commands.rs`:
- `chat_generate_gemini`, `chat_generate_openai`, `chat_generate_claude`

**Copilot** - `commands/copilot_commands.rs`:
- `chat_generate_copilot`, `chat_set_copilot_key`, `get_copilot_key_status`, `test_copilot_connection`

#### 11. Auth OS (9 commands)
All in `auth/commands.rs`:
- `auth_get_status`, `auth_generate_dev_token`, `auth_validate_dev_token`, `auth_revoke_dev_token`
- `auth_save_api_keys`, `auth_get_api_keys`, `auth_delete_api_key`
- `auth_grant_role`, `auth_revoke_role`

#### 12. System Center & Diagnostics (11 commands)
- `system_center/diagnostics.rs`: `sc_run_quick_diagnostics`, `sc_run_full_diagnostics`, `sc_get_diagnostic_status`
- `commands_v21/system_center_commands.rs`: `sc_clear_logs`, `sc_add_log`, `sc_initialize_cluster`, `sc_shutdown_cluster`, `sc_hypervision_stop`

#### 13. Governance (11 commands)
All in `commands_v21/governance_commands.rs`:
- Policies: `get_ia_policies`, `save_ia_policies`, `toggle_ia_policy`, `create_ia_policy`, `delete_ia_policy`
- Permissions: `get_permission_matrix`, `clear_permission_audit`
- Security logs: `get_security_log`, `append_security_log`, `export_security_log`, `clear_security_log`

#### 14. Configuration Hub (9 commands)
In `config/` module:
- Load/save/reset configurations
- Preset management (apply, list, save, delete, export, import, validate)

#### 15. Phase 2 Fusion Commands (20 commands)

**Coherence Engine (5)** - `commands/coherence_commands.rs`:
- Context coherence scoring and analysis

**Unified Memory (6)** - `commands/unified_memory_commands.rs`:
- STM/MTM/LTM layer management

**System Health (9)** - `commands/system_health_commands.rs`:
- Health metrics, alerts, diagnostics

#### 16. Specialized Systems (50+ more commands)
- EXP Fusion (8 commands) - XP/talent/timeline system
- Orchestration Center (2 commands) - Stats/dev
- QA Monitoring (6 commands) - Test suites, alerts
- ONE CORE (8 commands) - Core system management
- DevTools (3 commands) - Documentation navigation
- Whisper (3 commands) - Streaming transcription
- Persistent Memory (4 commands) - Persistence layer
- UI Theme (2 commands) - Theme management
- Self-Healing (4 commands) - Auto-repair
- Window Controls (8 commands) - Window management
- Onboarding (3 commands) - User onboarding
- Titan Persistence (26 commands) - 100% SAVE system
- Hyper Evolution (5 commands) - Structural rewriting
- Narrative Engine (commands) - Story management
- Numeric Twin (commands) - Digital twin
- Design Center (commands) - Theme design
- Reality Renderer (commands) - Reality simulation
- And many more...

### Command Status Matrix

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Active | ~300 | Fully implemented, tested, used |
| ⚠️ Deprecated | ~20 | Old API, migration path exists |
| 🔧 Partial | ~15 | Implemented but not fully integrated |
| 🚧 WIP | ~10 | Work in progress |
| ❌ Orphan | ~5 | Exposed but never called by frontend |

### Orphaned Commands (Preliminary)
To be verified in Phase 1 audit:
- Some legacy `memory_compactor` commands
- Some `cycle_engine` commands (disabled)
- Some `multimodal` commands (disabled)

---

## Events & Listeners

### Tauri Events Emitted by Backend

| Event Name | Emitter | Purpose | Payload |
|------------|---------|---------|---------|
| `conversation:message` | conversation_engine | New message generated | `{conversationId, role, content}` |
| `conversation:error` | conversation_engine | Generation error | `{error, conversationId}` |
| `chat:stream_chunk` | overdrive/chat_orchestrator | Streaming response chunk | `{conversationId, chunk, done}` |
| `voice:status_changed` | overdrive/voice_engine | Voice engine status | `{recording, speaking, error}` |
| `avatar:animation_complete` | avatar | Animation finished | `{animationId}` |
| `avatar:emotion_changed` | avatar | Emotion state changed | `{emotion, intensity}` |
| `singularity:state_updated` | singularity_state | State synchronization | `{layer, data}` |
| `autoheal:module_healed` | singularity_fusion/auto_heal | Module repaired | `{module, action}` |
| `crashguard:threat_detected` | singularity_fusion/crash_guard | Threat alert | `{severity, message}` |
| `system:health_alert` | system_health | Health warning | `{level, component, metric}` |
| `memory:snapshot_saved` | memory_api | Snapshot created | `{snapshotId, timestamp}` |

### Frontend Listeners

Located in:
- `src/services/tauriBridge.ts` — Central event listener hub
- `src/hooks/useConversation.ts` — Conversation events
- `src/hooks/useVoice.ts` — Voice events
- `src/hooks/useAvatar.ts` — Avatar events
- `src/components/ChatInterface.tsx` — Chat streaming
- `src/services/singularityService.ts` — Singularity events

---

## External API Integrations

### AI Providers

#### 1. OpenAI API
- **Client:** `ai/providers/openai.rs`
- **Models:** GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Timeout Strategy:**
  - Quick (< 500 chars): 10s
  - Standard (500-2000 chars): 30s
  - Extended (> 2000 chars): 60s
- **Retry:** 3 attempts, exponential backoff (1s, 2s, 4s)
- **Rate Limit:** Adaptive (per-user tracking)
- **Error Handling:**
  - 401 Unauthorized → Prompt for API key
  - 429 Rate Limited → Exponential backoff
  - 500 Server Error → Fallback to next provider

#### 2. Anthropic Claude API
- **Client:** `ai/providers/claude.rs`
- **Models:** Claude 3 Opus, Claude 3 Sonnet, Claude 3.5 Sonnet
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Timeout:** Same as OpenAI
- **Retry:** 3 attempts
- **Rate Limit:** Adaptive
- **Error Handling:** Same as OpenAI + Claude-specific error codes

#### 3. Google Gemini API
- **Client:** `ai/gemini.rs`
- **Models:** Gemini Pro, Gemini Pro Vision
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/`
- **Timeout:** Same as OpenAI
- **Retry:** 3 attempts
- **Rate Limit:** Adaptive
- **Error Handling:** Google-specific error codes

#### 4. GitHub Copilot API
- **Client:** `commands/copilot_commands.rs`
- **Models:** GPT-4 (via GitHub)
- **Endpoint:** GitHub Copilot API
- **Timeout:** 45s
- **Retry:** 2 attempts
- **Rate Limit:** GitHub-enforced
- **Error Handling:** GitHub API error codes

#### 5. Ollama (Local LLM)
- **Client:** `ai/ollama.rs`
- **Models:** llama3.1:latest, mistral, etc.
- **Endpoint:** `http://localhost:11434/api/generate`
- **Timeout:** 45s (local, but model-dependent)
- **Retry:** 1 attempt (local network)
- **Rate Limit:** None (local)
- **Error Handling:** Connection refused → Auto-disable

### AI Router Intelligence
- **File:** `ai/router_intelligent.rs`
- **Strategy:** Cost/performance/capability-based routing
- **Fallback Chain:** Primary provider → Secondary → Tertiary → Ollama (local)
- **Cache:** LRU cache (1000 entries, 1h TTL) in `ai/cache.rs`
- **Metrics:** Response time, error rate, cost per provider

### HTTP Client Configuration
- **Library:** reqwest 0.11 (async, JSON, streaming)
- **Connection Pool:** Shared across providers
- **TLS:** Native TLS
- **Compression:** gzip, deflate
- **User-Agent:** `TITANE_INFINITY/26.2.0`

---

## Security Surface

### 1. Tauri Permissions & Allowlist

**Capabilities** (src-tauri/capabilities/):
- Protocol: `asset` (local file access via `asset://` protocol)
- Plugins: `dialog` (file dialogs), `clipboard-manager` (clipboard access), `fs` (filesystem), `http` (HTTP requests), `shell` (shell commands)

**Command Allowlist:**
All 350 commands are explicitly registered in `tauri::generate_handler![]` (main.rs:678-1116)

### 2. Content Security Policy (CSP)
Defined in `tauri.conf.json`:
```json
{
  "security": {
    "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com http://localhost:11434"
  }
}
```

### 3. Input Validation & Sanitization
- **Module:** `security/validation.rs`
- **Functions:**
  - `validate_api_key(key: &str) -> Result<()>` — Key format validation
  - `sanitize_user_input(input: &str) -> String` — XSS prevention
  - `validate_file_path(path: &Path) -> Result<()>` — Path traversal prevention
  - `validate_command_args(args: &[String]) -> Result<()>` — Command injection prevention

### 4. API Key Management
- **Storage:** `security/secrets_engine.rs`
- **Encryption:** AES-256-GCM
- **Passphrase:** `TITANE_SECRETS_PASSPHRASE` env variable (default: "default-dev-passphrase-change-in-production")
- **Keys Stored:**
  - `GEMINI_API_KEY`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GITHUB_COPILOT_TOKEN`
- **Retrieval:** Always decrypted in-memory, never persisted plaintext
- **UI Masking:** Frontend displays keys as `sk-***...last4chars`

### 5. Permission Guard (RBAC)
- **Module:** `security/permission_guard.rs`
- **Roles:** Admin, User, Guest
- **Enforcement:**
  - Command-level permissions (e.g., only Admin can `clear_all_memory`)
  - Resource-level permissions (file access, shell commands)
- **Audit:** All permission checks logged in `security/audit.rs`

### 6. Rate Limiting
- **Module:** `security/rate_limit.rs`
- **Strategy:** Token bucket per user/IP
- **Limits:**
  - AI API calls: 60/min per user
  - File operations: 100/min per user
  - Memory operations: 30/min per user
- **Response:** 429 Too Many Requests with retry-after header

### 7. Shell Command Guard
- **Module:** `security/shell_guard.rs`
- **Whitelist:** Only approved shell commands (`ls`, `cat`, `grep`, etc.)
- **Argument Validation:** Regex-based validation
- **Execution:** Sandboxed with timeout (10s default)

### 8. Filesystem Sandbox
- **Module:** `security/sandbox.rs`
- **Allowed Paths:**
  - App data directory (via Tauri `app.path()`)
  - User home directory (read-only unless explicit permission)
  - Temp directory (read-write)
- **Forbidden Paths:**
  - System directories (`/etc`, `/sys`, `C:\Windows`)
  - Parent directory traversal (`../`)

### 9. Audit Logging
- **Module:** `security/audit.rs`
- **Events Logged:**
  - API key access (read/write/delete)
  - Permission grant/revoke
  - Shell command execution
  - File access (read/write/delete)
  - Authentication (token generation/validation)
- **Log Format:** JSON, structured
- **Storage:** `app_data_dir/logs/security_audit.jsonl`
- **Retention:** 30 days

### 10. Security Threats Monitored
- **CrashGuard** (singularity_fusion/crash_guard.rs):
  - Memory leaks (> 2GB memory growth)
  - Infinite loops (> 10s execution)
  - Deadlocks (thread starvation detection)
  - Panic cascades (repeated panics in < 1s)

---

## Storage & Persistence

### 1. SQLite Databases
- **Library:** rusqlite 0.37 (bundled)
- **Databases:**
  - `memory.db` — UnifiedMemory (STM/MTM/LTM)
  - `timeline.db` — Timeline events
  - `knowledge.db` — Knowledge graph
  - `personas.db` — User personas
  - `conversations.db` — Chat history

### 2. Key-Value Stores
- **Encrypted KV** (`security/secrets_engine.rs`):
  - `secrets.enc` — API keys (AES-256-GCM)
- **Plain KV** (`persistence/`):
  - `config.json` — User configuration
  - `state.json` — App state snapshots

### 3. File Storage
- **Snapshots:** `app_data_dir/snapshots/` (JSON)
- **Logs:** `app_data_dir/logs/` (JSONL)
- **Recordings:** `app_data_dir/recordings/` (WAV)
- **Avatars:** `app_data_dir/avatars/` (GLTF, textures)

### 4. Cache
- **LRU Cache** (`ai/cache.rs`):
  - In-memory, 1000 entries max
  - TTL: 1 hour
  - Eviction: Least Recently Used
- **Multi-Level Cache** (`cache_multilevel.rs`):
  - L1: In-memory (fast, 100 entries)
  - L2: Disk (persistent, 10k entries)

---

## Changelog

### v26.2.0 (2026-01-02)
- Added GitHub Copilot integration (4 commands)
- Deprecated OMEGA v1 (`chat_send_message` → `conversation_generate`)
- Added 50+ formatting fixes (cargo fmt compliance)
- Enhanced security audit logging
- Improved error handling across all commands

### v25.0.0 (2025-12-01)
- Singularity Fusion architecture (70 commands)
- Phase 2 Fusion: Coherence, UnifiedMemory, SystemHealth (20 commands)
- Avatar FullBody engine (12 commands)

### v24.0.0 (2025-11-01)
- OMEGA Pipeline v2 (conversationId mandatory)
- Audio system overhaul (VAD, device selection)
- 4-Ring architecture model enforced

---

## Next Steps (Phase 1 Audit)

1. **Cross-reference frontend invoke() calls** → Identify orphaned/missing commands
2. **Test all 350 commands** → Find untested commands
3. **Document payload structures** → See IPC_CONTRACT.md
4. **Measure command latency** → Identify slow commands
5. **Security audit** → Verify all inputs validated, no secrets leaked

---

**Document Status:** ✅ Complete (Phase 0)  
**Last Updated:** 2026-01-03  
**Next Review:** Phase 1 Audit (Cross-reference with frontend)
