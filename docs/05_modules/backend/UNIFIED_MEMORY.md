# 🧠 UnifiedMemory OS — Module Documentation

**Module Path:** `src-tauri/src/memory_os/`  
**Version:** v2.0 (STM/MTM/LTM neural architecture)  
**Purpose:** Neural-inspired memory system with synaptic persistence  
**Language:** Rust  
**Architecture Role:** Long-term knowledge persistence and contextual recall

---

## 🎯 MODULE OVERVIEW

**UnifiedMemory OS** est le système de mémoire unifié de TITANE∞, inspiré du cerveau humain avec 3 couches : Short-Term Memory (STM), Mid-Term Memory (MTM), et Long-Term Memory (LTM). Il gère la persistence synaptique, consolidation, recall, et decay avec intelligence adaptive.

### Responsibilities

- 🧠 **3-Layer Memory Architecture** — STM → MTM → LTM workflow
- 💾 **Synaptic Persistence** — Neural-inspired storage avec synaptic weights
- 🔄 **Memory Consolidation** — Auto-transition STM → MTM → LTM
- 🔍 **Contextual Recall** — Vector search + semantic similarity
- ⏱️ **Memory Decay** — Intelligent forgetting (decay curves)
- 📊 **Importance Scoring** — Automatic importance calculation
- 🗜️ **Compression & Deduplication** — Optimize storage
- 🔐 **Encrypted Storage** — AES-256-GCM encryption

### Key Components

**Core Files:**
- `mod.rs` — Module exports et `MemoryOSState`
- `stm.rs` — Short-Term Memory (buffer rapide, decay rapide)
- `mtm.rs` — Mid-Term Memory (consolidation intermédiaire)
- `ltm.rs` — Long-Term Memory (persistence permanente)
- `memory_os.rs` — UnifiedMemoryEngine (orchestration)
- `vector_store.rs` — Vector embeddings storage (semantic search)
- `synaptic_weights.rs` — Neural-inspired synaptic persistence
- `consolidation.rs` — Memory transition logic (STM → MTM → LTM)
- `decay.rs` — Intelligent forgetting algorithms

---

## 📊 ARCHITECTURE

### 3-Layer Memory Model

```
┌──────────────────────────────────────────────────────────────┐
│                    MEMORY INPUT (Entry)                      │
│              (conversation, observation, fact)               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ SHORT-TERM MEMORY (STM)                                      │
│ - Capacity: 100-500 entries                                  │
│ - Decay: Rapide (1-24 hours)                                 │
│ - Purpose: Working memory buffer                             │
│ - Storage: In-memory (RAM) + disk backup                     │
│ - Recall: Instant (<1ms)                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Consolidation: importance > threshold)
┌──────────────────────────────────────────────────────────────┐
│ MID-TERM MEMORY (MTM)                                        │
│ - Capacity: 1,000-5,000 entries                              │
│ - Decay: Medium (days to weeks)                              │
│ - Purpose: Recent important knowledge                        │
│ - Storage: SQLite + vector index                             │
│ - Recall: Fast (~10ms)                                       │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Consolidation: repeated access + time)
┌──────────────────────────────────────────────────────────────┐
│ LONG-TERM MEMORY (LTM)                                       │
│ - Capacity: Unlimited (compressed)                           │
│ - Decay: Slow to none (permanent knowledge)                  │
│ - Purpose: Persistent knowledge base                         │
│ - Storage: PostgreSQL / Qdrant + embeddings                  │
│ - Recall: Moderate (~50-100ms)                               │
└──────────────────────────────────────────────────────────────┘
```

### Memory Workflow

```
USER INTERACTION
       ↓
   Store(entry) ─────► STM (immediate storage)
       │                  │
       │                  ↓ (after N accesses or importance > X)
       │              Consolidate → MTM
       │                  │
       │                  ↓ (after time T or repeated recalls)
       │              Consolidate → LTM
       │
   Recall(query) ────► Parallel search:
       ↓                  ├─ STM (instant)
   Results                ├─ MTM (fast)
   (merged)               └─ LTM (moderate)
       ↓
   Scored & ranked by:
   - Recency (recent = higher)
   - Importance (important = higher)
   - Similarity (semantic match)
   - Access frequency
```

