# 🏛️ TITANE∞ — Architecture Actuelle v24.2.0 (Factuelle)

**Date:** 15 décembre 2025  
**Version:** v24.2.0  
**Sources:** Code analysé (Rust + TypeScript)

---

## 📊 VUE D'ENSEMBLE SYSTÈME

```
┌─────────────────────────────────────────────────────────────────────┐
│                   TITANE∞ v24.2.0                                   │
│            Cognitive Operating System - Dual Runtime                │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├─ FRONTEND (React + TypeScript)
         │  └─ 14 Cognitive Engines + Services
         │
         ├─ BRIDGE (Tauri IPC)
         │  └─ 100+ Commands Tauri
         │
         └─ BACKEND (Rust + Tauri v2)
            ├─ OMEGA Pipeline (4-stage processing)
            ├─ Overdrive (Chat + Voice)
            ├─ UnifiedMemory (STM/MTM/LTM)
            ├─ Singularity State (5-layer system)
            └─ Governance + Self-Healing
```

---

## 🎨 FRONTEND ARCHITECTURE

### Stack Technique

**Framework** : React 18.3.1  
**Langage** : TypeScript 5.3.3  
**Build** : Vite 5.0.11  
**UI** : Tailwind CSS + shadcn/ui  
**State Management** : Zustand + React Context

### Structure Dossiers

```
src/
├── components/          # Composants UI réutilisables
│   ├── ui/             # shadcn/ui primitives
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
│
├── engines/            # 14 Cognitive Engines
│   ├── AbstractionEngine/
│   ├── AnalogyEngine/
│   ├── BayesEngine/
│   ├── ConflictEngine/
│   ├── FusionEngine/
│   ├── InferenceEngine/
│   ├── KnowledgeEngine/
│   ├── LogicEngine/
│   ├── MetaReasonEngine/
│   ├── PlanningEngine/
│   ├── RecognitionEngine/
│   ├── ReinforcementEngine/
│   ├── TemporalEngine/
│   └── TransferEngine/
│
├── services/           # Services métier
│   ├── tauriBridge.ts  # Wrapper Tauri (658 lignes)
│   ├── ai/             # Services IA
│   ├── api/            # API clients
│   ├── memory/         # Memory OS frontend
│   ├── voice/          # Voice services
│   └── tts/            # TTS services
│
├── features/           # Features applicatives
│   ├── chat/           # Chat UI + logic
│   ├── voice/          # Voice UI + controls
│   ├── settings/       # Settings panels
│   └── devtools/       # DevTools UI
│
├── stores/             # Zustand stores
│   ├── chatStore.ts
│   ├── voiceStore.ts
│   └── settingsStore.ts
│
├── hooks/              # React hooks réutilisables
│   ├── useTauri.ts
│   ├── useChat.ts
│   └── useVoice.ts
│
├── utils/              # Utilitaires
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
└── types/              # Types TypeScript
    ├── tauri.d.ts
    ├── chat.d.ts
    └── voice.d.ts
```

### tauriBridge (Hub Central)

**Fichier** : [`src/services/tauriBridge.ts`](../src/services/tauriBridge.ts) (658 lignes)

**Rôle** : Wrapper TypeScript centralisant TOUS les appels Tauri backend.

**Architecture** :
```typescript
// Core wrapper
export async function invokeTauriCommand<T>(
  command: string,
  args?: Record<string, any>
): Promise<TauriResponse<T>> {
  try {
    const result = await invoke(command, args);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Typed API wrappers
export const TauriBridge = {
  singularity: {
    getFullState: () => invokeTauriCommand('singularity_get_full_state'),
    getPhysical: () => invokeTauriCommand('singularity_get_physical'),
    // ...
  },
  chat: {
    sendMessage: (request) => invokeTauriCommand('chat_send_message', { request }),
    getProviders: () => invokeTauriCommand('chat_get_providers_status'),
    // ...
  },
  voice: {
    startListening: () => invokeTauriCommand('voice_start_listening'),
    stopListening: () => invokeTauriCommand('voice_stop_listening'),
    // ...
  },
  // 15 catégories total
};
```

**Avantages** :
- ✅ Single source of truth pour API Tauri
- ✅ Type safety (TypeScript)
- ✅ Error handling centralisé
- ✅ Retry logic intégré
- ✅ Timeout management

---

## ⚙️ BACKEND ARCHITECTURE

### Stack Technique

**Langage** : Rust 1.70+  
**Framework** : Tauri v2.0  
**Async Runtime** : Tokio 1.35  
**Serialization** : Serde 1.0  
**Logging** : env_logger 0.11

### Modules Principaux

```
src-tauri/src/
├── main.rs                    # Entry point + 100+ Tauri commands
│
├── omega/                     # OMEGA Pipeline v2
│   ├── pipeline.rs            # Pipeline 4-stage (589L)
│   ├── router.rs              # STAGE 1: Router
│   ├── executor.rs            # STAGE 2: Executor
│   ├── merger.rs              # STAGE 3: Merger
│   ├── guardrails.rs          # STAGE 4: Guardrails
│   ├── diagnostics.rs         # Métriques
│   └── scheduler.rs           # Job scheduling
│
├── overdrive/                 # Chat + Voice
│   ├── chat_orchestrator.rs  # Multi-provider chat (1935L)
│   ├── voice_engine.rs        # Voice pipeline
│   └── providers/
│       ├── openai.rs          # OpenAI API
│       ├── claude.rs          # Anthropic Claude
│       ├── gemini.rs          # Google Gemini
│       └── ollama.rs          # Ollama local
│
├── memory/                    # UnifiedMemory OS
│   ├── unified_memory.rs      # STM/MTM/LTM
│   ├── memory_api.rs          # API commandes
│   ├── timeline.rs            # Timeline events
│   └── snapshots.rs           # Memory snapshots
│
├── singularity_state/         # Singularity 5-layer
│   ├── mod.rs                 # État principal
│   ├── physical.rs            # Layer Physical
│   ├── cognitive.rs           # Layer Cognitive
│   ├── symbolic.rs            # Layer Symbolic
│   ├── adaptive.rs            # Layer Adaptive
│   └── meta.rs                # Layer Meta
│
├── governance/                # Governance IA
│   ├── policies.rs            # Policies IA
│   ├── permissions.rs         # Matrice permissions
│   └── audit.rs               # Logs audit
│
├── audio/                     # Audio pipeline
│   ├── tts.rs                 # Text-to-Speech
│   ├── whisper.rs             # Speech-to-Text (Whisper)
│   └── devices.rs             # Audio devices management
│
├── auth/                      # Authentification
│   ├── auth_commands.rs       # Commandes auth
│   ├── api_keys.rs            # Gestion clés API
│   └── tokens.rs              # Dev tokens
│
├── system_center/             # System Center
│   ├── diagnostics.rs         # Diagnostics système
│   ├── cluster.rs             # Cluster management
│   └── hypervision.rs         # Hypervision monitoring
│
├── self_healing/              # Self-Healing
│   ├── mod.rs                 # Auto-réparation
│   └── triggers.rs            # Triggers healing
│
├── devtools/                  # DevTools
│   ├── logging.rs             # Logging système
│   └── debug.rs               # Debug utilities
│
├── conversation_engine/       # Conversation Engine OMEGA
│   ├── mod.rs
│   └── commands.rs
│
├── fusion.rs                  # Fusion multi-sources
├── helios/                    # Helios monitoring
├── hyper_intelligence/        # Hyper Intelligence
├── multimodal/                # Multimodal support
├── persistence/               # Persistent Memory
├── control_panel_commands.rs  # Control Panel
└── time_commands.rs           # Time utilities
```

### Invoke Handler (Registre Commandes)

**Fichier** : [`src-tauri/src/main.rs`](../src-tauri/src/main.rs) L538-700

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Chat & IA (12 commandes)
            chat_send_message,
            chat_stream_message,
            chat_get_providers_status,
            // ... (88+ autres commandes)
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Total** : **100+ commandes Tauri** organisées en 15 catégories  
**Documentation** : [TAURI_COMMANDS_REFERENCE.md](../06_api/TAURI_COMMANDS_REFERENCE.md)

---

## 🔄 FLUX DE DONNÉES (Chat Example)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUX CHAT COMPLET                                │
└─────────────────────────────────────────────────────────────────────┘

1. UI (React)
   │
   ├─ User types "Bonjour TITANE"
   ├─ ChatComponent.tsx captures input
   ├─ Calls sendChatMessage() from chatStore
   │
2. Frontend Service Layer
   │
   ├─ tauriBridge.chat.sendMessage()
   ├─ Prépare ChatRequest {
   │    message: "Bonjour TITANE",
   │    provider: "auto",
   │    streaming: false
   │  }
   ├─ Appelle invokeTauriCommand('chat_send_message', { request })
   │
3. Tauri IPC Bridge
   │
   ├─ Sérialise JSON → Rust
   ├─ Route vers invoke_handler
   ├─ Dispatch vers chat_send_message()
   │
4. Backend Rust (chat_orchestrator.rs)
   │
   ├─ calculate_timeout() → 30s (standard)
   ├─ Inject UnifiedMemory context (STM/MTM récents)
   ├─ Provider selection:
   │   ├─ "auto" → score providers (latency + availability)
   │   └─ Sélectionne OpenAI (fastest + best score)
   │
5. OMEGA Pipeline (optionnel si conversation OMEGA)
   │
   ├─ STAGE 1 Router: Analyse intent → Conversation
   ├─ STAGE 2 Executor: Execute OpenAI request
   ├─ STAGE 3 Merger: Single provider → no merge
   ├─ STAGE 4 Guardrails: Safety checks → PASS
   │
6. AI Provider (OpenAI)
   │
   ├─ HTTP POST https://api.openai.com/v1/chat/completions
   ├─ Headers: { Authorization: "Bearer sk-..." }
   ├─ Body: { model: "gpt-4o", messages: [...] }
   ├─ Reçoit réponse: "Bonjour ! Comment puis-je t'aider ?"
   │
7. Response Processing
   │
   ├─ Guardrails final validation
   ├─ Update UnifiedMemory (STM + MTM)
   ├─ Metrics logging (latency, tokens, cost)
   ├─ Serialize ChatResponse
   │
8. Tauri IPC Return
   │
   ├─ Rust → JSON → TypeScript
   ├─ tauriBridge receives TauriResponse<ChatResponse>
   │
9. UI Update
   │
   ├─ chatStore updates messages array
   ├─ React re-renders ChatComponent
   ├─ Display AI response in chat bubble
   └─ User sees "Bonjour ! Comment puis-je t'aider ?"
```

**Documentation détaillée** : [DATA_FLOW_CHAT.md](../01_architecture/DATA_FLOW_CHAT.md)

---

## 🧠 OMEGA PIPELINE v2

**Fichier** : [`src-tauri/src/omega/pipeline.rs`](../src-tauri/src/omega/pipeline.rs) (589 lignes)

### Les 4 Étapes

```
INPUT → [1. Router] → [2. Executor] → [3. Merger] → [4. Guardrails] → OUTPUT
```

| Étape | Rôle | Latence |
|-------|------|---------|
| **1. Router** | Analyse intent, routing, cache check | ~10-50ms |
| **2. Executor** | Exécution tâches (local/cloud/hybrid) | 100ms-30s |
| **3. Merger** | Fusion résultats multi-sources | ~5-20ms |
| **4. Guardrails** | Validation sécurité, filtrage | ~10-50ms |

**Total latency** : 125ms - 30s (selon provider + complexité)

**Documentation** : [OMEGA_PIPELINE_DETAILED.md](../01_architecture/OMEGA_PIPELINE_DETAILED.md)

---

## 💾 UNIFIED MEMORY OS

**Fichier** : [`src-tauri/src/memory/unified_memory.rs`](../src-tauri/src/memory/unified_memory.rs)

### Architecture 3-Tier

```
┌────────────────────────────────────────────────────────────┐
│                    UNIFIED MEMORY OS                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  STM (Short-Term Memory)                                    │
│  ├─ Durée: Minutes                                          │
│  ├─ Capacité: 10-50 entrées                                │
│  └─ Contenu: Messages récents, focus actuel                │
│                    ↓ Promotion automatique                  │
│  MTM (Mid-Term Memory)                                      │
│  ├─ Durée: Heures/Jours                                    │
│  ├─ Capacité: 100-500 entrées                              │
│  └─ Contenu: Décisions, contexte projet                    │
│                    ↓ Promotion automatique                  │
│  LTM (Long-Term Memory)                                     │
│  ├─ Durée: Permanent (disque)                              │
│  ├─ Capacité: Illimitée                                    │
│  └─ Contenu: Connaissances, faits, historique complet      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Commandes

| Commande | Action |
|----------|--------|
| `get_memory_state` | État complet STM/MTM/LTM |
| `memory_promote` | Promotion STM→MTM ou MTM→LTM |
| `memory_clear` | Efface STM |
| `write_snapshot` | Sauvegarde snapshot disque |
| `read_snapshot` | Restaure snapshot |

---

## 🌐 SINGULARITY STATE (5-Layer System)

**Fichier** : [`src-tauri/src/singularity_state/`](../src-tauri/src/singularity_state/)

### Les 5 Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   SINGULARITY STATE                          │
│                   Global Coherence: 0.87                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 5: META (Réflexivité)                                │
│  ├─ Self-awareness                                          │
│  ├─ Performance introspection                               │
│  └─ Méta-apprentissage                                      │
│                         ↓                                    │
│  Layer 4: ADAPTIVE (Apprentissage)                          │
│  ├─ Pattern learning                                        │
│  ├─ Model fine-tuning                                       │
│  └─ Behavior adaptation                                     │
│                         ↓                                    │
│  Layer 3: SYMBOLIC (Abstractions)                           │
│  ├─ Concepts haut-niveau                                    │
│  ├─ Relations symboliques                                   │
│  └─ Raisonnement abstrait                                   │
│                         ↓                                    │
│  Layer 2: COGNITIVE (Engines)                               │
│  ├─ 14 Cognitive Engines                                    │
│  ├─ OMEGA Pipeline                                          │
│  └─ Chat + Voice                                            │
│                         ↓                                    │
│  Layer 1: PHYSICAL (Ressources)                             │
│  ├─ CPU: 45% usage                                          │
│  ├─ RAM: 2.3 GB / 16 GB                                     │
│  └─ Disk: 120 GB / 512 GB                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Global Coherence Score

**Calcul** :
```rust
global_coherence = (
    physical_health * 0.2 +
    cognitive_efficiency * 0.3 +
    symbolic_consistency * 0.2 +
    adaptive_learning_rate * 0.15 +
    meta_self_awareness * 0.15
)
```

**Interprétation** :
- **0.9 - 1.0** : Optimal
- **0.7 - 0.9** : Bon
- **0.5 - 0.7** : Dégradé
- **< 0.5** : Critique (self-healing triggered)

---

## 🏗️ DUAL RUNTIME SYSTEM

### Titan-Dev (Développement)

**Script** : [`runtime/dev/run-dev.sh`](../runtime/dev/run-dev.sh)

**Stack** :
- Vite Dev Server (HMR) → Port 5173
- Tauri Dev Runtime (hot reload backend)
- React DevTools enabled
- Source maps enabled
- No optimizations (faster builds)

**Logs** :
- `runtime/dev/logs/vite.log` (frontend)
- `runtime/dev/logs/tauri.log` (backend)

**Commande** :
```bash
./runtime/dev/run-dev.sh
# ou
npm run dev
```

### Titan-Stable (Production)

**Script** : [`runtime/stable/build.sh`](../runtime/stable/build.sh)

**Optimisations** :
- Vite build (minification, tree-shaking, code splitting)
- Tauri release build (LTO, strip, opt-level 3)
- Bundle size optimized (~15 MB)
- Startup time < 2s

**Output** : Binary exécutable `target/release/titane-infinity`

**Commande** :
```bash
./runtime/stable/build.sh
# ou
npm run build:prod
```

---

## 📈 MÉTRIQUES SYSTÈME

### Performance

| Métrique | Valeur |
|----------|--------|
| **Startup time** | < 2s (Titan-Stable) |
| **Memory footprint** | ~200 MB (idle) |
| **Binary size** | ~15 MB (release) |
| **Chat latency** | 200ms - 5s (selon provider) |
| **OMEGA Pipeline** | 125ms - 30s |
| **Voice transcription** | ~500ms (Whisper) |

### Qualité Code

| Métrique | Statut |
|----------|--------|
| **TypeScript errors** | ✅ 0 |
| **ESLint warnings** | ✅ 0 |
| **Type safety** | ✅ 100% |
| **Rust clippy warnings** | ✅ 0 |
| **Test coverage** | ~60% (à améliorer) |

---

## 🔐 SÉCURITÉ

### API Keys Management

**Stockage** : Chiffré AES-256-GCM  
**Fichier** : `~/.config/titane/auth/keys.enc`  
**Commandes** :
- `chat_set_openai_key` (définir clé)
- `get_openai_key_status` (vérifier présence)
- `auth_save_api_keys` (sauvegarde chiffrée)

### Governance

**Fichier** : [`src-tauri/src/governance/`](../src-tauri/src/governance/)

**Fonctionnalités** :
- **Policies IA** : Règles validation réponses IA
- **Permissions Matrix** : Contrôle accès features
- **Security Log** : Audit trail complet
- **Guardrails** : Validation sécurité OMEGA Stage 4

---

## 🧪 TESTS

### Types Tests

```
tests/
├── unit/              # Tests unitaires (Vitest)
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── integration/       # Tests intégration (Vitest)
│   ├── api/
│   └── services/
│
├── e2e/               # Tests E2E (Playwright)
│   ├── chat.spec.ts
│   └── voice.spec.ts
│
└── rust/              # Tests Rust (cargo test)
    └── src-tauri/tests/
```

### Commandes

| Commande | Description |
|----------|-------------|
| `npm run test` | Vitest (unit + integration) |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:rust` | Cargo test (backend) |
| `npm run test:all` | TOUS les tests |
| `npm run test:coverage` | Coverage report |

---

## 🚀 ROADMAP ARCHITECTURE

### Phase 3 (Prochaine)

- [ ] **Streaming Support** : Réponses progressives OMEGA Pipeline
- [ ] **Parallel Stages** : Router + Executor simultanés (gain 30%)
- [ ] **Smart Caching** : Cache par étape (pas seulement final)
- [ ] **Auto-tuning** : Ajustement config selon métriques

### Phase 4

- [ ] **Multi-user** : Support utilisateurs multiples
- [ ] **Cluster Mode** : Distribution tâches multi-nodes
- [ ] **Advanced Self-Healing** : Prédiction anomalies
- [ ] **Real-time Collaboration** : Sync multi-clients

---

## 🔗 DOCUMENTATION COMPLÉMENTAIRE

| Document | Description |
|----------|-------------|
| [OMEGA_PIPELINE_DETAILED.md](../01_architecture/OMEGA_PIPELINE_DETAILED.md) | Pipeline 4-stage détaillé |
| [DATA_FLOW_CHAT.md](../01_architecture/DATA_FLOW_CHAT.md) | Flux chat complet end-to-end |
| [TAURI_COMMANDS_REFERENCE.md](../06_api/TAURI_COMMANDS_REFERENCE.md) | 100+ commandes Tauri |
| [GLOSSARY.md](../00_core/GLOSSARY.md) | Termes techniques |
| [PRE_UPDATE_ANALYSIS.md](../00_core/PRE_UPDATE_ANALYSIS.md) | Analyse baseline système |
| [DOCS_INVENTORY.md](../00_core/DOCS_INVENTORY.md) | Inventaire 1738 .md files |
| [DOCS_RISK_MAP.md](../00_core/DOCS_RISK_MAP.md) | Carte risques documentation |

---

**Statut** : ✅ Architecture v24.2.0 documentée factuellement  
**Prochaine étape** : Validation Phase 2 + Commit Git

---

*TITANE∞ Documentation Evolution Engine — Phase 2 Architecture Complète*
