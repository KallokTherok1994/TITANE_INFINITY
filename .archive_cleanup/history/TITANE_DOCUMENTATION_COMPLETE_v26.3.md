# 🎯 TITANE∞ — DOCUMENTATION COMPLÈTE v26.3

**Version:** 26.3.0  
**Date:** 2025-12-22  
**Auteur:** Kevin Thibault (TITANE∞ Team)  
**Licence:** Propriétaire (voir LICENSE.md)

---

## 📑 TABLE DES MATIÈRES

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Architecture Système](#2-architecture-système)
3. [Stack Technique](#3-stack-technique)
4. [Modèle 4-Ring](#4-modèle-4-ring)
5. [Modules Backend (Rust)](#5-modules-backend-rust)
6. [Commandes Tauri (875+)](#6-commandes-tauri-875)
7. [Engines Frontend](#7-engines-frontend)
8. [Services Frontend](#8-services-frontend)
9. [Hooks & Stores](#9-hooks--stores)
10. [Types & Interfaces](#10-types--interfaces)
11. [Processus & Pipeline](#11-processus--pipeline)
12. [Routes & Navigation](#12-routes--navigation)
13. [Sécurité](#13-sécurité)
14. [Tests & QA](#14-tests--qa)
15. [Scripts & CLI](#15-scripts--cli)

---

## 1. VISION & OBJECTIFS

### 1.1 Mission

**TITANE∞** est un **Assistant IA Cognitif Local-First** révolutionnaire:

- 🔒 **Privacy-First**: Données locales, pas de cloud obligatoire
- 🧠 **Cognitif**: 9 moteurs d'intelligence interconnectés
- 🏠 **Local-First**: Fonctionne 100% hors-ligne (Ollama)
- ⚡ **Tauri-Only**: Pas de serveur HTTP externe

### 1.2 Caractéristiques Principales

| Fonctionnalité          | Description                            |
| ----------------------- | -------------------------------------- |
| **Multi-IA**            | Ollama (local), Gemini, OpenAI, Claude |
| **Mémoire Persistante** | Chiffrée AES-256-GCM                   |
| **Avatar 3D**           | Lip-sync, expressions, gestures        |
| **Voice Mode**          | STT (Whisper), TTS, Wake Word          |
| **Self-Healing**        | Auto-réparation, Auto-diagnostic       |
| **Time Intelligence**   | Agenda, routines, anticipation         |

---

## 2. ARCHITECTURE SYSTÈME

### 2.1 Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                     TITANE∞ v26.3.0                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React 19)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Pages   │ │Components│ │ Engines  │ │ Services │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Hooks   │ │  Stores  │ │  Types   │ │  Utils   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │ IPC                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   BACKEND (Tauri v2 + Rust)            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │Commands  │ │ Engines  │ │ Memory   │ │ Security │   │  │
│  │  │ (875+)   │ │  (50+)   │ │  System  │ │  Layer   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de Données

```
User Input → Frontend → IPC (invoke) → Backend Commands → Engines
                                                            │
Response ← Frontend ← IPC (Result) ← Backend Processing ←───┘
```

---

## 3. STACK TECHNIQUE

### 3.1 Frontend

| Technologie       | Version  | Usage            |
| ----------------- | -------- | ---------------- |
| **React**         | 19.2.3   | UI Framework     |
| **Vite**          | 6.4.1    | Build Tool       |
| **TypeScript**    | 5.9.3    | Type Safety      |
| **Zustand**       | 5.0.9    | State Management |
| **TailwindCSS**   | 3.4.0    | Styling          |
| **Framer Motion** | 12.23.26 | Animations       |
| **React Router**  | 7.11.0   | Navigation       |
| **Three.js**      | 0.181.0  | 3D Avatar        |

### 3.2 Backend

| Technologie     | Version | Usage             |
| --------------- | ------- | ----------------- |
| **Tauri**       | 2.2.0   | Desktop Framework |
| **Rust**        | 1.83    | Backend Language  |
| **Tokio**       | latest  | Async Runtime     |
| **Serde**       | latest  | Serialization     |
| **SQLite**      | latest  | Local Storage     |
| **AES-256-GCM** | -       | Encryption        |

### 3.3 Testing

| Framework      | Usage                  |
| -------------- | ---------------------- |
| **Vitest**     | Unit/Integration Tests |
| **Playwright** | E2E Tests              |
| **cargo test** | Rust Tests             |

---

## 4. MODÈLE 4-RING

### 4.1 Principe Fondamental

**RÈGLE D'OR:** Les anneaux intérieurs ne peuvent JAMAIS importer les anneaux extérieurs.

```
┌─────────────────────────────────────────────────────────┐
│                    RING 4: OS/UI                        │
│  (React Components, Tauri Backend, Système)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │               RING 3: SERVICES                    │  │
│  │  (Orchestration I/O, Tauri Commands, APIs)        │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │            RING 2: ENGINES                  │  │  │
│  │  │  (Logique Métier Pure, Algorithmes)         │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │          RING 1: CORE                 │  │  │  │
│  │  │  │  (Types, Interfaces, Constantes)      │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Ring 1: Core (Fondations Pures)

**Localisation:** `src/types/`, `src/constants/`  
**Responsabilité:** Types, interfaces, constantes universelles  
**Imports autorisés:** ZÉRO (auto-suffisant)

**Fichiers principaux:**

- `src/types/voice.ts` — EmotionalState, ThinkingState, MentalColor
- `src/types/memoryEngine.ts` — MemoryMetadata, ConversationMode
- `src/types/singularityState.ts` — SingularityState, PhysicalLayer
- `src/types/cognitiveKernel.ts` — CognitiveKernelTypes
- `src/types/conversation.ts` — ConversationTypes
- `src/types/flow.ts` — FlowTypes

### 4.3 Ring 2: Engines (Logique Métier Pure)

**Localisation:** `src/engines/*/`  
**Responsabilité:** Algorithmes, transformations, logique métier SANS I/O  
**Imports autorisés:** Ring 1 uniquement

**9 Moteurs Cognitifs:**

| #   | Moteur               | Description              |
| --- | -------------------- | ------------------------ |
| 1   | **Orchestrator**     | Coordination globale     |
| 2   | **StyleEngine**      | Thèmes et apparence      |
| 3   | **CoherenceEngine**  | Cohérence contextuelle   |
| 4   | **ReflectionEngine** | Analyse réflexive        |
| 5   | **EmotionEngine**    | États émotionnels        |
| 6   | **UnifiedMemory**    | Mémoire persistante      |
| 7   | **BehaviorEngine**   | Patterns comportementaux |
| 8   | **AdaptationEngine** | Adaptation contextuelle  |
| 9   | **SystemHealth**     | Monitoring santé système |

### 4.4 Ring 3: Services

**Localisation:** `src/services/*/`  
**Responsabilité:** Abstractions I/O, appels Tauri, localStorage  
**Imports autorisés:** Ring 1 + Ring 2

### 4.5 Ring 4: OS/UI

**Localisation:** `src-tauri/src/`, `src/pages/`, `src/components/`  
**Responsabilité:** UI React, Tauri backend  
**Imports autorisés:** TOUS les rings

---

## 5. MODULES BACKEND (RUST)

### 5.1 Structure `src-tauri/src/`

```
src-tauri/src/
├── lib.rs              # Configuration principale (75+ modules)
├── main.rs             # Point d'entrée Tauri (875+ commands)
├── commands/           # 50 fichiers de commandes
├── engines/            # Moteurs logiques
├── system/             # Système core
├── audio/              # Audio (TTS, VAD, Recording)
├── avatar/             # Avatar 3D
├── ai/                 # IA providers
├── memory/             # Système mémoire
├── security/           # Sécurité
├── overdrive/          # Chat orchestrator
├── singularity/        # Singularity State
└── ...                 # 60+ autres modules
```

### 5.2 Modules Principaux (lib.rs)

| Module                | Description                  | Status   |
| --------------------- | ---------------------------- | -------- |
| `core`                | SingularityEngine v16        | ✅ Actif |
| `cognitive`           | Cognitive Layer v16          | ✅ Actif |
| `engine`              | Auto-Evolution & Diagnostics | ✅ Actif |
| `ai`                  | AI Router multi-provider     | ✅ Actif |
| `ai_chat`             | AI Chat & Training           | ✅ Actif |
| `conversation_engine` | OMEGA Pipeline               | ✅ Actif |
| `unified_memory_v2`   | Unified Memory API           | ✅ Actif |
| `singularity`         | Singularity State v∞         | ✅ Actif |
| `singularity_cortex`  | Cortex OS v∞                 | ✅ Actif |
| `omega`               | Omega Pipeline v20Ω          | ✅ Actif |
| `kernel`              | Cognitive OS Kernel          | ✅ Actif |
| `persistence`         | 100% SAVE System             | ✅ Actif |
| `security`            | Security Layer               | ✅ Actif |
| `watchdog`            | Watchdog Engine              | ✅ Actif |
| `healing`             | Self-Healing System          | ✅ Actif |
| `resilience`          | Circuit Breaker              | ✅ Actif |
| `cloud`               | Cloud Sync (AES-256)         | ✅ Actif |
| `identity`            | System Identity              | ✅ Actif |
| `meta_orchestrator`   | Meta Orchestrator            | ✅ Actif |
| `reality_renderer`    | Reality Renderer             | ✅ Actif |
| `hyper_intelligence`  | Hyper-Intelligence           | ✅ Actif |
| `numeric_twin`        | Numeric Twin                 | ✅ Actif |
| `agenda`              | Agenda Engine                | ✅ Actif |
| `cycle_engine`        | Cycle Engine v2              | ✅ Actif |
| `performance`         | Performance Engine           | ✅ Actif |
| `harmonic_os`         | Harmonic OS                  | ✅ Actif |
| `cognitive_gravity`   | Cognitive Gravity            | ✅ Actif |
| `conversation_os`     | Conversation OS              | ✅ Actif |
| `constitution`        | Constitution v∞              | ✅ Actif |
| `api_hub`             | API Hub (multi-provider)     | ✅ Actif |
| `temporal_engine`     | Temporal Intelligence        | ✅ Actif |
| `agent_system`        | Agent System                 | ✅ Actif |
| `agents`              | Multi-Agents Cognitifs       | ✅ Actif |
| `multi_agents`        | Multi-Agents Permissions     | ✅ Actif |

---

## 6. COMMANDES TAURI (875+)

### 6.1 Catégories de Commandes

| Catégorie               | Fichier(s)                                     | Nombre |
| ----------------------- | ---------------------------------------------- | ------ |
| **Système Core**        | `mod.rs`, `core_system.rs`                     | ~50    |
| **IA & Chat**           | `ai_chat.rs`, `chat_generate_commands.rs`      | ~90    |
| **Conversation Engine** | `conversation_engine/commands.rs`              | ~18    |
| **Memory OS**           | `memory_os.rs`, `memory_os_commands.rs`        | ~70    |
| **Monitoring**          | `system_health.rs`, `qa_monitoring.rs`         | ~60    |
| **Sécurité**            | `security.rs`, `secure_commands.rs`            | ~40    |
| **Audio & Whisper**     | `audio/commands.rs`, `whisper_commands.rs`     | ~50    |
| **Évolution**           | `evolution.rs`, `evolution_v14.rs`             | ~35    |
| **Cognitive**           | `cognitive_commands.rs`, `cognitive_center.rs` | ~50    |
| **DevTools**            | `devtools.rs`, `devtools_commands.rs`          | ~35    |
| **Avatar**              | `avatar/` (6 fichiers)                         | ~70    |
| **Singularity Fusion**  | `singularity_fusion/` (5 fichiers)             | ~80    |
| **Orchestration**       | `orchestration_center.rs`, `one_core.rs`       | ~50    |
| **Persistence**         | `persistence/commands.rs`                      | ~28    |
| **Agenda**              | `agenda/`                                      | ~30    |
| **Configuration**       | `config/`                                      | ~10    |
| **Auth**                | `auth/commands.rs`                             | ~9     |
| **Autres**              | Divers                                         | ~200   |

### 6.2 Commandes Core (main.rs invoke_handler)

#### Frontend OS Bridge

```rust
state_bridge_commands::ping
state_bridge_commands::get_system_state
state_bridge_commands::get_module_health
state_bridge_commands::system_get_status
state_bridge_commands::get_state
state_bridge_commands::set_state
state_bridge_commands::delete_state
```

#### OMEGA Conversation Engine

```rust
conversation_engine::commands::create_new_conversation
conversation_engine::commands::conversation_generate
conversation_engine::commands::conversation_process_message
conversation_engine::commands::conversation_health_check
conversation_engine::commands::conversation_memory_stats
```

#### Chat Orchestrator

```rust
overdrive::chat_orchestrator::chat_send_message
overdrive::chat_orchestrator::chat_stream_message
overdrive::chat_orchestrator::chat_get_providers_status
overdrive::chat_orchestrator::chat_check_providers
overdrive::chat_orchestrator::chat_get_conversation
overdrive::chat_orchestrator::chat_create_conversation
overdrive::chat_orchestrator::chat_delete_conversation
overdrive::chat_orchestrator::chat_generate_suggestions
overdrive::chat_orchestrator::chat_get_memory_stats
```

#### Voice Engine (17 commandes)

```rust
overdrive::voice_engine::voice_start_listening
overdrive::voice_engine::voice_stop_listening
overdrive::voice_engine::voice_cancel_recording
overdrive::voice_engine::voice_is_recording
overdrive::voice_engine::voice_transcribe_audio
overdrive::voice_engine::voice_get_status
overdrive::voice_engine::voice_get_config
overdrive::voice_engine::voice_update_config
overdrive::voice_engine::voice_play_audio
overdrive::voice_engine::voice_stop_speaking
overdrive::voice_engine::voice_test_pipeline
overdrive::voice_engine::voice_calibrate_microphone
overdrive::voice_engine::voice_detect_wake_word
overdrive::voice_engine::voice_get_available_models
overdrive::voice_engine::voice_enable_duplex
overdrive::voice_engine::voice_disable_duplex
overdrive::voice_engine::voice_check_interruption
```

#### Avatar Engine (~50 commandes)

```rust
// Core Avatar
avatar::avatar_commands::avatar_prepare_speech
avatar::avatar_commands::avatar_finish_speech
avatar::avatar_commands::avatar_enable_immersion
avatar::avatar_commands::avatar_on_wake_word
avatar::avatar_commands::avatar_get_current_morph
avatar::avatar_commands::avatar_advance_lip_sync
avatar::avatar_commands::avatar_get_expression
avatar::avatar_commands::avatar_get_state
avatar::avatar_commands::avatar_prepare_animation
avatar::avatar_selftest::avatar_run_selftest

// Appearance
avatar::appearance_commands::avatar_get_appearance
avatar::appearance_commands::avatar_set_appearance
avatar::appearance_commands::avatar_update_appearance
avatar::appearance_commands::avatar_apply_style_preset
avatar::appearance_commands::avatar_parse_style_command
avatar::appearance_commands::avatar_save_custom_style
avatar::appearance_commands::avatar_load_custom_style
avatar::appearance_commands::avatar_merge_styles
avatar::appearance_commands::avatar_list_styles
avatar::appearance_commands::avatar_add_archetype

// Floating Window
avatar::avatar_floating_commands::avatar_get_display_state
avatar::avatar_floating_commands::avatar_set_display_state
avatar::avatar_floating_commands::avatar_update_display_state
avatar::avatar_floating_commands::avatar_reset_display_state
avatar::avatar_floating_commands::avatar_mode_floating
avatar::avatar_floating_commands::avatar_mode_embed
avatar::avatar_floating_commands::avatar_mode_hidden
avatar::avatar_floating_commands::avatar_set_position
avatar::avatar_floating_commands::avatar_set_size
avatar::avatar_floating_commands::avatar_set_scale
avatar::avatar_floating_commands::avatar_set_opacity
avatar::avatar_floating_commands::avatar_set_always_on_top
avatar::avatar_floating_commands::avatar_set_locked
avatar::avatar_floating_commands::avatar_set_mirror_mode
avatar::avatar_floating_commands::avatar_set_click_through
avatar::avatar_floating_commands::avatar_set_anchor
avatar::avatar_floating_commands::avatar_set_anchor_by_name
avatar::avatar_floating_commands::avatar_list_screens
avatar::avatar_floating_commands::avatar_move_to_screen

// FullBody
avatar::fullbody_commands::fullbody_initialize
avatar::fullbody_commands::fullbody_advance_frame
avatar::fullbody_commands::fullbody_activate_gesture
avatar::fullbody_commands::fullbody_update_expression
avatar::fullbody_commands::fullbody_update_lipsync
avatar::fullbody_commands::fullbody_update_state
avatar::fullbody_commands::fullbody_on_wake_word
avatar::fullbody_commands::fullbody_export_skeleton
avatar::fullbody_commands::fullbody_update_context
avatar::fullbody_commands::fullbody_get_posture
avatar::fullbody_commands::fullbody_get_stats
avatar::fullbody_selftest::fullbody_run_selftest
```

#### Singularity Fusion (~70 commandes)

```rust
// AutoFix
singularity_fusion::autofix_detect_rust_warnings
singularity_fusion::autofix_detect_typescript_errors
singularity_fusion::autofix_detect_react_hook_violations
singularity_fusion::autofix_detect_invalid_states
singularity_fusion::autofix_fix_issue
singularity_fusion::autofix_fix_all
singularity_fusion::autofix_get_history
singularity_fusion::autofix_get_stats
singularity_fusion::autofix_reset
singularity_fusion::autofix_rust_warning
singularity_fusion::autofix_typescript_error
singularity_fusion::autofix_reset_state
singularity_fusion::autofix_restart_pipeline
singularity_fusion::autofix_restart_tauri_command
singularity_fusion::autofix_resync_lipsync
singularity_fusion::autofix_add_mutex

// AutoHeal
singularity_fusion::autoheal_detect_broken
singularity_fusion::autoheal_detect_broken_modules
singularity_fusion::autoheal_reset_cognitive
singularity_fusion::autoheal_init_cognitive
singularity_fusion::autoheal_reset_adaptive
singularity_fusion::autoheal_clear_narrative
singularity_fusion::autoheal_init_narrative
singularity_fusion::autoheal_stop_avatar
singularity_fusion::autoheal_reload_avatar
singularity_fusion::autoheal_start_avatar
singularity_fusion::autoheal_clear_tts_queue
singularity_fusion::autoheal_init_tts
singularity_fusion::autoheal_resync_lipsync
singularity_fusion::autoheal_rebuild_memory_index
singularity_fusion::autoheal_validate_memory
singularity_fusion::autoheal_stop_pipeline
singularity_fusion::autoheal_clear_pipeline
singularity_fusion::autoheal_start_pipeline
singularity_fusion::autoheal_heal_cognitive_module
singularity_fusion::autoheal_heal_avatar_module
singularity_fusion::autoheal_heal_tts_module
singularity_fusion::autoheal_heal_lipsync_module
singularity_fusion::autoheal_heal_memory_module
singularity_fusion::autoheal_heal_pipeline
singularity_fusion::autoheal_resync_state
singularity_fusion::autoheal_get_history
singularity_fusion::autoheal_reset

// CrashGuard
singularity_fusion::crashguard_detect_threats
singularity_fusion::crashguard_clear_memory
singularity_fusion::crashguard_kill_thread
singularity_fusion::crashguard_restart_module
singularity_fusion::crashguard_emergency_shutdown
singularity_fusion::crashguard_reset_pipeline
singularity_fusion::crashguard_emergency_rollback
singularity_fusion::crashguard_get_active_threats
singularity_fusion::crashguard_get_stats

// Performance
singularity_fusion::performance_get_metrics
singularity_fusion::performance_throttle_cpu
singularity_fusion::performance_optimize_gpu
singularity_fusion::performance_reduce_render_quality
singularity_fusion::performance_compress_memory
singularity_fusion::performance_reset_optimizations

// Pipeline
singularity_fusion::pipeline_analyze_intention
singularity_fusion::pipeline_generate_cognitive_response
singularity_fusion::pipeline_prepare_tts
singularity_fusion::pipeline_prepare_avatar_animation
singularity_fusion::pipeline_get_stats
singularity_fusion::pipeline_pause
singularity_fusion::pipeline_resume
singularity_fusion::pipeline_reset
singularity_fusion::pipeline_validate
```

#### Singularity State (18 commandes)

```rust
singularity_state::commands::singularity_get_full_state
singularity_state::commands::singularity_get_physical
singularity_state::commands::singularity_get_cognitive
singularity_state::commands::singularity_get_symbolic
singularity_state::commands::singularity_get_adaptive
singularity_state::commands::singularity_get_meta
singularity_state::commands::singularity_get_global_coherence
singularity_state::commands::singularity_is_critical
singularity_state::commands::singularity_update_physical
singularity_state::commands::singularity_update_cognitive
singularity_state::commands::singularity_update_symbolic
singularity_state::commands::singularity_update_adaptive
singularity_state::commands::singularity_update_meta
singularity_state::commands::singularity_update_full_state
singularity_state::commands::sync_singularity
singularity_state::commands::singularity_save_state
singularity_state::commands::singularity_load_state
```

#### System Center Diagnostics

```rust
system_center::diagnostics::sc_run_quick_diagnostics
system_center::diagnostics::sc_run_full_diagnostics
system_center::diagnostics::sc_get_diagnostic_status
```

#### QA Monitoring Center

```rust
qa_monitoring_commands::qa_get_state
qa_monitoring_commands::qa_get_system_metrics
qa_monitoring_commands::qa_list_test_suites
qa_monitoring_commands::qa_list_alerts
qa_monitoring_commands::qa_run_test_suite
qa_monitoring_commands::qa_acknowledge_alert
```

#### ONE CORE

```rust
one_core_commands::one_core_get_state
one_core_commands::one_core_get_metrics
one_core_commands::one_core_list_commands
one_core_commands::one_core_get_event_history
one_core_commands::one_core_execute_command
one_core_commands::one_core_run_diagnostic
one_core_commands::one_core_force_sync
one_core_commands::one_core_cleanup
```

#### Audio System (13 commandes)

```rust
// TTS
audio::commands::tts_speak
audio::commands::tts_stop
audio::commands::test_tts

// Microphone
audio::commands::test_microphone

// Device Detection
audio::commands::get_audio_output_devices
audio::commands::get_audio_input_devices

// Device Selection
audio::commands::set_audio_output_device
audio::commands::set_audio_input_device

// VAD
audio::commands::vad_get_state
audio::commands::vad_process_frame
audio::commands::vad_configure
audio::commands::vad_reset
audio::commands::vad_test
```

#### Secure API Key Management

```rust
secure_commands::chat_set_gemini_key
secure_commands::get_gemini_key_status
secure_commands::chat_set_openai_key
secure_commands::get_openai_key_status
secure_commands::chat_set_anthropic_key
secure_commands::get_anthropic_key_status
secure_commands::check_system_integrity
```

#### Provider-specific AI Generation

```rust
commands::chat_generate_commands::chat_generate_gemini
commands::chat_generate_commands::chat_generate_openai
commands::chat_generate_commands::chat_generate_claude
ai_prompt_generator::generate_mode_prompt
titane_infinity::ai::ollama::ai_check_ollama_status
```

#### Auth OS

```rust
auth::commands::auth_get_status
auth::commands::auth_generate_dev_token
auth::commands::auth_validate_dev_token
auth::commands::auth_revoke_dev_token
auth::commands::auth_save_api_keys
auth::commands::auth_get_api_keys
auth::commands::auth_delete_api_key
auth::commands::auth_grant_role
auth::commands::auth_revoke_role
```

#### Governance

```rust
commands_v21::governance_commands::get_ia_policies
commands_v21::governance_commands::save_ia_policies
commands_v21::governance_commands::toggle_ia_policy
commands_v21::governance_commands::create_ia_policy
commands_v21::governance_commands::delete_ia_policy
commands_v21::governance_commands::get_permission_matrix
commands_v21::governance_commands::clear_permission_audit
commands_v21::governance_commands::get_security_log
commands_v21::governance_commands::append_security_log
commands_v21::governance_commands::export_security_log
commands_v21::governance_commands::clear_security_log
```

#### System Center

```rust
commands_v21::system_center_commands::sc_clear_logs
commands_v21::system_center_commands::sc_add_log
commands_v21::system_center_commands::sc_initialize_cluster
commands_v21::system_center_commands::sc_shutdown_cluster
commands_v21::system_center_commands::sc_hypervision_stop
commands_v21::system_center_commands::sc_hypervision_clear_anomalies
commands_v21::system_center_commands::sc_hypervision_resolve_anomaly
```

#### Memory Commands

```rust
commands_v21::memory_os_commands::memory_clear
commands_v21::memory_os_commands::memory_promote
commands_v21::memory_os_commands::memory_demote
commands_v21::memory_os_commands::memory_delete
commands_v21::memory_os_commands::memory_prune
```

#### Coherence

```rust
coherence_commands::coherence_get_state
coherence_commands::coherence_check_system
coherence_commands::coherence_validate_connections
coherence_commands::coherence_get_score
coherence_commands::coherence_initialize
```

#### Unified Memory

```rust
unified_memory_commands::memory_get_state
unified_memory_commands::memory_store
unified_memory_commands::memory_recall
unified_memory_commands::memory_get_stats
unified_memory_commands::memory_initialize
unified_memory_commands::memory_tick
```

#### System Health

```rust
system_health_commands::health_get_state
system_health_commands::health_get_report
system_health_commands::health_check_system
system_health_commands::health_initialize
system_health_commands::health_set_auto_heal
system_health_commands::health_get_metrics
system_health_commands::get_system_health
system_health_commands::memory_repair
system_health_commands::system_optimize
```

#### Titan Persistence (26 commandes)

```rust
persistence::commands::titan_persistence_init
persistence::commands::titan_persist_event
persistence::commands::titan_force_snapshot
persistence::commands::titan_get_persistence_status
persistence::commands::titan_check_integrity
persistence::commands::titan_compact_journal
persistence::commands::titan_load_state
persistence::commands::titan_get_events_since
persistence::commands::titan_list_snapshots
persistence::commands::titan_recover_state
persistence::commands::titan_verify_integrity
persistence::commands::titan_persistence_shutdown
persistence::commands::titan_migrate_state
persistence::commands::titan_get_schema_version
persistence::commands::titan_export_data
persistence::commands::titan_validate_archive
persistence::commands::titan_import_data
persistence::commands::titan_get_memory_health
persistence::commands::titan_run_self_healing
persistence::commands::titan_reset_module
persistence::commands::titan_dump_raw_state
persistence::commands::titan_run_full_integrity_check
persistence::commands::titan_memory_doctor_diagnose
persistence::commands::titan_memory_doctor_summary
persistence::commands::titan_memory_doctor_heal
persistence::commands::titan_memory_doctor_compact
persistence::commands::titan_memory_doctor_export
```

#### Configuration Hub

```rust
config::get_all_configs
config::update::update_runtime_config
config::update::update_chat_engine_config
config::io::export_config
config::io::import_config
config::presets::list_config_presets
config::presets::save_config_preset
config::presets::load_config_preset
config::presets::delete_config_preset
```

#### EXP Fusion Engine

```rust
commands::exp_fusion::exp_get_global_state
commands::exp_fusion::exp_get_categories
commands::exp_fusion::exp_get_projects
commands::exp_fusion::exp_get_project_stats
commands::exp_fusion::exp_get_talents
commands::exp_fusion::exp_get_timeline
commands::exp_fusion::exp_get_timeline_stats
commands::exp_fusion::exp_add_knowledge
```

#### Onboarding

```rust
onboarding::is_onboarding_complete
onboarding::complete_onboarding
onboarding::get_onboarding_preferences
```

---

## 7. ENGINES FRONTEND

### 7.1 Localisation

`src/engines/`

### 7.2 Liste des Engines

| Dossier           | Engine          | Description            |
| ----------------- | --------------- | ---------------------- |
| `aura`            | Aura Engine     | Aura visuelle          |
| `autopoiesis`     | Autopoiesis     | Auto-création          |
| `cognitive`       | Cognitive       | Traitement cognitif    |
| `conscious`       | Conscious       | État de conscience     |
| `continuum`       | Continuum       | Flux temporel          |
| `embodiment`      | Embodiment      | Incarnation            |
| `emotion`         | Emotion         | Gestion émotions       |
| `expression`      | Expression      | Expressions            |
| `flow`            | Flow            | État de flow           |
| `holopresence`    | HoloPresence    | Présence holographique |
| `identity`        | Identity        | Identité               |
| `interoception`   | Interoception   | Conscience corporelle  |
| `metasingularity` | MetaSingularity | Meta-singularité       |
| `narrative`       | Narrative       | Narration              |
| `output`          | Output          | Sortie                 |
| `phasespace`      | PhaseSpace      | Espace de phase        |
| `predictive`      | Predictive      | Prédiction             |
| `presence`        | Presence        | Présence               |
| `psyche`          | Psyche          | Psyche                 |
| `selfHealing`     | SelfHealing     | Auto-guérison          |
| `spatial`         | Spatial         | Spatial                |
| `time`            | Time            | Temps                  |
| `uiux`            | UIUX            | Interface              |
| `voice`           | Voice           | Voix                   |

### 7.3 Exports (index.ts)

```typescript
// Core Engines
export * from './selfHealing';
export * from './flow';

// Time/Agenda System
export {
  TimeEngine,
  AgendaEngine,
  EnergyEngine,
  PriorityEngine,
  ChatScheduler,
  initTimeAgendaSystem,
} from './time';

// Presence (stubs)
export * from './presence/_stubs';
```

---

## 8. SERVICES FRONTEND

### 8.1 Localisation

`src/services/`

### 8.2 Liste des Services

| Service                | Fichier                    | Description         |
| ---------------------- | -------------------------- | ------------------- |
| **AI Chat Client**     | `aiChatClient.ts`          | Client IA           |
| **Adaptive Bridge**    | `adaptiveBridgeV21.ts`     | Pont adaptatif      |
| **Agenda**             | `agendaService.ts`         | Service agenda      |
| **Auto Audit**         | `autoAuditEngine.ts`       | Audit automatique   |
| **Chat Memory**        | `chatMemory.ts`            | Mémoire chat        |
| **Chat Validator**     | `chatValidator.ts`         | Validation chat     |
| **Conversation**       | `conversationEngine.ts`    | Moteur conversation |
| **Experience**         | `experienceService.ts`     | Service XP          |
| **Persona Bridge**     | `personaTauriBridge.ts`    | Pont persona        |
| **RAG**                | `ragService.ts`            | Retrieval-Augmented |
| **Singularity Bridge** | `singularityBridge.ts`     | Pont singularité    |
| **Tauri Bridge**       | `tauriBridge.ts`           | Pont Tauri          |
| **Tauri Client**       | `tauriClient.ts`           | Client Tauri        |
| **Tauri Commands**     | `tauriCommands.ts`         | Commandes Tauri     |
| **Tauri Auto Repair**  | `tauriAutoRepair.ts`       | Auto-réparation     |
| **User Preferences**   | `userPreferencesEngine.ts` | Préférences         |

### 8.3 Sous-dossiers

| Dossier              | Description               |
| -------------------- | ------------------------- |
| `adminEngine/`       | Administration            |
| `agents/`            | Agents                    |
| `ai/`                | Intelligence Artificielle |
| `api/`               | APIs                      |
| `audio/`             | Audio                     |
| `automation/`        | Automatisation            |
| `backup/`            | Sauvegarde                |
| `cache/`             | Cache                     |
| `chat/`              | Chat                      |
| `cognitive/`         | Cognitif                  |
| `consistency/`       | Cohérence                 |
| `devices/`           | Périphériques             |
| `evolution/`         | Évolution                 |
| `evolutionEngine/`   | Moteur évolution          |
| `governance/`        | Gouvernance               |
| `ia/`                | IA                        |
| `mcp/`               | MCP                       |
| `memory/`            | Mémoire                   |
| `monitoring/`        | Monitoring                |
| `orchestration/`     | Orchestration             |
| `performanceEngine/` | Performance               |
| `providers/`         | Providers                 |
| `selfHealing/`       | Auto-guérison             |
| `sessions/`          | Sessions                  |
| `systemCenter/`      | Centre système            |
| `tauri/`             | Tauri                     |
| `tts/`               | Text-to-Speech            |
| `unified/`           | Unifié                    |
| `voice/`             | Voix                      |
| `xp/`                | Expérience                |

---

## 9. HOOKS & STORES

### 9.1 Hooks (src/hooks/)

**Total: 91 hooks**

#### Core Hooks

- `useChat.ts` - Hook principal chat
- `useChatCore.ts` - Core chat
- `useChatMemory.ts` - Mémoire chat
- `useChatStreaming.ts` - Streaming chat
- `useChatUI.ts` - UI chat
- `useConversationEngine.ts` - Moteur conversation

#### Cognitive Hooks

- `useCognitive.ts` - Cognitif
- `useCognitiveLayout.ts` - Layout cognitif
- `useDeepPsyche.ts` - Psyche profonde

#### Audio/Voice Hooks

- `useAudioChat.tsx` - Chat audio
- `useAudioSettings.ts` - Settings audio
- `useAudioStreaming.ts` - Streaming audio
- `useVoice.ts` - Voix
- `useVoiceEngine.ts` - Moteur voix
- `useVoiceInput.ts` - Input voix
- `useVoiceMode.ts` - Mode voix
- `useTTS.ts` - TTS
- `useWhisperStream.ts` - Whisper streaming
- `useVAD.ts` - Voice Activity Detection
- `useActiveListening.ts` - Écoute active

#### Memory Hooks

- `useMemory.ts` - Mémoire
- `useMemoryCore.ts` - Core mémoire
- `useMemoryEngine.ts` - Moteur mémoire
- `usePersistentMemory.ts` - Mémoire persistante
- `useUnifiedMemory.ts` - Mémoire unifiée

#### Singularity Hooks

- `useSingularity.ts` - Singularité
- `useSingularityState.ts` - État singularité
- `useSingularityStateSafe.ts` - État sécurisé
- `useSingularityStore.ts` - Store singularité
- `useSingularitySync.ts` - Sync singularité

#### Performance Hooks

- `usePerformanceMonitor.ts` - Monitoring
- `usePerformanceProfiler.ts` - Profiler
- `useAdvancedPerformance.ts` - Performance avancée
- `useAdaptiveFPS.ts` - FPS adaptatif

#### Visual Hooks

- `useVisualEngine.ts` - Moteur visuel
- `useVisualEngines.ts` - Moteurs visuels
- `useVisualState.ts` - État visuel
- `useParticles.ts` - Particules
- `useTitaneSphere.ts` - Sphère TITANE

#### System Hooks

- `useSystemHealth.ts` - Santé système
- `useSystemMonitor.ts` - Monitoring système
- `useSystemCenterAutoFix.ts` - Auto-fix
- `useConnection.ts` - Connexion
- `useDeviceHealth.ts` - Santé devices
- `useDevicePermissions.ts` - Permissions

#### Other Hooks

- `useIdentity.ts` - Identité
- `useIdentityMatrix.ts` - Matrix identité
- `useFusionEngine.ts` - Moteur fusion
- `useHybridEngine.ts` - Moteur hybride
- `useTimeAgenda.ts` - Temps/Agenda
- `useRAG.ts` - RAG
- `useSessions.ts` - Sessions
- `useThrottle.ts` - Throttle
- `useDebounce.ts` - Debounce
- `useFocusTrap.ts` - Focus trap
- `useKeyboardShortcuts.ts` - Raccourcis clavier
- `useResponsive.ts` - Responsive

### 9.2 Stores (src/stores/)

| Store                | Fichier                   | Description     |
| -------------------- | ------------------------- | --------------- |
| **Effects**          | `effectsStore.ts`         | Effets visuels  |
| **Evolution**        | `evolutionStore.ts`       | Évolution       |
| **Memory**           | `memoryStore.ts`          | Mémoire         |
| **Panels**           | `panelsStore.ts`          | Panneaux UI     |
| **System**           | `systemStore.ts`          | Système         |
| **UI**               | `uiStore.ts`              | Interface       |
| **Visual State**     | `visualStateStore.ts`     | État visuel     |
| **Visual State v21** | `visualStateStoreV21.ts`  | État visuel v21 |
| **Visual**           | `visualStore.ts`          | Visuel          |
| **AutomationXP**     | `useAutomationXPStore.ts` | Automation XP   |
| **ChatMode**         | `useChatModeStore.ts`     | Mode chat       |
| **MemoryEngine**     | `useMemoryEngineStore.ts` | Moteur mémoire  |
| **Performance**      | `usePerformanceStore.ts`  | Performance     |
| **SelfHealing**      | `useSelfHealingStore.ts`  | Auto-guérison   |
| **TTSEngine**        | `useTTSEngineStore.ts`    | TTS             |
| **Vision**           | `useVisionStore.ts`       | Vision          |

---

## 10. TYPES & INTERFACES

### 10.1 Localisation

`src/types/`

### 10.2 Fichiers de Types

| Fichier                     | Description        |
| --------------------------- | ------------------ |
| `ai.d.ts`                   | Types IA           |
| `aiModel.ts`                | Modèles IA         |
| `audio.d.ts`                | Types Audio        |
| `automationXP.ts`           | Automation XP      |
| `backend.d.ts`              | Types Backend      |
| `chatModes.ts`              | Modes Chat         |
| `cognitiveKernel.ts`        | Kernel Cognitif    |
| `conversation.ts`           | Conversation       |
| `conversationEvaluation.ts` | Évaluation         |
| `devops.ts`                 | DevOps             |
| `experience.ts`             | Expérience         |
| `flow.ts`                   | Flow               |
| `humanRhythm.ts`            | Rythme Humain      |
| `logger.ts`                 | Logger             |
| `memoryEngine.ts`           | Moteur Mémoire     |
| `multimodalFusion.ts`       | Fusion Multimodale |
| `numericTwin.ts`            | Twin Numérique     |
| `performanceEngine.ts`      | Performance        |
| `predictiveState.ts`        | État Prédictif     |
| `presence.d.ts`             | Présence           |
| `selfHealing.ts`            | Auto-guérison      |
| `singularityState.ts`       | État Singularité   |
| `stressRegulation.ts`       | Régulation Stress  |
| `system.d.ts`               | Système            |
| `tauri.ts`                  | Tauri              |
| `trainingBaseline.ts`       | Baseline Training  |
| `ttsEngine.ts`              | TTS                |
| `visionAffect.ts`           | Vision/Affect      |
| `voice.ts`                  | Voix               |

---

## 11. PROCESSUS & PIPELINE

### 11.1 OMEGA Pipeline v2

**Description:** Pipeline conversationnel unifié

```
User Input
    │
    ▼
┌─────────────────────────────────────────┐
│         conversation_generate           │
│  (conversation_engine/commands.rs)      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           Intent Analysis               │
│  - Classification intention             │
│  - Extraction entities                  │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           Memory Recall                 │
│  - Context retrieval                    │
│  - Historical data                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           AI Generation                 │
│  - Ollama/Gemini/OpenAI/Claude          │
│  - Response synthesis                   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           Response Processing           │
│  - Memory storage                       │
│  - TTS preparation                      │
│  - Avatar animation                     │
└─────────────────────────────────────────┘
    │
    ▼
Response to User
```

### 11.2 Self-Healing Process

```
System State Monitor
    │
    ▼
┌─────────────────────────────────────────┐
│         Health Check Scheduler          │
│  (healing/health_scheduler.rs)          │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│         Anomaly Detection               │
│  - Engine health                        │
│  - Memory validation                    │
│  - Pipeline status                      │
└─────────────────────────────────────────┘
    │ (if anomaly detected)
    ▼
┌─────────────────────────────────────────┐
│         Auto-Repair                     │
│  - Engine recalibration                 │
│  - Memory rebuild                       │
│  - Pipeline restart                     │
└─────────────────────────────────────────┘
    │
    ▼
System Restored
```

### 11.3 Singularity State Model

**5 Couches:**

```
┌─────────────────────────────────────────┐
│            META LAYER                   │
│  (Meta-cognition, Self-awareness)       │
├─────────────────────────────────────────┤
│           ADAPTIVE LAYER                │
│  (Learning, Adaptation)                 │
├─────────────────────────────────────────┤
│           SYMBOLIC LAYER                │
│  (Language, Knowledge, Reasoning)       │
├─────────────────────────────────────────┤
│          COGNITIVE LAYER                │
│  (Perception, Attention, Memory)        │
├─────────────────────────────────────────┤
│          PHYSICAL LAYER                 │
│  (CPU, Memory, I/O, Sensors)            │
└─────────────────────────────────────────┘
```

---

## 12. ROUTES & NAVIGATION

### 12.1 Routes Actives (v25.4.0)

| Route     | Description                   | Version |
| --------- | ----------------------------- | ------- |
| `/chat`   | Chat IA (Multi-Provider)      | -       |
| `/titane` | TITANE — Le Cœur du Système   | v25.3.0 |
| `/time`   | TIME — Centre Temporel        | v25.1   |
| `/stats`  | STATS — Statistiques Moteurs  | v25.2   |
| `/admin`  | ADMIN — Centre Administration | v25.2.2 |
| `/dev`    | DEV — Centre Développement    | v25.4.0 |

### 12.2 Fusions Majeures

#### Fusion EVO (v25.0)

5 modules → 1 module `/evo` (redirigé vers `/titane` v25.3.0)

#### Fusion TIME (v25.1)

3 modules → 1 module `/time`

#### Fusion Stats (v25.2)

4 modules → 1 page `/stats`

#### Fusion ADMIN (v25.2.2)

7 modules → 1 module `/admin`

#### Fusion DEV (v25.4.0)

4 modules → 1 module `/dev`

---

## 13. SÉCURITÉ

### 13.1 Couches de Sécurité

| Couche               | Description         |
| -------------------- | ------------------- |
| **AES-256-GCM**      | Chiffrement mémoire |
| **Secrets Engine**   | Stockage clés API   |
| **Permission Guard** | Contrôle accès      |
| **Rate Limiting**    | Anti-abus           |
| **Sandbox**          | Isolation           |
| **Shell Guard**      | Protection shell    |
| **Audit Logger**     | Journalisation      |

### 13.2 Modules Sécurité (src-tauri/src/security/)

- `secrets_engine.rs` - Gestion secrets
- `permission_guard.rs` - Guard permissions
- `permissions.rs` - Définitions permissions
- `sandbox.rs` - Sandbox execution
- `validation.rs` - Validation entrées
- `rate_limit.rs` - Rate limiting
- `shell_guard.rs` - Protection shell
- `commands.rs` - Commandes sécurité

### 13.3 Politique de Sécurité

```rust
pub struct SecurityPolicy {
    pub max_request_rate: u32,     // Requests/minute
    pub max_message_length: usize, // Characters
    pub allowed_shell_commands: Vec<String>,
    pub encryption_required: bool,
    pub audit_enabled: bool,
}
```

---

## 14. TESTS & QA

### 14.1 Frameworks

| Framework      | Usage                     |
| -------------- | ------------------------- |
| **Vitest**     | Unit/Integration Frontend |
| **Playwright** | E2E Tests                 |
| **cargo test** | Tests Rust                |

### 14.2 Scripts de Test

```bash
npm run test                  # Vitest run
npm run test:watch            # Vitest watch
npm run test:coverage         # Coverage
npm run test:e2e              # Playwright
npm run test:rust             # cargo test
npm run test:architecture     # Architecture tests
npm run test:compliance       # Compliance tests
npm run test:omega            # OMEGA tests
npm run test:all              # Full test suite
```

### 14.3 QA Monitoring

Commandes QA:

- `qa_get_state` - État QA
- `qa_get_system_metrics` - Métriques
- `qa_list_test_suites` - Suites tests
- `qa_list_alerts` - Alertes
- `qa_run_test_suite` - Exécuter suite
- `qa_acknowledge_alert` - Acquitter alerte

---

## 15. SCRIPTS & CLI

### 15.1 Scripts NPM

```bash
# Développement
npm run dev              # tauri dev
npm run build           # vite build
npm run build:production # Full production build

# Linting
npm run lint            # ESLint
npm run lint:fix        # Auto-fix
npm run format          # Prettier

# Vérification
npm run check           # TypeScript
npm run verify          # Full verification

# TITANE CLI
npm run titane          # ./titane.sh
npm run titane:clean    # Clean
npm run titane:repair   # Repair
npm run titane:fix      # Fix
npm run titane:build    # Build
npm run titane:deploy   # Deploy
npm run titane:full     # Full
npm run titane:health   # Health check

# Auto-maintenance
npm run auto-heal       # Self-healing
npm run auto-fix        # Auto-fix
```

### 15.2 titane.sh

Script principal de maintenance:

- `clean` - Nettoyage
- `repair` - Réparation
- `fix` - Corrections
- `build` - Build
- `deploy` - Déploiement
- `full` - Cycle complet
- `health` - Diagnostic

---

## 📊 STATISTIQUES FINALES

| Métrique              | Valeur                      |
| --------------------- | --------------------------- |
| **Commandes Tauri**   | 875+                        |
| **Modules Rust**      | 75+                         |
| **Engines Frontend**  | 24                          |
| **Services Frontend** | 50+                         |
| **Hooks React**       | 91                          |
| **Stores Zustand**    | 17                          |
| **Types/Interfaces**  | 35 fichiers                 |
| **Routes Actives**    | 6                           |
| **Tests**             | Vitest + Playwright + cargo |

---

## 🔗 RÉFÉRENCES

- [ARCHITECTURE.md](/ARCHITECTURE.md)
- [COMMANDES_TAURI_COMPLETE_v26.3.0.md](/docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md)
- [CONTRIBUTING.md](/CONTRIBUTING.md)
- [LICENSE.md](/LICENSE.md)

---

**© 2025 TITANE∞ Team — Kevin Thibault**  
**Généré le:** 2025-12-22