---

## 🔧 API REFERENCE

### Main Struct: `UnifiedMemoryEngine`

```rust
pub struct UnifiedMemoryEngine {
    stm: Arc<RwLock<ShortTermMemory>>,
    mtm: Arc<RwLock<MidTermMemory>>,
    ltm: Arc<RwLock<LongTermMemory>>,
    vector_store: Arc<VectorStore>,
    consolidation_config: ConsolidationConfig,
}
```

### Core Methods

#### `new(config: MemoryConfig) -> Self`
**Purpose:** Initialize Unified Memory system  
**Parameters:**
- `config: MemoryConfig` — Configuration (capacities, thresholds, decay rates)

**Returns:** Configured memory engine

#### `store(entry: MemoryEntry) -> Result<MemoryId>`
**Purpose:** Store new memory (automatic STM → MTM → LTM routing)  
**Parameters:**
- `entry: MemoryEntry` — Memory content + metadata

**Returns:** `Result<MemoryId>` — Unique ID for stored memory

**Example:**
```rust
let memory = unified_memory.store(MemoryEntry {
    content: "TITANE∞ utilise une architecture neuronale à 3 couches".to_string(),
    role: MemoryRole::System,
    importance: 0.8, // High importance → faster consolidation
    conversation_id: Some("conv_123".to_string()),
    tags: vec!["architecture", "neural"],
    timestamp: Utc::now(),
}).await?;

println!("Memory stored: {}", memory);
```

#### `recall(query: &str, limit: usize) -> Result<Vec<MemoryEntry>>`
**Purpose:** Recall memories semantically similar to query  
**Parameters:**
- `query: &str` — Search query (natural language)
- `limit: usize` — Max results to return

**Returns:** `Result<Vec<MemoryEntry>>` — Scored and ranked memories

**Example:**
```rust
let memories = unified_memory.recall("architecture TITANE", 10).await?;
for mem in memories {
    println!("Memory: {} (score: {:.2})", mem.content, mem.score);
}
```

#### `consolidate() -> Result<ConsolidationReport>`
**Purpose:** Run memory consolidation (STM → MTM → LTM)  
**Returns:** Report of transitions performed

**Example:**
```rust
let report = unified_memory.consolidate().await?;
println!("Consolidated: {} STM → MTM, {} MTM → LTM", 
    report.stm_to_mtm_count, 
    report.mtm_to_ltm_count
);
```

#### `decay() -> Result<DecayReport>`
**Purpose:** Run memory decay (intelligent forgetting)  
**Returns:** Report of memories decayed/removed

---

## 🧩 SUB-MODULES

### `stm.rs` — Short-Term Memory

**Purpose:** Buffer rapide pour recent interactions (working memory)

**Characteristics:**
- **Capacity:** 100-500 entries (configurable)
- **Decay:** Rapide (1-24 hours, exponential)
- **Storage:** In-memory (HashMap) + disk backup
- **Recall:** Instant (<1ms)

**Key Methods:**
- `push(entry: MemoryEntry) -> Result<()>` — Add to STM (FIFO eviction if full)
- `get(id: &MemoryId) -> Option<MemoryEntry>` — Retrieve by ID
- `search(query: &str) -> Vec<MemoryEntry>` — Semantic search in STM
- `consolidate_to_mtm() -> Vec<MemoryEntry>` — Get entries ready for MTM

### `mtm.rs` — Mid-Term Memory

**Purpose:** Recent important knowledge (consolidation intermédiaire)

**Characteristics:**
- **Capacity:** 1,000-5,000 entries
- **Decay:** Medium (days to weeks)
- **Storage:** SQLite + vector index (HNSW)
- **Recall:** Fast (~10ms)

