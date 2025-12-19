# 💬 Conversation Engine — Module Documentation

**Module Path:** `src-tauri/src/conversation_engine/`  
**Version:** v19.5.2  
**Purpose:** Unified conversational processing with memory persistence and self-healing  
**Language:** Rust  
**Architecture Role:** High-level orchestrator for conversation management

---

## 🎯 MODULE OVERVIEW

**Conversation Engine** est le module de conversation unifié qui gère l'ensemble du cycle de vie conversationnel : validation, enrichissement, génération (via OMEGA), post-traitement (French Mastery), memory persistence, et self-healing.

### Responsibilities

- 🔄 **Conversation Orchestration** — Coordonner pipeline conversationnel complet
- 🧠 **Memory Management** — Persister conversations (UnifiedMemory integration)
- 🎯 **Intent & Emotion Processing** — Analyser intent et émotion utilisateur
- 🇫🇷 **French Mastery** — Post-traitement qualité française littéraire
- 🛡️ **Self-Healing** — Auto-diagnostic et auto-réparation conversations
- 🌌 **OMEGA Integration** — Bridge vers OMEGA Pipeline (voir [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md))
- 🎭 **Realism & Consistency** — Garantir cohérence conversationnelle multi-turn
- 📚 **Literary & Anthology Engines** — Enrichissement stylistique

### Key Components

**Core Files:**
- `mod.rs` — Module exports et `ConversationEngineState`
- `pipeline.rs` — ConversationPipeline (12 stages)
- `omega_integration.rs` — Bridge OMEGA ↔ Conversation
- `memory.rs` — ConversationMemoryEngine (persistence)
- `self_healing.rs` — SelfHealingConversation (diagnostics)
- `french_mastery.rs` — FrenchMasteryProcessor (quality post-processing)
- `types.rs` — Data structures (ConversationRequest, ConversationResponse, etc.)

**Sub-Modules:**
- `intent.rs` — IntentAnalyzer (classification intention)
- `emotion.rs` — EmotionAnalyzer (détection émotion)
- `realism.rs` — ConversationalRealismProcessor (natural language)
- `behavioral_consistency.rs` — BehavioralConsistency (multi-turn coherence)
- `literary_engine.rs` — LiteraryEngine (style enhancement)
- `anthology_engine.rs` — AnthologyEngine (knowledge base)
- `commands.rs` — Tauri commands (conversation_generate, etc.)

---

## 📊 ARCHITECTURE

### Conversation Pipeline (12 Stages)

```
┌──────────────────────────────────────────────────────────────┐
│                USER REQUEST (ConversationRequest)            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: REQUEST VALIDATION                                  │
│ - Validate conversation_id                                   │
│ - Check message constraints                                  │
│ - Sanitize user input                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 2: SELF-HEALING PRE-CHECK                              │
│ - Check conversation health                                  │
│ - Auto-repair corrupted state                                │
│ - Reset if needed                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 3: MEMORY CONTEXT RETRIEVAL                            │
│ - Load conversation history                                  │
│ - Recall relevant memories (UnifiedMemory)                   │
│ - Build contextual bundle                                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────┬─────────────────────────────────────┐
│ STAGE 4: INTENT ANALYSIS       STAGE 5: EMOTION ANALYSIS    │
│ (Parallel)                      (Parallel)                   │
│                        │                                     │
│ - Classify intent      │ - Detect emotion                    │
│ - Determine complexity │ - Assess sentiment                  │
└────────────────────────┴─────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 6: BEHAVIORAL CONSISTENCY CHECK                        │
│ - Validate multi-turn coherence                              │
│ - Check personality alignment                                │
│ - Ensure context continuity                                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 7: OMEGA PIPELINE DISPATCH                             │
│ - Bridge to OMEGA (OmegaConversationBridge)                  │
│ - Execute 10-stage OMEGA pipeline                            │
│ - Get AI-generated response                                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 8: FRENCH MASTERY POST-PROCESSING                      │
│ - Grammar correction (100% français)                         │
│ - Literary quality enhancement                               │
│ - Style consistency enforcement                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 9: REALISM & LITERARY ENRICHMENT                       │
│ - ConversationalRealismProcessor: Natural language           │
│ - LiteraryEngine: Style enhancement                          │
│ - AnthologyEngine: Knowledge enrichment                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 10: MEMORY PERSISTENCE                                 │
│ - Save to ConversationMemoryEngine                           │
│ - Persist to UnifiedMemory (STM/MTM/LTM)                     │
│ - Update conversation state                                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 11: SINGULARITY META-PROCESSING                        │
│ - Sync SingularityState (meta-cognitive)                     │
│ - Update system awareness                                    │
│ - Enrich cognitive tags                                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 12: SELF-HEALING POST-CHECK                            │
│ - Validate response quality                                  │
│ - Check conversation health                                  │
│ - Log metrics & diagnostics                                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│            CONVERSATION RESPONSE (Enriched)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 API REFERENCE

### Main Struct: `ConversationEngineState`

```rust
pub struct ConversationEngineState {
    pipeline: Arc<ConversationPipeline>,
    memory: Arc<ConversationMemoryEngine>,
    self_healing: Arc<RwLock<SelfHealingConversation>>,
    singularity: Arc<RwLock<SingularityState>>,
    omega_bridge: Arc<OmegaConversationBridge>,
    french_mastery: Arc<FrenchMasteryProcessor>,
    // ... other engines
}
```

### Core Methods

#### `new(storage_dir, password, ai_router, singularity) -> Result<Self>`
**Purpose:** Initialize Conversation Engine  
**Parameters:**
- `storage_dir: PathBuf` — Directory for encrypted storage
- `password: String` — Encryption password (AES-256-GCM)
- `ai_router: Arc<RwLock<AIRouter>>` — AI provider router
- `singularity: Arc<RwLock<SingularityState>>` — Singularity state

**Returns:** Configured engine ready for processing

#### `process_message(request: ConversationRequest) -> Result<ConversationResponse>`
**Purpose:** Execute full 12-stage conversation pipeline  
**Parameters:**
- `request: ConversationRequest` — User message + conversation context

**Returns:** `Result<ConversationResponse>` — Enriched response

**Example:**
```rust
let request = ConversationRequest {
    conversation_id: "conv_123".to_string(),
    user_message: "Explique-moi la mémoire synaptique".to_string(),
    mode: ConversationMode::Educational,
    system_prompt: None,
    temperature: Some(0.7),
};

let response = engine.process_message(request).await?;
println!("AI Response: {}", response.message);
```

---

## 🧩 SUB-MODULES

### `omega_integration.rs` — OMEGA Bridge

**Purpose:** Bridge entre Conversation Engine et OMEGA Pipeline

**Key Struct:**
```rust
pub struct OmegaConversationBridge {
    omega_pipeline: Arc<OmegaPipeline>,
    config: OmegaBridgeConfig,
    french_mastery: Arc<FrenchMasteryProcessor>,
    singularity: Arc<RwLock<SingularityState>>,
}
```

**Methods:**
- `process_through_omega(request: &ConversationRequest) -> Result<OmegaPipelineResult>`
- `convert_to_conversation_response(omega_result, request) -> Result<ConversationResponse>`
- `health_check() -> OmegaHealthReport`

**Integration Point:** STAGE 7 (dispatch OMEGA pipeline)

### `french_mastery.rs` — French Quality Processor

**Purpose:** Post-traitement qualité française (grammar, style, literary enhancement)

**Key Struct:**
```rust
pub struct FrenchMasteryProcessor {
    grammar_rules: GrammarRuleSet,
    literary_style: LiteraryStyleConfig,
}
```

**Methods:**
- `process(text: &str, constraints: PostProcessingConstraints) -> Result<String>`
- `correct_grammar(text: &str) -> String`
- `enhance_style(text: &str, mode: ProcessingMode) -> String`

**Integration Point:** STAGE 8 (post-processing after OMEGA)

### `self_healing.rs` — Self-Healing System

**Purpose:** Auto-diagnostic et auto-réparation conversations

**Key Struct:**
```rust
pub struct SelfHealingConversation {
    health_metrics: HealthMetrics,
    repair_strategies: Vec<RepairStrategy>,
}
```

**Methods:**
- `pre_check(conversation_id: &str) -> HealthReport`
- `post_check(response: &ConversationResponse) -> HealthReport`
- `auto_repair(conversation_id: &str) -> Result<()>`

**Integration Points:** STAGE 2 (pre-check) + STAGE 12 (post-check)

### `memory.rs` — Conversation Memory Engine

**Purpose:** Persist conversations avec encryption (AES-256-GCM)

**Key Struct:**
```rust
pub struct ConversationMemoryEngine {
    storage: EncryptedStorage,
    cache: LRUCache<String, Conversation>,
}
```

**Methods:**
- `load_conversation(id: &str) -> Result<Conversation>`
- `save_conversation(conversation: &Conversation) -> Result<()>`
- `get_history(id: &str, limit: usize) -> Vec<Message>`

**Integration Point:** STAGE 3 (load) + STAGE 10 (save)

---

## 💾 DATA STRUCTURES

### `ConversationRequest`

```rust
pub struct ConversationRequest {
    /// Conversation ID (UUID format)
    pub conversation_id: String,
    /// User message (validated, sanitized)
    pub user_message: String,
    /// Conversation mode
    pub mode: ConversationMode,
    /// Optional system prompt override
    pub system_prompt: Option<String>,
    /// Optional temperature override (0.0-2.0)
    pub temperature: Option<f32>,
    /// Optional max tokens override
    pub max_tokens: Option<u32>,
}
```

### `ConversationResponse`

```rust
pub struct ConversationResponse {
    /// Conversation ID
    pub conversation_id: String,
    /// AI-generated message (post-processed)
    pub message: String,
    /// Intent detected
    pub intent: Intent,
    /// Emotion detected
    pub emotion: Emotion,
    /// Quality score (0.0-1.0)
    pub quality_score: f32,
    /// Safety score (0.0-1.0)
    pub safety_score: f32,
    /// Cognitive tags (enrichment metadata)
    pub cognitive_tags: Vec<String>,
    /// Memory context used
    pub memory_context: String,
    /// Processing time (ms)
    pub processing_time_ms: u64,
    /// Auto-healing applied?
    pub auto_healed: bool,
}
```

### `ConversationMode`

```rust
pub enum ConversationMode {
    /// Technical explanations (precise, factual)
    Technical,
    /// Creative writing (imaginative, literary)
    Creative,
    /// Empathetic support (emotional, supportive)
    Empathetic,
    /// Educational tutoring (pedagogical, clear)
    Educational,
    /// Professional assistance (formal, efficient)
    Professional,
}
```

---

## 🔗 INTEGRATIONS

### OMEGA Pipeline Integration

**Flow:** ConversationEngine → OmegaBridgeom → OMEGA Pipeline → ConversationResponse

**Example:**
```rust
// STAGE 7: Dispatch to OMEGA
let omega_result = self.omega_bridge
    .process_through_omega(&request)
    .await?;

// Convert OMEGA output → Conversation format
let response = self.omega_bridge
    .convert_to_conversation_response(
        omega_result,
        &request,
        conversation_id
    )
    .await?;
```

### UnifiedMemory Integration

**Flow:** ConversationEngine → UnifiedMemory (recall + store)

**Example:**
```rust
// STAGE 3: Recall memories
let memories = unified_memory.recall(&request.user_message, 10).await?;

// STAGE 10: Store interaction
unified_memory.store(
    format!("{}\n\n{}", request.user_message, response.message),
    "assistant",
    0.7, // importance
    &conversation_id,
    &["conversation", &request.mode.to_string()]
).await?;
```

### Singularity Integration

**Flow:** ConversationEngine → SingularityState (meta-processing)

**Example:**
```rust
// STAGE 11: Singularity meta-processing
let mut singularity = self.singularity.write().await;
singularity.singularity_meta_process_conversation(ChatContext {
    conversation_id: conversation_id.clone(),
    message: response.message.clone(),
    intent: response.intent.clone(),
    emotion: response.emotion.clone(),
    quality_score: response.quality_score,
    safety_score: response.safety_score,
    cognitive_tags: response.cognitive_tags.clone(),
    memory_context: response.memory_context.clone(),
}).await?;
```

---

## 🧪 TESTING

### Unit Tests

```bash
# Run conversation engine tests
cargo test conversation_engine::

# Run specific test
cargo test conversation_engine::test_pipeline_flow

# Run with output
cargo test conversation_engine:: -- --nocapture
```

**Key Test Cases:**
- `test_pipeline_basic_flow` — Full 12-stage pipeline
- `test_omega_integration` — OMEGA bridge functionality
- `test_french_mastery_quality` — Post-processing validation
- `test_self_healing_recovery` — Auto-repair scenarios
- `test_memory_persistence` — Conversation history persistence

### Integration Tests

```bash
# Run integration tests
cargo test --test conversation_integration_test
```

**Scenarios:**
- Multi-turn conversation avec memory persistence
- Provider fallback during OMEGA execution
- Self-healing après corrupted state
- Singularity meta-processing validation

---

## 📚 RELATED DOCUMENTATION

- [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md) — OMEGA Pipeline (10 stages)
- [UNIFIED_MEMORY.md](UNIFIED_MEMORY.md) — Memory system
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive state
- [AI_ROUTER.md](AI_ROUTER.md) — AI provider routing

**Architecture:**
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Conversation data flow
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Tauri commands API

---

**Module documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ
