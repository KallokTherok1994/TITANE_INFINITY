# TITANE_BRAIN_CANON.md — Cerveau Canonique de TITANE_INFINITY

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Classification:** CANON

---

## Vue d'Ensemble

TITANE_INFINITY est un OS cognitif composé de **9 domaines cerveau** interopérables,
tous pilotés par IPC Tauri (401 commandes à SHA c59e9b5b3 / 408 actuelles), sans accès réseau direct depuis le frontend.

---

## Domaines du Cerveau

### 1. Conversation Engine OMEGA — v19.5.2

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/conversation_engine/` (via titane_infinity lib) |
| Commandes | 5 (`create_new_conversation`, `conversation_generate`, `conversation_process_message`, `conversation_health_check`, `conversation_memory_stats`) |
| Initialisation | `ConversationEngineState::new(storage_dir, password, ai_router, singularity_state)` |
| Dépendances | AIRouter (Ollama default), SingularityState |
| Rôle | Gestion des conversations, pipeline OMEGA |
| Real_Status | PROVEN (CODE) |

### 2. Chat Orchestrator — v21 + R04 Memory Integration

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/overdrive/chat_orchestrator.rs` |
| Commandes | 8 |
| Initialisation | `overdrive::chat_orchestrator::init()` |
| Providers gérés | Ollama (local), Gemini, OpenAI, Claude, Copilot |
| Rôle | Orchestration multi-providers, routing, streaming |
| Real_Status | PROVEN (CODE) |

### 3. Voice Engine — v21 REPAIR

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/overdrive/voice_engine.rs` |
| Commandes | 17 |
| Rôle | STT, Wake Word, VAD, duplex, pipeline vocal |
| Note | `voice_synthesize_speech` deprecated — utiliser `speak()` |
| Real_Status | PROVEN (CODE) |

### 4. Avatar Engine — v23 + FullBody

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/avatar/` |
| Sous-modules | `avatar_commands`, `appearance_commands`, `avatar_floating_commands` (desktop), `fullbody_commands`, `avatar_selftest`, `fullbody_selftest` |
| Commandes | ~47 (avatar core 10 + appearance 10 + floating 15+ + fullbody 12) |
| Rôle | Rendu avatar, lip-sync, expressions, FullBody, positionnement fenêtre |
| Real_Status | PROVEN (CODE) |

### 5. Memory OS — Unified Memory + Titan Persistence

| Attribut | Valeur |
|----------|--------|
| Emplacement unified | `src-tauri/src/engines/unified_memory/` |
| Emplacement persistent | `titane_infinity::persistence` |
| Emplacement state | `memory/` (5 fichiers JSON) |
| Commandes | 6 (unified) + 27 (titan) + 12 (persistent_memory) + 9 (memory_api) = 54 |
| Rôle | Stockage, récupération, snapshots, journaling, intégrité |
| Real_Status | PROVEN (CODE) |

### 6. Auth Engine — Auth OS

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/auth/` |
| Commandes | 9 |
| Initialisation | `auth::init_auth()` dans setup() |
| Rôle | Tokens dev, roles, API keys, authentification unifiée |
| Real_Status | PROVEN (CODE) |

### 7. Audio Engine — TTS + VAD + Capture

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/audio/` |
| Commandes | 19 (TTS/VAD/Capture) + 4 (speak/recording) = 23 |
| Rôle | Synthèse vocale, détection activité vocale, capture audio, WAV export |
| Real_Status | PROVEN (CODE) |

### 8. Security Engine — AES-256-GCM

| Attribut | Valeur |
|----------|--------|
| Emplacement | `src-tauri/src/secure_commands.rs` + `src-tauri/src/security/` |
| Commandes | 13 |
| Engine | `SecureSecretsEngine` (AES-256-GCM) initialisé au démarrage |
| Rôle | Gestion sécurisée clés API, audit permissions, intégrité système |
| Real_Status | PROVEN (CODE) |

### 9. AI Providers — Multi-Provider Router

| Provider | Commandes | Type | Real_Status |
|----------|-----------|------|-------------|
| Ollama | `ai_check_ollama_status`, `ollama_query` | LOCAL (auto-start) | PROVEN (CODE) |
| Gemini | `chat_generate_gemini`, key management | CLOUD | PROVEN (CODE) |
| OpenAI | `chat_generate_openai`, key management | CLOUD | PROVEN (CODE) |
| Claude (Anthropic) | `chat_generate_claude`, key management | CLOUD | PROVEN (CODE) |
| GitHub Copilot | `chat_generate_copilot`, key management, test | CLOUD (v26.3) | PROVEN (CODE) |

**Ollama Auto-Start :** Le backend tente automatiquement de démarrer Ollama (bundled → system → warn).
**Modèle défaut :** `gemma2:2b` (configurable via `OLLAMA_DEFAULT_MODEL` env var)

---

## Orchestration Inter-Domaines

```
Requête UI
  ↓ safeInvokeCanonical(cmd)
  ↓ Tauri IPC
  ↓ invoke_handler (main.rs, 401 cmds @ SHA / 408 current)
  ↓
  ├── conversation_generate → ConversationEngine OMEGA
  │     ↓ AIRouter → Ollama/Gemini/OpenAI/Claude
  │     ↓ SingularityState update
  │     ↓ UnifiedMemory store
  │
  ├── voice_* → VoiceEngine v21 REPAIR
  │     ↓ VAD → STT → response
  │
  ├── avatar_* → AvatarEngine v23 + FullBody
  │     ↓ lip-sync → animation
  │
  └── secure_* → SecureSecretsEngine
        ↓ AES-256-GCM
```

---

## Singularity State — 5 Couches

```
SingularityState (titane_infinity::core::state)
  ├── Physical   → avatar, audio
  ├── Cognitive  → conversation, memory
  ├── Symbolic   → identity, language
  ├── Adaptive   → learning, evolution
  └── Meta       → governance, coherence
```

---

## États Tauri Gérés au Démarrage (.manage())

18+ états registered dans main.rs :
AppState, SingularityCortexState, OrchestratorState, SecureSecretsEngine, CopilotState,
ChatOrchestratorState, HeliosCore, MemoryCore, AvatarEngineGlobal,
AutoFixState, AutoHealState, CrashGuardState, PerformanceState, UnifiedPipelineState,
FrontendStateStore, IdentityEngineState, AIChatState, ExpFusionState,
SingularityEngine, Option1DbAppState, ConversationEngineState, PersistentMemoryState

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*