**Key Methods:**
- `insert(entry: MemoryEntry) -> Result<()>` — Add to MTM (from STM consolidation)
- `query(query: &str, limit: usize) -> Vec<MemoryEntry>` — Vector search
- `consolidate_to_ltm() -> Vec<MemoryEntry>` — Get entries ready for LTM

### `ltm.rs` — Long-Term Memory

**Purpose:** Permanent knowledge base (compressed, indexed)

**Characteristics:**
- **Capacity:** Unlimited (compressed)
- **Decay:** Slow to none (permanent)
- **Storage:** PostgreSQL / Qdrant (vector database)
- **Recall:** Moderate (~50-100ms)

**Key Methods:**
- `insert(entry: MemoryEntry) -> Result<()>` — Add to LTM (from MTM consolidation)
- `search(query: &str, limit: usize) -> Vec<MemoryEntry>` — Semantic search (Qdrant)
- `prune() -> Result<PruneReport>` — Remove very low-importance entries (optional)

### `vector_store.rs` — Vector Embeddings Storage

**Purpose:** Semantic search via vector embeddings (sentence transformers)

**Key Methods:**
- `embed(text: &str) -> Vec<f32>` — Generate embedding (384-dim vector)
- `index(id: MemoryId, embedding: Vec<f32>) -> Result<()>` — Index vector
- `search(query_embedding: Vec<f32>, limit: usize) -> Vec<(MemoryId, f32)>` — KNN search

**Embedding Model:** `all-MiniLM-L6-v2` (384-dim, fast, multilingual support)

### `consolidation.rs` — Memory Consolidation Logic

**Purpose:** Auto-transition STM → MTM → LTM basé sur rules

**Consolidation Rules:**

**STM → MTM:**
- Importance > 0.6 (threshold configurable)
- Access count > 3 (repeated recalls)
- Age > 1 hour (minimum dwell time in STM)

**MTM → LTM:**
- Age > 7 days (time threshold)
- Access count > 10 (frequently recalled)
- Importance > 0.7 (high value)

**Example:**
```rust
let consolidation_config = ConsolidationConfig {
    stm_to_mtm_importance_threshold: 0.6,
    stm_to_mtm_access_count_threshold: 3,
    stm_to_mtm_age_threshold_hours: 1,
    mtm_to_ltm_age_threshold_days: 7,
    mtm_to_ltm_access_count_threshold: 10,
    mtm_to_ltm_importance_threshold: 0.7,
};
```

### `decay.rs` — Intelligent Forgetting

**Purpose:** Decay memories based on time, importance, and access patterns

**Decay Curves:**
- **STM:** Exponential decay (half-life = 6 hours)
- **MTM:** Logarithmic decay (half-life = 7 days)
- **LTM:** Linear decay (very slow, optional)

**Decay Formula:**
```
score = importance * exp(-decay_rate * time_since_last_access)
```

**Example:**
```rust
let decay_report = unified_memory.decay().await?;
println!("Decayed: {} STM, {} MTM, {} LTM",
    decay_report.stm_decayed_count,
    decay_report.mtm_decayed_count,
    decay_report.ltm_decayed_count
);
```

---

## 💾 DATA STRUCTURES

### `MemoryEntry`

```rust
pub struct MemoryEntry {
    /// Unique ID
    pub id: MemoryId,
    /// Memory content (text)
    pub content: String,
    /// Role (user, assistant, system)
    pub role: MemoryRole,
    /// Importance score (0.0-1.0)
    pub importance: f32,
    /// Conversation ID (optional grouping)
    pub conversation_id: Option<String>,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Timestamp created
    pub timestamp: DateTime<Utc>,
    /// Last accessed timestamp
    pub last_accessed: DateTime<Utc>,
    /// Access count (for consolidation)
    pub access_count: u32,
    /// Current layer (STM, MTM, LTM)
    pub layer: MemoryLayer,
    /// Vector embedding (semantic search)
    pub embedding: Option<Vec<f32>>,
}
```

### `MemoryConfig`

```rust
pub struct MemoryConfig {
    /// STM capacity (default: 500)
    pub stm_capacity: usize,
    /// MTM capacity (default: 5000)
    pub mtm_capacity: usize,
    /// LTM unlimited (compression enabled)
    pub ltm_compression: bool,
    /// Consolidation config
    pub consolidation: ConsolidationConfig,
    /// Decay config
    pub decay: DecayConfig,
    /// Vector store config (embedding model, index type)
    pub vector_store: VectorStoreConfig,
}
```

---

## 🔗 INTEGRATIONS

### OMEGA Pipeline Integration

**Flow:** OMEGA → UnifiedMemory (recall + store)

**Example:**
```rust
// STAGE 2 (OMEGA): Recall memories
let memories = unified_memory.recall(&query, 10).await?;

// STAGE 9 (OMEGA): Store interaction
unified_memory.store(MemoryEntry {
    content: format!("{}\n\n{}", query, response),
    role: MemoryRole::Assistant,
    importance: 0.7,
    conversation_id: Some(conversation_id),
    tags: vec!["conversation", "omega"],
    timestamp: Utc::now(),
    // ... other fields
}).await?;
```

### Conversation Engine Integration

**Flow:** ConversationEngine → UnifiedMemory (persistence)

**Example:**
```rust
// STAGE 10 (Conversation): Memory persistence
unified_memory.store(MemoryEntry {
    content: conversation_response.message.clone(),
    role: MemoryRole::Assistant,
    importance: calculate_importance(&conversation_response),
    conversation_id: Some(conversation_id),
    tags: vec!["conversation", &conversation_mode.to_string()],
    timestamp: Utc::now(),
    // ... other fields
}).await?;
```

---

## 🧪 TESTING

### Unit Tests

```bash
# Run memory OS tests
cargo test memory_os::

# Run specific layer tests
cargo test memory_os::stm::
cargo test memory_os::mtm::
cargo test memory_os::ltm::

# Run with output
cargo test memory_os:: -- --nocapture
```

**Key Test Cases:**
- `test_stm_basic_operations` — STM store/recall
- `test_mtm_vector_search` — MTM semantic search
- `test_ltm_persistence` — LTM long-term storage
- `test_consolidation_stm_to_mtm` — Auto-transition STM → MTM
- `test_consolidation_mtm_to_ltm` — Auto-transition MTM → LTM
- `test_decay_stm` — STM decay curves
- `test_recall_parallel` — Parallel search across layers

---

## ⚡ PERFORMANCE

### Benchmarks

**Recall latency (10 results):**
- **STM only:** <1ms (in-memory)
- **MTM only:** ~10ms (vector search)
- **LTM only:** ~50-100ms (Qdrant search)
- **Parallel (STM + MTM + LTM):** ~100ms (merged results)

**Store latency:**
- **STM:** <1ms (in-memory push)
- **MTM:** ~5ms (SQLite + vector index)
- **LTM:** ~20ms (PostgreSQL + Qdrant)

**Consolidation:**
- **STM → MTM:** ~100ms (batch 50 entries)
- **MTM → LTM:** ~500ms (batch 100 entries)

### Optimizations

✅ **Vector index:** HNSW (Hierarchical Navigable Small World) pour fast KNN  
✅ **Batch consolidation:** Process 50-100 entries at once  
✅ **LRU cache:** Cache recent recalls (1000 entries)  
✅ **Compression:** LTM compressed (gzip) pour reduce storage

---

## 📚 RELATED DOCUMENTATION

- [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md) — OMEGA integration
- [CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md) — Conversation persistence
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive memory

**Architecture:**
- [ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md) — System architecture
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Memory flow in chat

**Feature Guides:**
- [MEMORY_OS.md](../../04_guides/features/MEMORY_OS.md) — User-facing memory guide

---

**Module documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ
