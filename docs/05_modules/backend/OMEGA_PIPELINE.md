# 🔮 OMEGA Pipeline — Module Documentation

**Module Path:** `src-tauri/src/omega/`  
**Version:** v2.0 (10-stage pipeline)  
**Purpose:** Core AI processing pipeline with multi-stage intelligent processing  
**Language:** Rust  
**Architecture Role:** Central orchestrator for all AI-powered interactions

---

## 🎯 MODULE OVERVIEW

**OMEGA Pipeline** est le cœur du traitement intelligent de TITANE∞. Il orchestre un pipeline à 10 étapes qui transforme une requête utilisateur en réponse enrichie, validée et optimisée.

### Responsibilities

- ✅ **Input Validation** — Sanitize et valider les requêtes utilisateur
- 🧠 **Context Retrieval** — Récupérer contexte mémoire pertinent (UnifiedMemory)
- 🎯 **Intent Analysis** — Analyser intention utilisateur (parallel execution)
- 😊 **Emotion Analysis** — Détecter émotion dans requête (parallel execution)
- 📝 **Prompt Construction** — Construire prompts optimisés pour LLM
- 🤖 **AI Generation** — Générer réponses via multi-providers (Ollama, Gemini, Claude, OpenAI)
- 🇫🇷 **Post-Processing** — French mastery, sanitize, quality enhancement
- ✔️ **Output Validation** — Valider qualité réponse générée
- 💾 **Memory Save** — Persister interaction dans UnifiedMemory
- 🌌 **Singularity Sync** — Synchroniser état meta-cognitif (Singularity State)
- 🛡️ **Self-Healing Check** — Auto-diagnostic et auto-réparation

### Key Components

**Core Files:**
- `mod.rs` — Module exports et orchestration
- `pipeline.rs` — 10-stage pipeline implementation
- `router.rs` — AI provider routing et load balancing
- `executor.rs` — AI generation execution
- `merger.rs` — Multi-source response fusion
- `guardrails.rs` — Safety checks et validation

**Sub-Modules:**
- `intent_analyzer.rs` — Intent classification
- `emotion_analyzer.rs` — Emotion detection
- `context_builder.rs` — Context construction from memory
- `prompt_optimizer.rs` — Prompt engineering
- `quality_validator.rs` — Response quality scoring

---

## 📊 ARCHITECTURE

### Pipeline Flow (10 Stages)

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INPUT (Query)                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: INPUT VALIDATION                                    │
│ - Sanitize malicious input                                   │
│ - Check length constraints                                   │
│ - Normalize whitespace                                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 2: CONTEXT RETRIEVAL (UnifiedMemory)                   │
│ - Recall relevant memories (STM/MTM/LTM)                     │
│ - Build contextual bundle                                    │
│ - Attach metadata (importance, recency)                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────┬─────────────────────────────────────┐
│ STAGE 3: INTENT ANALYSIS       STAGE 4: EMOTION ANALYSIS    │
│ (Parallel Execution)            (Parallel Execution)         │
│                        │                                     │
│ - Classify user intent │ - Detect emotional tone             │
│ - Determine complexity │ - Assess sentiment                  │
│ - Identify goals       │ - Extract emotional context         │
└────────────────────────┴─────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 5: PROMPT CONSTRUCTION                                 │
│ - Merge: query + context + intent + emotion                  │
│ - Apply prompt engineering templates                         │
│ - Optimize for target provider                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 6: AI GENERATION (Multi-Provider)                      │
│ - Router: Select optimal provider                            │
│ - Executor: Execute API call                                 │
│ - Fallback: Auto-retry on failure                            │
│ Providers: Ollama | Gemini | Claude | OpenAI                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 7: POST-PROCESSING (French Mastery)                    │
│ - French grammar correction                                  │
│ - Literary quality enhancement                               │
│ - Sanitize unsafe content                                    │
│ - Format markdown                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 8: OUTPUT VALIDATION                                   │
│ - Quality score calculation                                  │
│ - Safety checks (guardrails)                                 │
│ - Coherence validation                                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 9: MEMORY SAVE (UnifiedMemory)                         │
│ - Store interaction (query + response)                       │
│ - Calculate importance score                                 │
│ - Persist to STM → MTM → LTM                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 10: SINGULARITY SYNC + SELF-HEALING                    │
│ - Sync meta-cognitive state (SingularityState)               │
│ - Run self-healing checks                                    │
│ - Update system health metrics                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    FINAL RESPONSE (Enriched)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 API REFERENCE

### Main Struct: `OmegaPipeline`

```rust
pub struct OmegaPipeline {
    config: OmegaConfig,
    router: AIRouter,
    memory_engine: Arc<UnifiedMemoryEngine>,
    singularity: Arc<RwLock<SingularityState>>,
    intent_analyzer: IntentAnalyzer,
    emotion_analyzer: EmotionAnalyzer,
    french_mastery: Arc<FrenchMasteryProcessor>,
}
```

