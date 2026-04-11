# ARCHITECTURE_TRUTH.md — Architecture 4-Ring TITANE_INFINITY

**Version:** 30.0.0
**SHA:** 1165def2d
**Date:** 2026-04-11T13:17:00Z
**Classification:** CANON

---

## 1. Principe Fondamental

TITANE_INFINITY est un **OS cognitif Tauri-only**.
Toute interaction réseau externe passe exclusivement par le backend Tauri (Rust).
Le frontend (React/TypeScript) n'a **aucun accès réseau direct**.

**Règle cardinale : ONE DOOR**
```
UI → IPC (Tauri invoke) → Backend Rust → Réseau externe
```

---

## 2. Architecture 4-Ring

```
┌─────────────────────────────────────────────────────┐
│  RING 4 — UI / Entry Point                          │
│  src/App.tsx, src/main.tsx                          │
│  src/pages/ (TitanePage: 8 tabs, EvoPage: 5 tabs)  │
│  src-tauri/src/main.rs (invoke_handler)             │
├─────────────────────────────────────────────────────┤
│  RING 3 — Orchestration                             │
│  src/core/                                          │
│  src-tauri/src/handlers.rs                          │
│  src-tauri/src/overdrive/chat_orchestrator.rs       │
├─────────────────────────────────────────────────────┤
│  RING 2 — Business Logic                            │
│  src/services/                                      │
│  src-tauri/src/commands/ (all command modules)      │
│  src-tauri/src/conversation_engine/                 │
│  src-tauri/src/overdrive/ (voice_engine)            │
│  src-tauri/src/auth/                                │
│  src-tauri/src/audio/                               │
│  src-tauri/src/avatar/                              │
│  src-tauri/src/secure_commands.rs                   │
├─────────────────────────────────────────────────────┤
│  RING 1 — Data / Models                             │
│  src/types/                                         │
│  src-tauri/src/engines/unified_memory/              │
│  src-tauri/src/singularity_state/                   │
│  src-tauri/src/memory/                              │
└─────────────────────────────────────────────────────┘
```

---

## 3. Flux d'entrée canonique

```
[Utilisateur] → [React UI] → [safeInvokeCanonical(cmd)]
  → [Tauri IPC] → [invoke_handler / Ring 4]
  → [Orchestration / Ring 3]
  → [Business Logic / Ring 2]
  → [Data / Ring 1]
  → [Réseau externe si nécessaire — via backend uniquement]
```

---

## 4. IPC Contract

**Wrapper canonique :** `src/utils/invoke.ts`
- Fonction principale : `safeInvokeCanonical<T>(cmd, payload, timeoutMs)`
- Contrat de réponse : `CanonicalIpcResult<T> { ok, content, error }`
- Sécurité : passe par `secureInvoke` (lib/security)
- Retry : `safeInvokeWithRetry` (3 tentatives par défaut)
- Timeout : `safeInvokeWithTimeout` (10 000ms par défaut)

**Client Tauri :** `src/lib/tauriClient.ts` — layer d'abstraction secondaire

---

## 5. One Door — Politique Réseau

| Domaine | Accès réseau | Chemin |
|---------|-------------|--------|
| Frontend (React) | INTERDIT | — |
| httpClient.ts | DESACTIVE (browser) | — |
| Ollama (local) | Backend seulement | `ai::ollama` |
| Gemini | Backend seulement | `commands::chat_generate_commands::chat_generate_gemini` |
| OpenAI | Backend seulement | `commands::chat_generate_commands::chat_generate_openai` |
| Claude | Backend seulement | `commands::chat_generate_commands::chat_generate_claude` |
| Copilot | Backend seulement | `commands::copilot_commands` |
| Web Research | Backend — STUB uniquement | `web_research_commands::web_research` |

---

## 6. Modules Critiques par Ring

### Ring 2 — Moteurs Principaux

| Moteur | Emplacement | Version |
|--------|-------------|---------|
| Conversation Engine OMEGA | `src-tauri/src/conversation_engine/` | v19.5.2 |
| Chat Orchestrator | `src-tauri/src/overdrive/chat_orchestrator.rs` | v21 + R04 |
| Voice Engine | `src-tauri/src/overdrive/voice_engine.rs` | v21 REPAIR |
| Avatar Engine | `src-tauri/src/avatar/` | v23 + FullBody |
| Auth OS | `src-tauri/src/auth/` | active |
| Audio Engine | `src-tauri/src/audio/` | TTS + VAD + Capture |
| Secure Commands | `src-tauri/src/secure_commands.rs` | AES-256-GCM |
| Titan Persistence | `titane_infinity::persistence` | active |

### Ring 1 — Mémoire et État

| Composant | Emplacement |
|-----------|-------------|
| Unified Memory | `src-tauri/src/engines/unified_memory/` |
| Singularity State | `src-tauri/src/singularity_state/` |
| Memory Core | `src-tauri/core/legacy.rs → MemoryCore` |
| Helios Core | `src-tauri/core/legacy.rs → HeliosCore` |

---

## 7. États Gérés (Tauri .manage())

Au démarrage (`main.rs`), les états suivants sont enregistrés :
- `AppState` (SecurityManager)
- `SingularityCortexState`
- `OrchestratorState` (Multi-IA)
- `SecureSecretsEngine`
- `CopilotState`
- `ChatOrchestratorState`
- `HeliosCore`, `MemoryCore`
- `AvatarEngineGlobal`
- `AutoFixState`, `AutoHealState`, `CrashGuardState`, `PerformanceState`, `UnifiedPipelineState`
- `FrontendStateStore`
- `IdentityEngineState`
- `AIChatState` (Legacy bridge)
- `ExpFusionState`
- `SingularityEngine`
- `Option1DbAppState`
- `ConversationEngineState` (OMEGA)
- `PersistentMemoryState`

---

## 8. Fusion v30 — Évolution → Transform

La fusion v30 a supprimé le tab standalone `memory-evolution` de TitanePage et EvoPage.
Contenu absorbé dans `src/components/sections/TransformationSection.tsx`.

| Avant (v28) | Après (v30) |
|---|---|
| Tab séparé `/memory-evolution` | Fusionné dans `tab=transformation` |
| EvoPage : 6 onglets | EvoPage : 5 onglets |
| TitanePage : onglets sans MemoryEvolution explicite | TitanePage `🌱 Transform & Évo` = transformation + évolution mémoire |

Routes `/memory-evolution` et `/memory-evo` → `Navigate to="/titane?tab=transformation"`.

---

*Autorité : Kevin Thibault — TITANE Team*
*Mis à jour : 2026-04-11T13:17:00Z — v30.0.0*
