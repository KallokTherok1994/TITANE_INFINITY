# 🔮 TITANE∞ — Modules Documentation INDEX

**Version:** v24.2.0  
**Dernière mise à jour:** 15 décembre 2025  
**Structure:** docs/05_modules/

---

## 🎯 PURPOSE

Documentation complète des modules TITANE∞ (backend Rust + frontend TypeScript):
- 🦀 **Backend (Rust)** — Core modules (OMEGA, ConversationEngine, Memory, Singularity)
- ⚛️ **Frontend (TypeScript)** — Services frontend (ChatEngine, UnifiedMemory)
- 🔗 **Integration** — Backend ↔ Frontend communication (Tauri commands)

**Principe:** Documentation module-by-module pour deep dive technique

---

## 🦀 BACKEND MODULES (Rust)

**Path:** `docs/05_modules/backend/`

### [OMEGA_PIPELINE.md](backend/OMEGA_PIPELINE.md) (463 lignes) ⭐⭐⭐⭐⭐

**Module Path:** `src-tauri/src/omega/`  
**Description:** Core AI processing pipeline (10 stages)  
**Responsibility:** Orchestrate input → AI generation → output (validation, context, emotion, intent, memory, singularity)

**Key Content:**
- 📊 **10-Stage Pipeline Flow** — Input validation → AI generation → singularity sync
- 🔧 **API Reference** — `OmegaPipeline::new()`, `process()`, `process_streaming()`
- 🧩 **Sub-Modules** — Router (AI provider selection), Executor (AI calls), Merger (multi-source), Guardrails (safety)
- 💾 **Data Structures** — `PipelineInput`, `PipelineOutput`, `OmegaConfig`
- 🔗 **Integrations** — UnifiedMemory (recall/store), Singularity (meta-processing), ConversationEngine (bridge)
- 🧪 **Testing** — Unit tests, integration tests, benchmarks
- ⚡ **Performance** — Latency benchmarks (Ollama ~500-800ms, Gemini ~800-1200ms)

**Target Audience:** Développeurs backend, AI engineers  
**Complexity:** ⭐⭐⭐⭐ (Advanced)

---

### [CONVERSATION_ENGINE.md](backend/CONVERSATION_ENGINE.md) (466 lignes) ⭐⭐⭐⭐⭐

**Module Path:** `src-tauri/src/conversation_engine/`  
**Description:** Unified conversational processing (12 stages)  
**Responsibility:** High-level orchestration (validation → OMEGA → French mastery → memory → singularity → self-healing)

**Key Content:**
- 📊 **12-Stage Pipeline** — Request validation → OMEGA dispatch → French mastery → memory persistence → singularity → self-healing
- 🔧 **API Reference** — `ConversationEngineState::new()`, `process_message()`
- 🧩 **Sub-Modules** — OmegaBridge (OMEGA integration), FrenchMastery (post-processing), SelfHealing (diagnostics), Memory (persistence)
- 💾 **Data Structures** — `ConversationRequest`, `ConversationResponse`, `ConversationMode`
- 🔗 **Integrations** — OMEGA Pipeline (dispatch Stage 7), UnifiedMemory (recall/store), Singularity (meta-processing Stage 11)
- 🧪 **Testing** — Unit tests, integration tests (multi-turn, fallback, self-healing)

**Target Audience:** Développeurs backend, system architects  
**Complexity:** ⭐⭐⭐⭐⭐ (Expert)

---

### [UNIFIED_MEMORY.md](backend/UNIFIED_MEMORY.md) (452 lignes) ⭐⭐⭐⭐⭐

**Module Path:** `src-tauri/src/memory_os/`  
**Description:** Neural-inspired 3-layer memory (STM/MTM/LTM)  
**Responsibility:** Memory persistence, consolidation, recall, decay (synaptic weights)

**Key Content:**
- 📊 **3-Layer Architecture** — STM (buffer, <1ms) → MTM (recent important, ~10ms) → LTM (permanent, ~50-100ms)
- 🔄 **Memory Workflow** — Store → STM → Consolidate → MTM → Consolidate → LTM
- 🔧 **API Reference** — `UnifiedMemoryEngine::new()`, `store()`, `recall()`, `consolidate()`, `decay()`
- 🧩 **Sub-Modules** — STM (short-term buffer), MTM (mid-term indexed), LTM (long-term compressed), VectorStore (embeddings), Consolidation (transitions), Decay (forgetting)
- 💾 **Data Structures** — `MemoryEntry`, `MemoryConfig`, `MemoryLayer`
- 🔗 **Integrations** — OMEGA Pipeline (Stage 2 recall, Stage 9 store), ConversationEngine (Stage 3 load, Stage 10 save)
- 🧪 **Testing** — STM/MTM/LTM tests, consolidation tests, decay tests
- ⚡ **Performance** — Recall latency (STM <1ms, MTM ~10ms, LTM ~50-100ms), Store latency

**Target Audience:** Développeurs backend, AI researchers  
**Complexity:** ⭐⭐⭐⭐⭐ (Expert - Neural architecture)

---

### [SINGULARITY.md](backend/SINGULARITY.md) (468 lignes) ⭐⭐⭐⭐⭐

**Module Path:** `src-tauri/src/singularity/`  
**Description:** Meta-cognitive state management  
**Responsibility:** System-level awareness, conversation meta-processing, cognitive fields unification

**Key Content:**
- 📊 **Singularity Cognitive Flow** — Perception → Interpretation → Intention → Expression → Memory Singularity → Operational Singularity
- 🔧 **API Reference** — `SingularityState::new()`, `singularity_meta_process_conversation()`, `update_system_consciousness()`
- 🧩 **Sub-Modules** — MetaProcessor (coherence, corrections, tags), CognitiveFields (perception/interpretation/intention/expression), SystemConsciousness (awareness tracking), GoalManager (goals coherence), MemorySingularity (conceptual), OperationalSingularity (self-organization)
- 💾 **Data Structures** — `ChatContext`, `MetaOutput`, `CognitiveFields`
- 🔗 **Integrations** — OMEGA Pipeline (Stage 10 sync), ConversationEngine (Stage 11 meta-processing)
- 🧪 **Testing** — Meta-processing tests, cognitive fields tests, consciousness tests

**Target Audience:** System architects, AI researchers  
**Complexity:** ⭐⭐⭐⭐⭐ (Expert - Meta-cognitive systems)

---

## ⚛️ FRONTEND MODULES (TypeScript)

**Path:** `docs/05_modules/frontend/`

### [CHAT_ENGINE.md](frontend/CHAT_ENGINE.md) (397 lignes) ⭐⭐⭐⭐

**Module Path:** `src/services/ai/chatEngine.ts`  
**Description:** Frontend AI orchestration  
**Responsibility:** Backend OMEGA dispatch, streaming, fallback, memory integration, cognitive integration

**Key Content:**
- 📊 **Chat Flow** — User input → validation → memory recall → cognitive context → backend OMEGA → memory save → cognitive save → UI update
- 🔧 **API Reference** — `ChatEngineOmega::generate()`, `generateStreaming()`, `setMemoryContext()`
- 💾 **Data Structures** — `ChatEngineConfig`, `ChatEngineResponse`, `MemoryContext`
- 🔗 **Integrations** — Backend OMEGA (Tauri `conversation_generate`), UnifiedMemory (recall/store), CognitiveOrchestrator (4 engines)
- 🧪 **Testing** — Generate tests, streaming tests, fallback tests, memory integration tests

**Target Audience:** Développeurs frontend, full-stack  
**Complexity:** ⭐⭐⭐⭐ (Advanced)

---

### [UNIFIED_MEMORY_FRONTEND.md](frontend/UNIFIED_MEMORY_FRONTEND.md) (389 lignes) ⭐⭐⭐⭐

**Module Path:** `src/services/unified/UnifiedMemory.ts`  
**Description:** Frontend memory orchestration  
**Responsibility:** Backend Memory OS bridge, frontend caching, context building

**Key Content:**
- 📊 **Memory Flow** — Frontend cache check → backend dispatch → backend Memory OS (STM/MTM/LTM parallel search) → cache update → return
- 🔧 **API Reference** — `UnifiedMemory::recall()`, `store()`, `getStats()`, `buildContext()`
- 💾 **Data Structures** — `UnifiedMemoryEntry`, `MemoryContext`, `MemoryStats`
- 🔗 **Integrations** — ChatEngine (recall before AI, store after AI), Backend Memory OS (Tauri `memory_recall`, `memory_store`)
- 🧪 **Testing** — Recall tests, store tests, cache tests, stats tests
- ⚡ **Performance** — Frontend cache hit rate, backend call reduction

**Target Audience:** Développeurs frontend, full-stack  
**Complexity:** ⭐⭐⭐ (Intermediate-Advanced)

---

## 🗺️ NAVIGATION RAPIDE

### Par rôle:
- **🦀 Backend Developer** → Backend modules (OMEGA, ConversationEngine, Memory, Singularity)
- **⚛️ Frontend Developer** → Frontend modules (ChatEngine, UnifiedMemory)
- **🔗 Full-Stack Developer** → Both backend + frontend + integration docs
- **🧠 AI Engineer** → OMEGA, Memory, Singularity (neural/cognitive architecture)
- **🏗️ System Architect** → ConversationEngine, Singularity (high-level orchestration)

### Par fonctionnalité:
- **💬 Chat AI** → OMEGA_PIPELINE.md, CONVERSATION_ENGINE.md, CHAT_ENGINE.md
- **🧠 Memory System** → UNIFIED_MEMORY.md, UNIFIED_MEMORY_FRONTEND.md
- **🌌 Meta-Cognitive** → SINGULARITY.md
- **🔄 Pipeline Processing** → OMEGA_PIPELINE.md, CONVERSATION_ENGINE.md
- **🔗 Frontend ↔ Backend** → CHAT_ENGINE.md, UNIFIED_MEMORY_FRONTEND.md

### Par complexité:
- **⭐⭐⭐ Intermediate** → UNIFIED_MEMORY_FRONTEND.md
- **⭐⭐⭐⭐ Advanced** → OMEGA_PIPELINE.md, CHAT_ENGINE.md
- **⭐⭐⭐⭐⭐ Expert** → CONVERSATION_ENGINE.md, UNIFIED_MEMORY.md, SINGULARITY.md

---

## 📊 MÉTRIQUES MODULES

| Module                    | Type     | Lignes | Sections | Code Examples | Complexity | Target Audience       |
| ------------------------- | -------- | ------ | -------- | ------------- | ---------- | --------------------- |
| OMEGA_PIPELINE.md         | Backend  | 463    | 9        | 15+           | ⭐⭐⭐⭐   | Backend + AI Engineers |
| CONVERSATION_ENGINE.md    | Backend  | 466    | 9        | 12+           | ⭐⭐⭐⭐⭐ | Backend + Architects   |
| UNIFIED_MEMORY.md         | Backend  | 452    | 10       | 18+           | ⭐⭐⭐⭐⭐ | Backend + AI Research  |
| SINGULARITY.md            | Backend  | 468    | 9        | 10+           | ⭐⭐⭐⭐⭐ | Architects + Research  |
| CHAT_ENGINE.md            | Frontend | 397    | 8        | 12+           | ⭐⭐⭐⭐   | Frontend + Full-Stack  |
| UNIFIED_MEMORY_FRONTEND.md| Frontend | 389    | 8        | 10+           | ⭐⭐⭐⭐   | Frontend + Full-Stack  |
| **TOTAL**                 | -        | **2,635** | **53** | **77+**      | -         | -                      |

---

## ✨ QUALITÉ MODULES DOCUMENTATION

| Critère              | Score      | Notes                                               |
| -------------------- | ---------- | --------------------------------------------------- |
| **Complétude**       | ⭐⭐⭐⭐⭐ | Coverage exhaustif (architecture → API → testing)  |
| **Clarté**           | ⭐⭐⭐⭐⭐ | Diagrammes flows, examples pratiques, explanations |
| **Code Examples**    | ⭐⭐⭐⭐⭐ | 77+ examples Rust/TypeScript commentés             |
| **API Reference**    | ⭐⭐⭐⭐⭐ | Signatures complètes, parameters, returns          |
| **Integrations**     | ⭐⭐⭐⭐⭐ | Cross-module integration examples                  |
| **Testing**          | ⭐⭐⭐⭐⭐ | Unit tests, integration tests, benchmarks          |
| **Cross-refs**       | ⭐⭐⭐⭐⭐ | Liens vers architecture docs + other modules       |

---

## 🔗 CROSS-REFERENCES

### Liens vers architecture:
- [ARCHITECTURE_CURRENT_v24.md](../00_meta/ARCHITECTURE_CURRENT_v24.md) — Architecture système complète
- [DATA_FLOW_CHAT.md](../02_architecture_reality/DATA_FLOW_CHAT.md) — Flow messaging chat complet
- [OMEGA_PIPELINE_DETAILED.md](../02_architecture_reality/OMEGA_PIPELINE_DETAILED.md) — Pipeline OMEGA architecture détaillée
- [TAURI_COMMANDS_REFERENCE.md](../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — API commands Tauri complète

### Liens vers guides:
- [QUICKSTART.md](../04_guides/quickstart/QUICKSTART.md) — Quick start utilisateur
- [SETUP.md](../04_guides/development/SETUP.md) — Setup développement
- [TESTING.md](../04_guides/development/TESTING.md) — Stratégie tests

### Liens vers features:
- [VOICE.md](../04_guides/features/VOICE.md) — Mode Vocal
- [MULTIMODAL.md](../04_guides/features/MULTIMODAL.md) — Multimodal Engine
- [MEMORY_OS.md](../04_guides/features/MEMORY_OS.md) — UnifiedMemory OS (user guide)
- [TEMPORAL.md](../04_guides/features/TEMPORAL.md) — Temporal Integrations

---

## 🔄 MODULE RELATIONSHIPS (Dependency Graph)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (UI)                          │
│                    (ChatPage, Stores)                       │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              CHAT_ENGINE.md (Frontend Service)              │
│         (Orchestration, Streaming, Fallback)                │
└─────────────────────────────────────────────────────────────┘
        ↓ ↑ (memory)                    ↓ ↑ (Tauri commands)
┌─────────────────────┐         ┌────────────────────────────┐
│ UNIFIED_MEMORY_     │         │ CONVERSATION_ENGINE.md     │
│ FRONTEND.md         │←────────│ (Backend Rust 12 stages)   │
│ (Frontend Service)  │         └────────────────────────────┘
└─────────────────────┘                    ↓ ↑
        ↓ ↑                         ┌──────────────────┐
        │                           │ OMEGA_PIPELINE.md│
        │                           │ (Backend Rust    │
        │                           │  10 stages)      │
        │                           └──────────────────┘
        │                                  ↓ ↑ ↓ ↑
        │                          ┌────────┴───┴────────┐
        └──────────────────────────┤ UNIFIED_MEMORY.md   │
                                   │ (Backend Rust       │
                                   │  STM/MTM/LTM)       │
                                   └─────────────────────┘
                                             ↓ ↑
                                   ┌─────────────────────┐
                                   │ SINGULARITY.md      │
                                   │ (Meta-cognitive)    │
                                   └─────────────────────┘
```

**Key Dependencies:**
- **ChatEngine** depends on: UnifiedMemory (frontend), Tauri commands (backend)
- **ConversationEngine** depends on: OMEGA Pipeline, UnifiedMemory, Singularity
- **OMEGA Pipeline** depends on: UnifiedMemory, Singularity, AI Router
- **UnifiedMemory** (backend) depends on: Vector store, SQLite/PostgreSQL
- **Singularity** depends on: Cognitive fields, System consciousness

---

## 🛠️ DEVELOPMENT WORKFLOW

### Backend Module Development

1. **Read module doc** (OMEGA, ConversationEngine, Memory, Singularity)
2. **Check API Reference** (method signatures, parameters, returns)
3. **Run unit tests** (`cargo test module_name::`)
4. **Check integrations** (other modules dependencies)
5. **Benchmark** (if performance-critical)
6. **Update docs** (if API changes)

**Example:**
```bash
# Develop OMEGA module
cd src-tauri
cargo test omega::test_pipeline_basic_flow
cargo bench omega_benchmark

# Check integration with Memory
cargo test omega::test_memory_integration
```

### Frontend Module Development

1. **Read module doc** (ChatEngine, UnifiedMemory)
2. **Check API Reference** (TypeScript interfaces, methods)
3. **Run unit tests** (`npm run test module_name`)
4. **Check backend integration** (Tauri commands)
5. **Test UI integration** (React hooks, stores)
6. **Update docs** (if API changes)

**Example:**
```bash
# Develop ChatEngine
npm run test chatEngine
npm run test:coverage chatEngine

# Test backend integration
npm run dev:tauri  # Launch Titan-Dev
```

---

## 📚 RELATED DOCUMENTATION

**Architecture:**
- [ARCHITECTURE_CURRENT_v24.md](../00_meta/ARCHITECTURE_CURRENT_v24.md) — System architecture
- [DATA_FLOW_CHAT.md](../02_architecture_reality/DATA_FLOW_CHAT.md) — Data flow
- [OMEGA_PIPELINE_DETAILED.md](../02_architecture_reality/OMEGA_PIPELINE_DETAILED.md) — OMEGA detailed
- [TAURI_COMMANDS_REFERENCE.md](../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Tauri API

**Guides:**
- [docs/04_guides/INDEX.md](../04_guides/INDEX.md) — Guides navigation
- [QUICKSTART.md](../04_guides/quickstart/QUICKSTART.md) — User quickstart
- [SETUP.md](../04_guides/development/SETUP.md) — Dev setup
- [TESTING.md](../04_guides/development/TESTING.md) — Testing strategy

**Features:**
- [docs/04_guides/features/INDEX.md](../04_guides/features/INDEX.md) — Features navigation
- [VOICE.md](../04_guides/features/VOICE.md) — Voice mode
- [MULTIMODAL.md](../04_guides/features/MULTIMODAL.md) — Multimodal engine
- [MEMORY_OS.md](../04_guides/features/MEMORY_OS.md) — Memory OS (user guide)

---

## 🛠️ MAINTENANCE

**Responsable:** TITANE Team  
**Update fréquence:** À chaque release module majeure  
**Version actuelle:** v24.2.0

**Guidelines:**
1. **Factualité FIRST:** Code réel v24.2.0 (pas intentions)
2. **API Reference accuracy:** Signatures exactes (Rust/TypeScript)
3. **Code examples tested:** Examples validés (compilent + executent)
4. **Integrations documented:** Cross-module dependencies claires
5. **Versioning:** Update numéro version à chaque modification API

**Évolutions futures:**
- Phase 6 continuation: Documentation modules additionnels (AI Router, Cognitive engines, etc.)
- Auto-generation API reference (Rustdoc + TypeDoc integration)
- Interactive diagrams (Mermaid, PlantUML)

---

## 📞 SUPPORT

**Questions modules?** → [GitHub Issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)  
**Bugs documentation?** → Ouvrir issue avec label `documentation` + `modules`  
**Feature requests?** → Ouvrir issue avec label `feature-request`

---

**INDEX généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ

---

_Modules documentation — Technical deep dive_ 🔮✨