### Core Methods

#### `new() -> Self`
**Purpose:** Create new OMEGA Pipeline instance  
**Returns:** Configured pipeline ready for processing

```rust
impl OmegaPipeline {
    pub fn new() -> Self {
        Self {
            config: OmegaConfig::default(),
            router: AIRouter::new(),
            memory_engine: Arc::new(UnifiedMemoryEngine::new()),
            singularity: Arc::new(RwLock::new(SingularityState::new())),
            intent_analyzer: IntentAnalyzer::new(),
            emotion_analyzer: EmotionAnalyzer::new(),
            french_mastery: Arc::new(FrenchMasteryProcessor::new()),
        }
    }
}
```

#### `process(input: PipelineInput) -> Result<PipelineOutput>`
**Purpose:** Execute full 10-stage pipeline  
**Parameters:**
- `input: PipelineInput` — User query + conversation context

**Returns:** `Result<PipelineOutput>` — Enriched response or error

**Example:**
```rust
let pipeline = OmegaPipeline::new();
let input = PipelineInput {
    query: "Explique-moi l'architecture TITANE∞".to_string(),
    conversation_id: "conv_123".to_string(),
    mode: ConversationMode::Technical,
};

let output = pipeline.process(input).await?;
println!("Response: {}", output.response);
```

#### `process_streaming(input: PipelineInput) -> impl Stream<Item = PipelineChunk>`
**Purpose:** Execute pipeline avec streaming de réponse  
**Returns:** Stream de chunks pour UI real-time update

---

## 🧩 SUB-MODULES

### `router.rs` — AI Provider Router

**Responsibility:** Sélectionner optimal AI provider basé sur health, load, et capabilities

**Key Methods:**
- `select_provider(intent: Intent) -> Provider` — Sélection intelligente provider
- `fallback_chain() -> Vec<Provider>` — Fallback automatique si provider fails
- `health_check() -> ProviderHealth` — Vérifier santé providers

**Providers supportés:**
- **Ollama** (local, privacy-first, gratuit)
- **Gemini** (Google Cloud, multimodal)
- **Claude** (Anthropic, reasoning)
- **OpenAI** (GPT-4, versatile)

### `executor.rs` — AI Execution Engine

**Responsibility:** Exécuter appels AI avec retry logic, timeout, et error handling

**Key Methods:**
- `execute(provider: Provider, prompt: String) -> Result<String>` — Execute AI call
- `execute_with_retry(max_retries: u32) -> Result<String>` — Auto-retry sur failure
- `execute_streaming() -> impl Stream<Item = String>` — Streaming execution

### `merger.rs` — Multi-Source Response Merger

**Responsibility:** Fusionner réponses de multiple sources (multi-provider, cached, fallback)

**Key Methods:**
- `merge(responses: Vec<Response>) -> Response` — Intelligent merge
- `score_response(response: &Response) -> f32` — Quality scoring
- `select_best(responses: Vec<Response>) -> Response` — Best response selection

### `guardrails.rs` — Safety & Quality Guardrails

**Responsibility:** Valider safety, quality, et coherence des réponses

**Key Methods:**
- `check_safety(response: &str) -> SafetyReport` — Detect unsafe content
- `check_quality(response: &str) -> QualityScore` — Quality metrics
- `check_coherence(response: &str, context: &str) -> CoherenceScore` — Context alignment

---

## 💾 DATA STRUCTURES

### `PipelineInput`

```rust
pub struct PipelineInput {
    /// User query (validated, sanitized)
    pub query: String,
    /// Conversation ID (for context tracking)
    pub conversation_id: String,
    /// Conversation mode (Technical, Creative, Empathetic, etc.)
    pub mode: ConversationMode,
    /// Optional system prompt override
    pub system_prompt: Option<String>,
    /// Optional temperature override (0.0-2.0)
    pub temperature: Option<f32>,
    /// Optional max tokens override
    pub max_tokens: Option<u32>,
}
```

### `PipelineOutput`

```rust
pub struct PipelineOutput {
    /// Generated response (post-processed, French mastery applied)
    pub response: String,
    /// Intent detected
    pub intent: Intent,
    /// Emotion detected
    pub emotion: Emotion,
    /// Memory context used
    pub memory_context: Vec<MemoryEntry>,
    /// Provider used for generation
    pub provider: Provider,
    /// Quality score (0.0-1.0)
    pub quality_score: f32,
    /// Safety score (0.0-1.0, 1.0 = safe)
    pub safety_score: f32,
    /// Processing time (ms)
    pub processing_time_ms: u64,
    /// Pipeline stages executed
    pub stages_executed: Vec<String>,
}
```

### `OmegaConfig`

```rust
pub struct OmegaConfig {
    /// Enable parallel stage execution (Stage 3 + 4)
    pub parallel_execution: bool,
    /// Enable streaming responses
    pub streaming_enabled: bool,
    /// Enable guardrails validation
    pub guardrails_enabled: bool,
    /// Default AI provider
    pub default_provider: Provider,
    /// Timeout per stage (ms)
    pub stage_timeout_ms: u64,
    /// Max retries per stage
    pub max_retries: u32,
}
```

---

## 🧪 TESTING

### Unit Tests

**File:** `src-tauri/src/omega/tests.rs`

```bash
# Run OMEGA tests
cargo test omega::

# Run specific test
cargo test omega::test_pipeline_basic_flow

# Run with output
cargo test omega:: -- --nocapture
```

**Key Test Cases:**
- `test_pipeline_basic_flow` — Full 10-stage pipeline execution
- `test_intent_analysis_parallel` — Parallel stages 3+4
- `test_provider_fallback` — Auto-retry avec provider fallback
- `test_french_mastery_integration` — Post-processing quality
- `test_memory_integration` — UnifiedMemory recall/store
- `test_singularity_sync` — SingularityState synchronization

### Integration Tests

**File:** `src-tauri/tests/omega_integration_test.rs`

```bash
# Run integration tests
cargo test --test omega_integration_test
```

**Scenarios:**
- End-to-end pipeline avec providers réels (Ollama local)
- Multi-turn conversation avec memory persistence
- Provider failure + fallback recovery
- Streaming response handling

---

## ⚡ PERFORMANCE

### Benchmarks

**Average latency (10-stage pipeline):**
- **Ollama (local, 7B model):** ~500-800ms
- **Gemini (cloud):** ~800-1200ms
- **Claude (cloud):** ~1000-1500ms
- **OpenAI GPT-4 (cloud):** ~1200-1800ms

**Bottlenecks:**
- Stage 6 (AI Generation): 60-80% du temps total
- Stage 2 (Context Retrieval): 5-10% (vector search)
- Stage 7 (French Mastery): 5-10% (grammar correction)

### Optimizations

✅ **Parallel Execution (Stage 3+4):** -30% latency (intent + emotion parallel)  
✅ **Memory Caching:** -20% Stage 2 latency (LRU cache 1000 entries)  
✅ **Streaming:** Real-time UI updates (TTFB <100ms)  
✅ **Provider Selection:** Intelligent routing (health + load balancing)

---

## 🔗 INTEGRATIONS

### UnifiedMemory Integration

**OMEGA → Memory:**
- **Stage 2:** Recall memories via `memory_engine.recall(query, limit)`
- **Stage 9:** Store interaction via `memory_engine.store(entry)`

**API:**
```rust
// Recall (Stage 2)
let memories = self.memory_engine.recall(&input.query, 10).await?;

// Store (Stage 9)
self.memory_engine.store(
    MemoryEntry {
        content: format!("{}\n\n{}", input.query, output.response),
        role: MemoryRole::Assistant,
        importance: 0.7,
        conversation_id: input.conversation_id.clone(),
        tags: vec!["conversation", &input.mode.to_string()],
    }
).await?;
```

### Singularity Integration

**OMEGA → Singularity:**
- **Stage 10:** Sync meta-cognitive state après each interaction

**API:**
```rust
let mut singularity = self.singularity.write().await;
singularity.singularity_meta_process_conversation(ChatContext {
    conversation_id: input.conversation_id.clone(),
    message: output.response.clone(),
    intent: output.intent.clone(),
    emotion: output.emotion.clone(),
    quality_score: output.quality_score,
    safety_score: output.safety_score,
    cognitive_tags: vec!["omega_pipeline"],
    memory_context: format!("Mode: {:?}", input.mode),
}).await?;
```

### Conversation Engine Integration

**ConversationEngine → OMEGA:**
- Bridge: `OmegaConversationBridge` (voir [CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md))
- Entry point: `bridge.process_through_omega(request)`

---

## 📚 RELATED DOCUMENTATION

- [CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md) — Conversation orchestration
- [UNIFIED_MEMORY.md](UNIFIED_MEMORY.md) — Memory system (STM/MTM/LTM)
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive state
- [AI_ROUTER.md](AI_ROUTER.md) — Multi-provider AI routing
- [FRENCH_MASTERY.md](FRENCH_MASTERY.md) — French quality post-processing

**Architecture:**
- [OMEGA_PIPELINE_DETAILED.md](../../02_architecture_reality/OMEGA_PIPELINE_DETAILED.md) — Pipeline architecture détaillée
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Chat data flow complet

---

## 🛠️ MAINTENANCE

**Responsable:** TITANE Team  
**Update fréquence:** À chaque release backend majeure  
**Version actuelle:** v2.0 (10-stage pipeline)

**Évolutions futures:**
- Stage 11: Multi-modal input support (images, audio)
- Stage 12: Agentic planning (multi-step reasoning)
- Caching layer (Redis) pour Stage 2 (memory retrieval)
- ONNX model local pour Stage 3+4 (intent/emotion offline)

---

**Module documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ
