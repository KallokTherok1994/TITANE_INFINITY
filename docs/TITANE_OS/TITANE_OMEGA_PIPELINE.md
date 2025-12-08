# TITANE_OMEGA_PIPELINE.md

## OMEGA Pipeline — Conversation Processing Architecture v20.1

**Date:** 2025-12-07
**Version:** TITANE∞ v20.1
**Classification:** Official Documentation

---

## 1. Overview

The **OMEGA Pipeline** is TITANE∞'s unified conversation processing system. It transforms user messages into intelligent, contextually-aware responses through an 11-stage processing flow.

### 1.1 Key Features

- **Parallel Processing:** Stages 2-4 execute concurrently via `tokio::join!`
- **AI Router Cache:** LRU cache with 500 entries, 5-minute TTL
- **French Mastery:** Native French post-processing optimization
- **Self-Healing:** Automatic state verification and recovery
- **Memory Integration:** Full STM/MTM/LTM synchronization

### 1.2 Performance Targets (v20.1)

| Metric          | Target | Achieved      |
| --------------- | ------ | ------------- |
| Total Latency   | <200ms | ~150-200ms    |
| Cache Hit TTFT  | <50ms  | <50ms         |
| Parallel Stages | ~50ms  | max(5,5,50)ms |
| Memory Save     | <10ms  | <10ms         |

---

## 2. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OMEGA PIPELINE v20.1                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT                                                          │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 1: Preprocessing & Validation                      │  │
│  │ - Trim, validate length (max 10,000 chars)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGES 2-4: PARALLEL EXECUTION (tokio::join!)            │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────────────────┐ │  │
│  │ │ Intent     │ │ Emotion    │ │ Memory Context         │ │  │
│  │ │ Analysis   │ │ Analysis   │ │ Load                   │ │  │
│  │ │ (2-5ms)    │ │ (2-5ms)    │ │ (10-50ms)              │ │  │
│  │ └────────────┘ └────────────┘ └────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 5: Prompt Construction                             │  │
│  │ - System identity + Mode + Context + Cognitive analysis  │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 6: AI Generation                                   │  │
│  │ - Router selection, Provider query, Cache check          │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 6.5: French Mastery Post-Processing                │  │
│  │ - Native French optimization, style correction           │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 7: API Neutralization                              │  │
│  │ - Capture provider metadata, reconstruct response        │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 8: Cognitive Compression                           │  │
│  │ - Generate summary, tags, memory effect, coherence score │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 9: Memory Save                                     │  │
│  │ - Persist exchange to STM/MTM                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 10: Singularity Sync                               │  │
│  │ - Update global cognitive state                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STAGE 11: Self-Healing Check                             │  │
│  │ - Verify state integrity, trigger repairs if needed      │  │
│  └──────────────────────────────────────────────────────────┘  │
│    │                                                            │
│    ▼                                                            │
│  OUTPUT: ConversationResponse                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Stage Details

### Stage 1: Preprocessing & Validation

**Location:** `pipeline.rs:220-236`

```rust
fn preprocess(&self, message: &str) -> Result<String, ConversationEngineError> {
    let trimmed = message.trim();

    if trimmed.is_empty() {
        return Err(ConversationEngineError::ValidationError(
            "Message vide".to_string()
        ));
    }

    if trimmed.len() > 10000 {
        return Err(ConversationEngineError::ValidationError(
            "Message trop long (max 10000 caractères)".to_string()
        ));
    }

    Ok(trimmed.to_string())
}
```

**Validations:**

- Empty message check
- Length limit (10,000 characters)
- Whitespace trimming

---

### Stages 2-4: Parallel Execution

**Location:** `pipeline.rs:86-113`

**Optimization v20.1:** These three independent stages now execute concurrently using `tokio::join!`, reducing latency from ~60ms (sequential) to ~50ms (parallel).

```rust
let (intention, emotion, memory_result) = tokio::join!(
    // STAGE 2: Intent Analysis (CPU-bound, ~2-5ms)
    async { self.intent_analyzer.analyze(&msg_for_intent) },

    // STAGE 3: Emotion Analysis (CPU-bound, ~2-5ms)
    async { self.emotion_analyzer.analyze(&msg_for_emotion, emotion_ctx) },

    // STAGE 4: Memory Context Load (IO-bound, ~10-50ms)
    async {
        let conv_id = self.memory.ensure_conversation_id(conv_id_opt).await?;
        let mem_ctx = self.memory.load_context(&conv_id).await?;
        Ok::<_, ConversationEngineError>((conv_id, mem_ctx))
    }
);
```

#### Stage 2: Intent Analysis

Detects user intention:

```rust
pub enum Intention {
    Question,      // User asking a question
    Action,        // User requesting action
    Emotion,       // User expressing emotion
    Clarification, // User seeking clarity
    Meta,          // User discussing the conversation itself
}
```

#### Stage 3: Emotion Analysis

Analyzes emotional state:

```rust
pub struct EmotionState {
    pub valence: f32,    // -1.0 (negative) to 1.0 (positive)
    pub intensity: f32,  // 0.0 (calm) to 1.0 (intense)
    pub energy: f32,     // 0.0 (low) to 1.0 (high)
}
```

#### Stage 4: Memory Context

Loads conversation history and relevant memories from STM/MTM.

---

### Stage 5: Prompt Construction

**Location:** `pipeline.rs:239-318`

Builds enriched prompt with:

1. **System Identity:** Mode-specific persona
2. **Mode Instruction:** Behavioral guidance
3. **Memory Context:** Previous conversation history
4. **Cognitive Analysis:** Intent + Emotion metadata
5. **French Rule:** Mandatory French response

#### Conversation Modes

| Mode           | Identity                    | Instruction                               |
| -------------- | --------------------------- | ----------------------------------------- |
| Default        | Assistant cognitif français | Réponse claire et naturelle               |
| Brainstorming  | Mode divergence créative    | Idées audacieuses, perspectives multiples |
| Synthesis      | Mode synthèse & connexion   | Patterns, liens conceptuels               |
| Planning       | Mode stratégie & action     | Étapes concrètes, plans d'action          |
| Journal        | Mode réflexion personnelle  | Écoute empathique, questions ouvertes     |
| DebugCognitive | Mode debug cognitif         | Clarification du chaos mental             |

---

### Stage 6: AI Generation

**Location:** `pipeline.rs:320-337`

```rust
async fn generate_ai_response(
    &self,
    prompt: String,
    config: AIConfig,
) -> Result<AIResponse, ConversationEngineError> {
    let ai_request = AIRequest {
        prompt,
        temperature: config.temperature,
        max_tokens: config.max_tokens.unwrap_or(2000),
        stream: false,
    };

    let router = self.ai_router.read().await;
    router.query(ai_request).await
        .map_err(|e| ConversationEngineError::AIError(e.to_string()))
}
```

**AI Router Features:**

- Multi-provider support (OpenAI, Claude, Gemini, Ollama)
- LRU response cache (500 entries, 5min TTL)
- Provider status cache (30s TTL)
- Automatic fallback chain

---

### Stage 6.5: French Mastery Post-Processing

**Location:** `pipeline.rs:135-158`

```rust
let french_request = FrenchMasteryRequest {
    context: format!("Mode: {:?}, Intent: {:?}", request.mode, intention),
    draft_response: ai_response.content.clone(),
    mode: ProcessingMode::Optimization,
    constraints: PostProcessingConstraints::default(),
};

let french_processed = match self.french_mastery.process(french_request).await {
    Ok(processed) => processed.finalized_response,
    Err(e) => ai_response.content.clone(), // Fallback to raw response
};
```

**Optimizations:**

- Grammar correction
- Style consistency
- Idiomatic French expressions
- Punctuation normalization

---

### Stage 7: API Neutralization

**Location:** `pipeline.rs:160-161`

Normalizes AI provider responses:

- Extracts provider metadata
- Standardizes response format
- Captures token usage

---

### Stage 8: Cognitive Compression

**Location:** `pipeline.rs:163-170`

```rust
pub struct CognitiveSummary {
    pub summary: String,           // Condensed exchange summary
    pub tags: Vec<String>,         // Semantic tags
    pub memory_effect: MemoryEffect, // Impact on memory
    pub memory_layers: MemoryLayers, // Target layers
    pub links: Vec<String>,        // Context links
    pub coherence_score: f32,      // 0.0 - 1.0
}
```

---

### Stage 9: Memory Save

**Location:** `pipeline.rs:172-182`

```rust
let message_id = self.memory.save_exchange(
    &conversation_id,
    &validated_message,
    &neutralized_response.content,
    &intention,
    &emotion,
    &cognitive_summary,
    &neutralized_response.provider,
    start.elapsed().as_millis() as u64,
).await?;
```

---

### Stage 10: Singularity Sync

**Location:** `pipeline.rs:184-185`

Synchronizes cognitive state with the global SingularityState:

- Updates emotional valence
- Tracks coherence score
- Propagates cognitive context

---

### Stage 11: Self-Healing Check

**Location:** `pipeline.rs:187`

```rust
self.self_healing.write().await.verify_state(&conversation_id).await?;
```

**Checks:**

- State consistency validation
- Memory integrity verification
- Anomaly detection
- Automatic repair triggering

---

## 4. Request/Response Types

### ConversationRequest

```rust
pub struct ConversationRequest {
    pub user_message: String,
    pub conversation_id: Option<String>,
    pub mode: ConversationMode,
    pub emotion_context: Option<EmotionContext>,
    pub ai_config: Option<AIConfig>,
}
```

### ConversationResponse

```rust
pub struct ConversationResponse {
    pub assistant_message: String,
    pub conversation_id: String,
    pub message_id: String,
    pub detected_intention: Intention,
    pub detected_emotion: EmotionState,
    pub cognitive_tags: Vec<String>,
    pub cognitive_summary: String,
    pub metadata: ConversationMetadata,
}
```

### ConversationMetadata

```rust
pub struct ConversationMetadata {
    pub timestamp: u64,
    pub provider_used: String,
    pub latency_ms: u64,
    pub tokens_used: u32,
    pub memory_effect: MemoryEffect,
    pub links_to_contexts: Vec<String>,
}
```

---

## 5. Logging

The pipeline uses structured logging throughout:

```
[Ω:IN]       Pipeline entry - mode, message length, conversation ID
[Ω:PARALLEL] Parallel stages completion time
[Ω:FRENCH]   French Mastery processing status
[Ω:OUT]      Pipeline exit - latency, tokens, provider
```

Example log output:

```
[Ω:IN] mode=Default | msg_len=45 | conv_id=Some("abc123")
[Ω:PARALLEL] Étapes 2-4 complétées en 48ms
[Ω:FRENCH] Application FrenchMastery | content_len=512
[Ω:FRENCH] ✅ Post-traitement réussi
[Ω:OUT] latency=156ms | tokens=128 | french_mastery=true | provider=claude
```

---

## 6. Error Handling

```rust
pub enum ConversationEngineError {
    ValidationError(String),    // Input validation failed
    MemoryError(String),        // Memory operation failed
    AIError(String),            // AI provider error
    SyncError(String),          // State sync failed
    HealingError(String),       // Self-healing failed
}
```

---

## 7. Pipeline Components

### 7.1 ConversationPipeline Structure

```rust
pub struct ConversationPipeline {
    memory: Arc<ConversationMemoryEngine>,
    ai_router: Arc<RwLock<AIRouter>>,
    self_healing: Arc<RwLock<SelfHealingConversation>>,
    singularity: Arc<RwLock<SingularityState>>,
    french_mastery: Arc<FrenchMasteryProcessor>,
    intent_analyzer: IntentAnalyzer,
    emotion_analyzer: EmotionAnalyzer,
    cognitive_compressor: CognitiveCompressor,
    api_neutralizer: ApiNeutralizer,
}
```

### 7.2 Component Responsibilities

| Component                  | Responsibility                             |
| -------------------------- | ------------------------------------------ |
| `ConversationMemoryEngine` | Context load/save, conversation management |
| `AIRouter`                 | Provider selection, query routing, caching |
| `SelfHealingConversation`  | State verification, anomaly recovery       |
| `SingularityState`         | Global cognitive state                     |
| `FrenchMasteryProcessor`   | French language optimization               |
| `IntentAnalyzer`           | User intention detection                   |
| `EmotionAnalyzer`          | Emotional state analysis                   |
| `CognitiveCompressor`      | Summary and tag generation                 |
| `ApiNeutralizer`           | Provider response normalization            |

---

## 8. Performance Optimization Summary

| Optimization          | Before          | After          | Improvement   |
| --------------------- | --------------- | -------------- | ------------- |
| Parallel stages 2-4   | 60ms sequential | 50ms parallel  | ~17%          |
| AI response cache     | 300-2000ms API  | <1ms cache hit | >99%          |
| Provider status cache | Network check   | 30s cached     | ~95% network  |
| Memory lookup         | O(n)            | O(1) HashMap   | Constant time |

---

## 9. Related Documentation

| Document                                                         | Description                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [TITANE_OS_OVERVIEW.md](TITANE_OS_OVERVIEW.md)                   | System architecture overview |
| [TITANE_UNIFIED_MEMORY_OS.md](TITANE_UNIFIED_MEMORY_OS.md)       | Memory system details        |
| [TITANE_OS_COGNITIVE_ENGINES.md](TITANE_OS_COGNITIVE_ENGINES.md) | Cognitive layer              |

---

_Documentation officielle TITANE∞ OMEGA Pipeline v20.1 — Super Prompt #5_
