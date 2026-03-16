# TOPOLOGY MAP

## Vue d'ensemble

```
TITANE_INFINITY/
├── src/                          [Frontend React/TS — Ring 4 UI]
│   ├── main.tsx                  ← ENTRY React + boot markers + tauri-init-fix
│   ├── App.tsx                   ← Router racine
│   ├── boot-diagnostics.ts       ← Diagnostic démarrage
│   ├── tauri-init-fix.ts         ← Patch IPC availability guard
│   ├── tauri-protection-patch.ts ← Protection invocations avant init
│   ├── services/
│   │   ├── api/chat.ts           ← IPC bridge principal (invokeWithRetry)
│   │   ├── ai/
│   │   │   ├── chatEngine.ts     ← Pipeline v24.3.0 OMEGA
│   │   │   ├── orchestrator.ts   ← AIOrchestrator (NeuralSelection, circuit breaker)
│   │   │   ├── providers/        ← ollama, gemini, openai, claude, copilot, titaneLocal, fallback
│   │   │   ├── transports/       ← ollamaTransport (dual HTTP/IPC)
│   │   │   └── memoryIntegration.ts ← Intégration mémoire frontend
│   │   ├── conversation/         ← conversationStorage, legacyCleanup
│   │   └── singularityBridgeVInfinity.ts ← Snapshot + secureInvoke bridge
│   ├── engines/conversation/
│   │   └── conversationLifecycleEngine.ts ← Multi-conversation lifecycle
│   ├── components/chat/          ← ChatUI, ConversationsButton, ChatModeSelector
│   └── hooks/useChat.ts          ← Hook principal état chat
├── src-tauri/
│   ├── src/
│   │   ├── main.rs               ← Entry Rust + generate_handler!(200+ cmds) + setup
│   │   ├── conversation_engine/  ← OMEGA: commands, memory, router, policy, resilience, search, cognitive
│   │   ├── overdrive/
│   │   │   └── chat_orchestrator.rs ← Hybrid (Gemini/Ollama/Local) + UnifiedMemory
│   │   ├── ollama.rs             ← HTTP direct Ollama (query_ollama, pick_fallback_model)
│   │   ├── commands/             ← 40+ fichiers (chat, memory, voice, auth, governance, etc.)
│   │   │   ├── chat_generate_commands.rs ← chat_generate_gemini/openai/claude/copilot
│   │   │   ├── chat.rs           ← send_message STUB + InputValidator
│   │   │   └── engine_commands.rs ← engine_get_evolution_state STUB
│   │   ├── neural_memory/        ← stm, mtm, ltm, vector, consolidation, compaction, manager
│   │   ├── unified_memory_v2/    ← api, bridge, persistence, bloom, query
│   │   ├── memory/               ← encryption, storage, pool, model
│   │   ├── singularity_fusion/   ← AutoFix, AutoHeal, CrashGuard, Performance, Pipeline (~45 cmds)
│   │   ├── selfheal/             ← Module self-repair Rust
│   │   ├── security/             ← secrets_engine (AES-256-GCM), rate_limit, permission_guard
│   │   ├── ai/router.rs          ← AIRouter (init avec default Ollama model)
│   │   └── runtime_config.rs     ← env vars (OLLAMA_BASE_URL, TITANE_OLLAMA_MODEL, etc.)
│   ├── Cargo.toml                ← Features: mock / full / défaut
│   ├── tauri.conf.json           ← Capabilities + allowlist
│   └── capabilities/             ← IPC allowlist per command
├── scripts/
│   └── autoheal/
│       ├── autoheal_rules.jsonl  ← 20+ règles AH (UNSTAGED)
│       ├── apply_autoheal.sh     ← Application règles
│       └── detect_recurrence.sh  ← Détection récidive
└── e2e/desktop/                  ← WDIO tests (online-chat-proof-ui.wdio.test.js UNSTAGED)
```

## 6 Blocs Canoniques — Statut

| Bloc | Paths | Statut Vérité |
|---|---|---|
| **BOOT** | main.tsx, boot-diagnostics.ts, tauri-init-fix.ts, main.rs (fn main) | ✅ RÉEL |
| **PORTAL** | services/api/chat.ts, tauriClient.ts, invokeWithRetry | ✅ RÉEL |
| **KERNEL** | conversation_engine/, overdrive/chat_orchestrator.rs, ollama.rs, commands/ | ✅ RÉEL (PARTIAL cloud) |
| **MEMORY** | neural_memory/, unified_memory_v2/, memory/, persistent_memory.rs | ⚠️ PARTIAL (LTM off default) |
| **IMMUNITY** | singularity_fusion/, selfheal/, security/, scripts/autoheal/ | ✅ RÉEL |
| **METACOGNITION** | e2e/, vitest configs, proof_packs/, autoheal_rules.jsonl | ⚠️ PARTIAL (tests UNKNOWN) |

## Dépendances Critiques

- Ollama local: `http://localhost:11434` (requis pour OMEGA pipeline sans API key)
- SQLite: `conversation_os_v1.db` (conversation memory persistence)
- AES-256-GCM: `TITANE_SECRETS_PASSPHRASE` env var (P0 si absent en prod)
- Feature flag `full`: requis pour AI réel via legacy bridge (P0 risque build défaut)
