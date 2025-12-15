# 🔍 Vector Store — Module Documentation

**Version:** v24.2.0  
**Module Path:** `src-tauri/src/api/vector_store_api.rs` + `src-tauri/src/memory_os/vector_store.rs`  
**Frontend:** `src/services/cognitive/TauriVectorStore.ts`  
**Type:** Backend + Frontend  
**Complexity:** ⭐⭐⭐⭐ (Advanced - Vector similarity search)

---

## 📋 MODULE OVERVIEW

### Purpose

Vector Store est le système de stockage et recherche vectorielle de TITANE∞, permettant la recherche sémantique via embeddings. Il constitue la foundation pour la mémoire sémantique, le rappel contextuel et la recherche par similarité.

### Responsibilities

**Backend (Rust):**
- SQLite persistent vector storage
- Cosine similarity computation
- k-Nearest Neighbors (kNN) search
- Multi-tier memory support (STM/MTM/LTM)
- CRUD operations on embeddings
- Performance optimization (WAL mode, indexing)

**Frontend (TypeScript):**
- Tauri backend bridge
- In-memory fallback (non-Tauri environments)
- Vector store abstraction interface
- Batch operations
- Stats tracking

### Key Features

- **384-dim embeddings** (sentence-transformers compatible)
- **Cosine similarity** search (normalized vectors)
- **Linear search** (<10ms latency for <10K vectors)
- **Multi-tier filtering** (SHORT_TERM, MEDIUM_TERM, LONG_TERM, META_MEMORY)
- **SQLite persistence** (WAL mode, optimized cache)
- **Thread-safe** operations (RwLock)
- **Future upgrade path**: HNSW or IVF for >100K vectors

---

## 🏗️ ARCHITECTURE

### Vector Store Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (TypeScript)                        │
│                                                                 │
│  ┌────────────────┐         ┌──────────────────────┐          │
│  │ SemanticMemory │────────>│ TauriVectorStore     │          │
│  │ Engine         │         │ (Tauri Adapter)      │          │
│  └────────────────┘         └──────────────────────┘          │
│                                      │                          │
│                                      │ invoke()                 │
└──────────────────────────────────────┼──────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Rust)                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              VECTOR STORE API                            │  │
│  │         (vector_store_api.rs - 676 lines)                │  │
│  │                                                          │  │
│  │  • vector_store_init(config)      → store_id           │  │
│  │  • vector_store_insert(entry)     → void               │  │
│  │  • vector_search(embedding, opts) → results[]          │  │
│  │  • vector_store_get(id)           → entry?             │  │
│  │  • vector_store_update(id, data)  → void               │  │
│  │  • vector_store_delete(id)        → void               │  │
│  │  • vector_store_stats(id)         → stats              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           MEMORY OS VECTOR STORE                         │  │
│  │         (vector_store.rs - 403 lines)                    │  │
│  │                                                          │  │
│  │  • VectorStore::new() / with_dim(384)                   │  │
│  │  • insert(entry) → Result<(), Error>                    │  │
│  │  • insert_batch(entries) → usize                        │  │
│  │  • search(query, k) → Vec<SearchResult>                 │  │
│  │  • search_threshold(query, min_sim, k) → Vec<Result>    │  │
│  │  • get_by_id(id) → Option<VectorEntry>                  │  │
│  │  • remove(id) → Result<(), Error>                       │  │
│  │  • count() → usize                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SQLITE DATABASE                             │  │
│  │         (Persistent vector storage)                      │  │
│  │                                                          │  │
│  │  Schema:                                                 │  │
│  │  • id (TEXT PRIMARY KEY)                                │  │
│  │  • tier (TEXT) - STM/MTM/LTM/META                       │  │
│  │  • type (TEXT) - fact/preference/milestone/etc          │  │
│  │  • summary (TEXT)                                       │  │
│  │  • details (TEXT)                                       │  │
│  │  • embedding (BLOB) - serialized f32[]                  │  │
│  │  • owner, tags, source_type, source_id                  │  │
│  │  • importance (REAL 0.0-1.0)                            │  │
│  │  • timestamps (created_at, updated_at, last_accessed)   │  │
│  │                                                          │  │
│  │  Indexes:                                                │  │
│  │  • idx_tier (tier)                                      │  │
│  │  • idx_type (type)                                      │  │
│  │  • idx_owner (owner)                                    │  │
│  │  • idx_importance (importance DESC)                     │  │
│  │  • idx_created (created_at DESC)                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

SIMILARITY COMPUTATION:

query_embedding (384-dim) ─────┐
                               │
vectors[i].embedding (384-dim) ┤──> cosine_similarity(a, b)
                               │    = dot(a, b) / (||a|| * ||b||)
                               │    = similarity score (0.0-1.0)
                               │
Sort by score DESC ────────────┤
                               │
Return top-k results ──────────┘
```

### Search Workflow

```
1. Frontend Request
   ├─> User: "Recall memories about avatar animations"
   └─> SemanticMemory.recall(query, limit=5)

2. Embedding Generation (Frontend)
   ├─> Transformers.js (all-MiniLM-L6-v2)
   └─> embedding: [0.123, -0.456, ..., 0.789] (384-dim)

3. Backend Search (Rust)
   ├─> vector_search(store_id, embedding, options)
   ├─> Load vectors from SQLite (with tier/type filters)
   ├─> Compute cosine similarity for each vector
   ├─> Sort by similarity DESC
   ├─> Apply min_score threshold (default 0.5)
   └─> Return top-k results (default 5)

4. Frontend Processing
   ├─> Convert VectorEntry → SemanticMemoryEntry
   ├─> Update access_count (increment)
   └─> Return SemanticMemoryResult[]

Performance:
├─> SQLite query: ~2-5ms (indexed)
├─> Similarity computation: ~3-7ms (384-dim, 1K vectors)
└─> Total latency: <10ms (typical workload)
```

---

## 🔧 API REFERENCE

### Backend Rust (vector_store_api.rs)

#### VectorStore

**Constructor:**
```rust
pub fn new(config: VectorStoreConfig) -> Result<Self, String>
```

**Configuration:**
```rust
pub struct VectorStoreConfig {
    pub db_path: String,        // Path to SQLite database
    pub table_name: String,     // Table name (e.g., "vectors")
    pub dimensions: usize,      // Embedding dimensions (384)
}
```

**Methods:**

```rust
/// Insert vector entry
pub fn insert(&self, entry: &VectorEntry) -> Result<(), String>

/// Search by similarity
pub fn search(
    &self,
    query_embedding: &[f32],
    options: SearchOptions,
) -> Result<Vec<SearchResult>, String>

/// Get entry by ID
pub fn get(&self, id: &str) -> Result<Option<VectorEntry>, String>

/// Update entry
pub fn update(
    &self,
    id: &str,
    updates: Partial<VectorEntry>,
) -> Result<(), String>

/// Delete entry
pub fn delete(&self, id: &str) -> Result<(), String>

/// Get statistics
pub fn get_stats(&self) -> Result<VectorStoreStats, String>
```

**Data Structures:**

```rust
pub struct VectorEntry {
    pub id: String,
    pub tier: String,                    // STM/MTM/LTM/META_MEMORY
    pub entry_type: String,              // fact/preference/milestone/etc
    pub summary: String,
    pub details: Option<String>,
    pub embedding: Vec<f32>,             // 384-dim vector
    pub owner: String,
    pub tags: Vec<String>,
    pub source_type: String,
    pub source_id: Option<String>,
    pub source_timestamp: i64,
    pub importance: f32,                 // 0.0-1.0
    pub access_count: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_accessed: i64,
}

pub struct SearchOptions {
    pub top_k: Option<usize>,            // Max results (default 10)
    pub min_score: Option<f32>,          // Min similarity (default 0.5)
    pub tier_filter: Option<Vec<String>>,
    pub type_filter: Option<Vec<String>>,
    pub owner_filter: Option<String>,
}

pub struct SearchResult {
    pub entry: VectorEntry,
    pub score: f32,                      // Cosine similarity (0.0-1.0)
    pub distance: f32,                   // 1.0 - score
}

pub struct VectorStoreStats {
    pub total_entries: u32,
    pub by_tier: HashMap<String, u32>,
    pub by_type: HashMap<String, u32>,
    pub avg_importance: f32,
    pub db_size_bytes: u64,
}
```

#### Tauri Commands

```rust
#[tauri::command]
pub async fn vector_store_init(
    config: VectorStoreConfig,
) -> Result<String, String> // Returns store_id

#[tauri::command]
pub async fn vector_store_insert(
    store_id: String,
    entry: VectorEntry,
) -> Result<(), String>

#[tauri::command]
pub async fn vector_search(
    store_id: String,
    embedding: Vec<f32>,
    options: SearchOptions,
) -> Result<Vec<SearchResult>, String>

#[tauri::command]
pub async fn vector_store_get(
    store_id: String,
    id: String,
) -> Result<Option<VectorEntry>, String>

#[tauri::command]
pub async fn vector_store_stats(
    store_id: String,
) -> Result<VectorStoreStats, String>
```

### Backend Rust (vector_store.rs - Memory OS)

#### VectorStore (In-Memory)

**Constructor:**
```rust
pub fn new() -> Self                    // Default 384-dim
pub fn with_dim(dim: usize) -> Self     // Custom dimensions
```

**Methods:**

```rust
/// Insert vector entry
pub async fn insert(&self, entry: &MemoryEntry) -> Result<(), VectorStoreError>

/// Insert batch
pub async fn insert_batch(&self, entries: &[MemoryEntry]) -> usize

/// Search for similar vectors
pub async fn search(&self, query_embedding: &[f32], k: usize) -> Vec<VectorSearchResult>

/// Search with threshold
pub async fn search_threshold(
    &self,
    query_embedding: &[f32],
    threshold: f32,
    k: usize,
) -> Vec<VectorSearchResult>

/// Get by ID
pub async fn get_by_id(&self, id: &Uuid) -> Option<VectorEntry>

/// Remove entry
pub async fn remove(&self, id: &Uuid) -> Result<(), VectorStoreError>

/// Count entries
pub async fn count(&self) -> usize

/// Clear all
pub async fn clear(&self)
```

**Data Structures:**

```rust
pub struct VectorEntry {
    pub id: Uuid,
    pub embedding: Vec<f32>,
    pub metadata: VectorMetadata,
}

pub struct VectorMetadata {
    pub content_preview: String,
    pub importance: f32,
    pub timestamp: i64,
    pub tags: Vec<String>,
}

pub struct VectorSearchResult {
    pub id: Uuid,
    pub similarity: f32,
    pub metadata: VectorMetadata,
}

pub enum VectorStoreError {
    MissingEmbedding(String),
    DimensionMismatch { expected: usize, got: usize },
    StorageError(String),
}
```

**Vector Math Utilities:**

```rust
/// Normalize vector to unit length
fn normalize_vector(v: &[f32]) -> Vec<f32>

/// Cosine similarity (for normalized vectors = dot product)
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32

/// Euclidean distance (L2 norm)
fn euclidean_distance(a: &[f32], b: &[f32]) -> f32
```

### Frontend TypeScript (TauriVectorStore.ts)

#### TauriVectorStore

**Constructor:**
```typescript
constructor(config: TauriVectorStoreConfig)

interface TauriVectorStoreConfig {
  dbPath: string;           // Path to SQLite database
  collectionName: string;   // Table name
  dimensions: number;       // Embedding dimensions (384)
}
```

**Methods:**

```typescript
// Initialize store (creates/opens backend database)
async initialize(): Promise<void>

// Add entry
async add(entry: SemanticMemoryEntry): Promise<void>

// Add batch
async addBatch(entries: SemanticMemoryEntry[]): Promise<void>

// Search by similarity
async search(
  embedding: number[],
  limit: number,
  filters?: Record<string, unknown>
): Promise<SemanticMemoryResult[]>

// Get by ID
async get(id: string): Promise<SemanticMemoryEntry | null>

// Update entry
async update(id: string, updates: Partial<SemanticMemoryEntry>): Promise<void>

// Delete entry
async delete(id: string): Promise<void>

// Delete by filter
async deleteWhere(filters: Record<string, any>): Promise<number>

// Get stats
async getStats(): Promise<SemanticMemoryStats>

// Cleanup old entries
async cleanup(): Promise<void>

// Close connections
async close(): Promise<void>
```

**Data Structures:**

```typescript
interface SemanticMemoryEntry {
  id: string;
  type: SemanticMemoryType;
  owner: string;
  summary: string;
  details?: string;
  source: {
    type: 'system' | 'manual' | 'conversation';
    id?: string;
    timestamp: string;
    context?: any;
  };
  tags: string[];
  embedding: number[];         // 384-dim vector
  importance: number;          // 0.0-1.0
  created_at: string;
  last_used_at?: string;
  access_count: number;
  related_to?: string[];
  supersedes?: string[];
  valid_until?: string;
  confidence: number;
}

interface SemanticMemoryResult {
  entry: SemanticMemoryEntry;
  score: number;               // Cosine similarity (0.0-1.0)
  similarity: number;          // Alias for score
}

interface SemanticMemoryStats {
  totalEntries: number;
  byType: Record<string, number>;
  avgImportance: number;
  avgAccessCount: number;
  dbSizeBytes: number;
}

type SemanticMemoryType =
  | 'fact'
  | 'preference'
  | 'milestone'
  | 'skill'
  | 'relationship'
  | 'context';
```

---

## 🧩 SUB-MODULES

### Backend: SQLite Vector Store (vector_store_api.rs)

**Purpose:** Persistent vector storage with SQL queries

**Key Components:**

- **Database Schema**: 16-column table (id, tier, type, summary, details, embedding, metadata, timestamps)
- **Indexing**: 5 indexes (tier, type, owner, importance, created_at) for fast filtering
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **Serialization**: f32[] → BLOB (ndarray for efficient storage)
- **Connection Pooling**: Arc<RwLock<Connection>> for thread-safe access

**Performance Optimizations:**

- `PRAGMA journal_mode = WAL` — Better write concurrency
- `PRAGMA synchronous = NORMAL` — Faster writes (acceptable durability)
- `PRAGMA cache_size = -64000` — 64MB cache (faster reads)
- Prepared statements — SQL query reuse
- Batch operations — Reduce transaction overhead

### Backend: In-Memory Vector Store (vector_store.rs)

**Purpose:** Fast in-memory vector search (Memory OS integration)

**Key Components:**

- **HashMap Storage**: `HashMap<Uuid, VectorEntry>` for O(1) lookups
- **Normalization**: Pre-normalize vectors for faster cosine similarity
- **Linear Search**: Iterate all vectors, compute similarity, sort (sufficient for <10K)
- **Async Operations**: RwLock for concurrent read access
- **Metadata**: Content preview, importance, timestamp, tags

**Search Algorithm:**

```rust
1. Normalize query vector
2. Read lock vectors HashMap
3. For each vector:
   a. Compute cosine_similarity(query, vector)
   b. Create SearchResult { id, similarity, metadata }
4. Sort results by similarity DESC
5. Filter by threshold (if specified)
6. Take top-k results
7. Return Vec<VectorSearchResult>

Time Complexity: O(n * d) where n=vectors, d=dimensions (384)
Space Complexity: O(n) for results array
```

### Frontend: Tauri Adapter (TauriVectorStore.ts)

**Purpose:** Bridge frontend semantic memory to backend vector store

**Key Components:**

- **Tauri Commands**: `invoke()` calls to backend Rust commands
- **Type Conversion**: SemanticMemoryEntry ↔ VectorEntry mapping
- **Fallback Mode**: In-memory vector store for non-Tauri environments
- **Error Handling**: Graceful degradation if backend unavailable
- **Stats Tracking**: Track total entries, access counts, importance averages

**Type Conversion:**

```typescript
// Frontend → Backend
toVectorEntry(entry: SemanticMemoryEntry): VectorEntry {
  return {
    id: entry.id,
    tier: 'LONG_TERM',
    type: entry.type,
    summary: entry.summary,
    details: entry.details,
    embedding: entry.embedding,
    owner: entry.owner,
    tags: entry.tags,
    source_type: entry.source.type,
    source_id: entry.source.id,
    source_timestamp: new Date(entry.source.timestamp).getTime(),
    importance: entry.importance,
    access_count: entry.access_count,
    created_at: new Date(entry.created_at).getTime(),
    updated_at: Date.now(),
    last_accessed: entry.last_used_at ? new Date(entry.last_used_at).getTime() : Date.now(),
  };
}

// Backend → Frontend
fromVectorEntry(entry: VectorEntry): SemanticMemoryEntry {
  return {
    id: entry.id,
    type: entry.type as SemanticMemoryType,
    owner: entry.owner,
    summary: entry.summary,
    details: entry.details,
    source: {
      type: entry.source_type,
      id: entry.source_id,
      timestamp: new Date(entry.source_timestamp).toISOString(),
    },
    tags: entry.tags,
    embedding: entry.embedding,
    importance: entry.importance,
    created_at: new Date(entry.created_at).toISOString(),
    last_used_at: entry.last_accessed ? new Date(entry.last_accessed).toISOString() : undefined,
    access_count: entry.access_count,
    confidence: entry.importance,
  };
}
```

---

## 📊 DATA STRUCTURES

### Embedding Vectors

**Dimensions:** 384 (sentence-transformers standard)

**Model:** `all-MiniLM-L6-v2` (Transformers.js compatible)

**Format:**
- Backend: `Vec<f32>` (Rust)
- Frontend: `number[]` (TypeScript)
- Storage: `BLOB` (SQLite, serialized f32[])

**Normalization:**
- Vectors normalized to unit length (L2 norm = 1.0)
- Enables faster cosine similarity (dot product only)

**Example:**
```
Original: [0.5, -0.3, 0.8, ..., 0.2]
Normalized: [0.408, -0.245, 0.653, ..., 0.163]
```

### Memory Tiers

**Enum:**
```rust
pub enum MemoryTier {
    SHORT_TERM,    // STM - Recent (buffer, <1ms access)
    MEDIUM_TERM,   // MTM - Important recent (~10ms access)
    LONG_TERM,     // LTM - Permanent (~50-100ms access)
    META_MEMORY,   // Meta - Self-knowledge, patterns
}
```

**Usage:** Filter vectors by tier for relevance (e.g., LTM for long-term facts)

### Search Scoring

**Cosine Similarity:**
```
score = dot(query, vector) / (||query|| * ||vector||)
      = ∑(query[i] * vector[i]) / (√∑query[i]² * √∑vector[i]²)
      = value in range [-1.0, 1.0]

For normalized vectors:
score = dot(query, vector)  // Just dot product
```

**Interpretation:**
- `1.0`: Identical vectors (perfect match)
- `0.7-1.0`: Very similar (high relevance)
- `0.5-0.7`: Moderately similar (medium relevance)
- `0.0-0.5`: Low similarity (low relevance)
- `<0.0`: Opposite direction (not relevant)

**Default Threshold:** `0.5` (filter out low-relevance results)

---

## 🧪 TESTING

### Backend Unit Tests (Rust)

**Test Coverage:**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vector_store_new() {
        let store = VectorStore::new();
        assert_eq!(store.dim, 384);
    }

    #[tokio::test]
    async fn test_vector_insert_and_search() {
        let store = VectorStore::new();
        
        // Insert test entries
        for i in 0..5 {
            let entry = MemoryEntry::new(
                format!("Entry {}", i),
                0.5,
                MemoryType::Conversation
            ).with_embedding(create_test_embedding(i as f32));
            
            store.insert(&entry).await.ok();
        }
        
        // Search with similar vector
        let query = create_test_embedding(2.5);
        let results = store.search(&query, 3).await;
        
        assert_eq!(results.len(), 3);
        assert!(results[0].similarity >= results[1].similarity);
        assert!(results[1].similarity >= results[2].similarity);
    }

    #[tokio::test]
    async fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let similarity = cosine_similarity(&a, &b);
        assert!((similarity - 1.0).abs() < 0.001);
        
        let c = vec![0.0, 1.0, 0.0];
        let similarity_orthogonal = cosine_similarity(&a, &c);
        assert!(similarity_orthogonal.abs() < 0.001);
    }

    #[tokio::test]
    async fn test_vector_store_threshold() {
        let store = VectorStore::new();
        
        // Insert entries with varying similarity
        // Query with threshold 0.7
        let results = store.search_threshold(&query, 0.7, 10).await;
        
        // Assert all results above threshold
        for result in results {
            assert!(result.similarity >= 0.7);
        }
    }
}
```

### Frontend Unit Tests (TypeScript)

**Test Coverage:**

```typescript
describe('TauriVectorStore', () => {
  let store: TauriVectorStore;

  beforeEach(async () => {
    store = new TauriVectorStore({
      dbPath: './test.db',
      collectionName: 'test_vectors',
      dimensions: 384,
    });
    await store.initialize();
  });

  test('should insert and retrieve entry', async () => {
    const entry: SemanticMemoryEntry = {
      id: 'test-1',
      type: 'fact',
      owner: 'system',
      summary: 'Test fact',
      embedding: new Array(384).fill(0.1),
      importance: 0.8,
      // ... other fields
    };

    await store.add(entry);
    const retrieved = await store.get('test-1');

    expect(retrieved).toBeDefined();
    expect(retrieved!.summary).toBe('Test fact');
  });

  test('should search by similarity', async () => {
    // Insert test entries
    await store.addBatch([entry1, entry2, entry3]);

    // Search
    const queryEmbedding = new Array(384).fill(0.1);
    const results = await store.search(queryEmbedding, 5);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  test('should filter by tier', async () => {
    const results = await store.search(queryEmbedding, 10, {
      tiers: ['LONG_TERM'],
    });

    results.forEach(result => {
      // Verify tier filtering
    });
  });
});
```

### Integration Tests

**Scenario: Semantic Memory Recall**

```typescript
// 1. Store user preferences
const preferences = [
  { summary: 'User prefers dark mode', type: 'preference', importance: 0.9 },
  { summary: 'User likes animations', type: 'preference', importance: 0.7 },
  { summary: 'User timezone: UTC-5', type: 'fact', importance: 0.8 },
];

for (const pref of preferences) {
  const embedding = await embedText(pref.summary);
  await vectorStore.add({
    ...pref,
    id: generateId(),
    owner: 'user-123',
    embedding,
    // ... other fields
  });
}

// 2. Recall preferences about UI
const query = 'What are the user UI preferences?';
const queryEmbedding = await embedText(query);
const results = await vectorStore.search(queryEmbedding, 3);

// 3. Verify relevance
expect(results[0].entry.summary).toContain('dark mode');
expect(results[1].entry.summary).toContain('animations');
```

---

## ⚡ PERFORMANCE

### Latency Benchmarks

**SQLite Backend (Persistent):**
- Insert: ~1-3ms (single), ~0.5ms/entry (batch 100)
- Search: ~5-10ms (1K vectors), ~20-30ms (10K vectors)
- Get by ID: ~1-2ms (indexed)
- Stats: ~10-15ms (aggregation queries)

**In-Memory Backend (Memory OS):**
- Insert: <1ms (HashMap insert)
- Search: ~3-5ms (1K vectors), ~10-15ms (10K vectors)
- Get by ID: <1ms (HashMap lookup)
- Count: <1ms (HashMap len)

**Frontend Overhead:**
- Tauri command invoke: ~2-5ms
- Type conversion: <1ms
- Total frontend → backend → frontend: ~10-20ms

**Embedding Generation (Frontend):**
- Transformers.js (all-MiniLM-L6-v2): ~50-150ms/text (CPU)
- Cached embeddings: <1ms (no re-computation)

### Optimization Strategies

**Database Optimizations:**
- **Indexes**: 5 indexes for fast filtering (tier, type, owner, importance, created_at)
- **WAL Mode**: Concurrent reads + writes
- **Prepared Statements**: SQL query caching
- **Batch Inserts**: Transaction batching (100 entries → 1 transaction)
- **Cache Size**: 64MB for hot data

**Search Optimizations:**
- **Normalized Vectors**: Pre-normalize embeddings (dot product only, no division)
- **Early Termination**: Stop if max results reached (future)
- **Filtering**: Apply tier/type filters before similarity computation
- **Parallel Computation**: Multi-threaded similarity (future with rayon)

**Future Upgrades (>100K vectors):**
- **HNSW Index**: Hierarchical Navigable Small World (~10x faster search)
- **IVF Index**: Inverted File Index (clustering-based search)
- **Quantization**: Reduce f32 → int8 (4x memory reduction)
- **GPU Acceleration**: CUDA for similarity computation

### Memory Usage

**Per Vector:**
- Embedding: 384 * 4 bytes = 1,536 bytes (~1.5KB)
- Metadata: ~500 bytes (strings, timestamps)
- Total: ~2KB/vector

**Storage Estimates:**
- 1K vectors: ~2MB
- 10K vectors: ~20MB
- 100K vectors: ~200MB
- SQLite overhead: +20-30%

**In-Memory Limits:**
- Max vectors (64-bit): ~10M (limited by RAM)
- Practical limit: 100K-1M (search performance degradation)

---

## 🔗 INTEGRATIONS

### UnifiedMemory (Backend)

**Integration Point:** STM/MTM/LTM consolidation

```rust
// Store memory entry in vector store
impl UnifiedMemoryEngine {
    pub async fn store(&mut self, entry: MemoryEntry) -> Result<(), MemoryError> {
        // ... memory tier logic ...
        
        // Index in vector store for semantic search
        if entry.embedding.is_some() {
            self.vector_store.insert(&entry).await?;
        }
        
        Ok(())
    }

    pub async fn recall(&self, query: &str, k: usize) -> Vec<MemoryEntry> {
        // Generate query embedding
        let query_embedding = self.embedding_engine.embed(query).await?;
        
        // Semantic search via vector store
        let results = self.vector_store.search(&query_embedding, k).await;
        
        // Convert to MemoryEntry
        results.into_iter()
            .map(|r| self.get_memory_by_id(r.id))
            .filter_map(|m| m)
            .collect()
    }
}
```

### SemanticMemoryEngine (Frontend)

**Integration Point:** Cognitive Orchestrator semantic memory

```typescript
// SemanticMemoryEngine uses TauriVectorStore
class SemanticMemoryEngine {
  private vectorStore: VectorStore;
  
  async store(content: string, metadata: any): Promise<string> {
    // Generate embedding
    const embedding = await this.embedText(content);
    
    // Create entry
    const entry: SemanticMemoryEntry = {
      id: generateId(),
      type: metadata.type || 'fact',
      summary: content,
      embedding,
      importance: metadata.importance || 0.5,
      // ... other fields
    };
    
    // Store in vector store
    await this.vectorStore.add(entry);
    
    return entry.id;
  }
  
  async recall(query: string, limit: number = 5): Promise<SemanticMemoryEntry[]> {
    // Generate query embedding
    const queryEmbedding = await this.embedText(query);
    
    // Search vector store
    const results = await this.vectorStore.search(queryEmbedding, limit);
    
    // Update access counts
    for (const result of results) {
      await this.vectorStore.update(result.entry.id, {
        access_count: result.entry.access_count + 1,
        last_used_at: new Date().toISOString(),
      });
    }
    
    return results.map(r => r.entry);
  }
}
```

### OMEGA Pipeline (Backend)

**Integration Point:** Stage 2 (Context Recall)

```rust
// OMEGA uses vector store for context retrieval
impl OmegaPipeline {
    async fn stage_2_recall_context(&self, input: &str) -> Vec<MemoryEntry> {
        // Generate embedding from input
        let embedding = self.embedding_engine.embed(input).await?;
        
        // Semantic search via vector store
        let results = self.memory.vector_store.search(&embedding, 5).await;
        
        // Filter by relevance threshold
        results.into_iter()
            .filter(|r| r.similarity > 0.7)
            .map(|r| r.into_memory_entry())
            .collect()
    }
}
```

### Singularity (Backend)

**Integration Point:** Meta-processing memory persistence

```rust
// Singularity stores meta-cognitive patterns
impl SingularityState {
    pub async fn store_pattern(&mut self, pattern: CognitivePattern) {
        let embedding = self.embed_pattern(&pattern).await?;
        
        let entry = MemoryEntry::new(
            pattern.description,
            1.0, // High importance for meta-patterns
            MemoryType::MetaMemory,
        ).with_embedding(embedding);
        
        self.vector_store.insert(&entry).await?;
    }
    
    pub async fn recall_similar_patterns(&self, current: &CognitivePattern, k: usize) -> Vec<CognitivePattern> {
        let query_embedding = self.embed_pattern(current).await?;
        
        let results = self.vector_store.search_threshold(&query_embedding, 0.8, k).await;
        
        results.into_iter()
            .map(|r| self.parse_pattern(r.metadata))
            .collect()
    }
}
```

---

## 📚 CODE EXAMPLES

### Example 1: Backend SQLite Vector Store

```rust
use crate::api::vector_store_api::{VectorStore, VectorStoreConfig, VectorEntry, SearchOptions};

#[tokio::main]
async fn main() -> Result<(), String> {
    // 1. Initialize vector store
    let config = VectorStoreConfig {
        db_path: "./data/vectors.db".to_string(),
        table_name: "semantic_memory".to_string(),
        dimensions: 384,
    };
    
    let store = VectorStore::new(config)?;
    
    // 2. Insert entries
    let entry1 = VectorEntry {
        id: "fact-001".to_string(),
        tier: "LONG_TERM".to_string(),
        entry_type: "fact".to_string(),
        summary: "TITANE uses Rust for backend".to_string(),
        details: Some("Backend is built with Tauri + Rust for performance".to_string()),
        embedding: vec![0.1; 384], // Example embedding
        owner: "system".to_string(),
        tags: vec!["architecture".to_string(), "backend".to_string()],
        source_type: "system".to_string(),
        source_id: None,
        source_timestamp: chrono::Utc::now().timestamp(),
        importance: 0.9,
        access_count: 0,
        created_at: chrono::Utc::now().timestamp(),
        updated_at: chrono::Utc::now().timestamp(),
        last_accessed: chrono::Utc::now().timestamp(),
    };
    
    store.insert(&entry1)?;
    
    // 3. Search by similarity
    let query_embedding = vec![0.15; 384]; // Similar to entry1
    
    let options = SearchOptions {
        top_k: Some(5),
        min_score: Some(0.7),
        tier_filter: Some(vec!["LONG_TERM".to_string()]),
        type_filter: None,
        owner_filter: None,
    };
    
    let results = store.search(&query_embedding, options)?;
    
    for (i, result) in results.iter().enumerate() {
        println!(
            "Result {}: {} (score: {:.3})",
            i + 1,
            result.entry.summary,
            result.score
        );
    }
    
    // 4. Get stats
    let stats = store.get_stats()?;
    println!("Total entries: {}", stats.total_entries);
    println!("Avg importance: {:.2}", stats.avg_importance);
    
    Ok(())
}
```

### Example 2: Backend In-Memory Vector Store

```rust
use crate::memory_os::vector_store::{VectorStore, VectorSearchResult};
use crate::memory_os::memory_state::{MemoryEntry, MemoryType};

#[tokio::main]
async fn main() {
    // 1. Create vector store
    let store = VectorStore::new(); // Default 384-dim
    
    // 2. Insert memory entries
    let entry1 = MemoryEntry::new(
        "User prefers dark theme".to_string(),
        0.8,
        MemoryType::Preference,
    ).with_embedding(vec![0.2; 384]);
    
    let entry2 = MemoryEntry::new(
        "User timezone: UTC-5".to_string(),
        0.9,
        MemoryType::Fact,
    ).with_embedding(vec![0.1; 384]);
    
    store.insert(&entry1).await.expect("Insert failed");
    store.insert(&entry2).await.expect("Insert failed");
    
    // 3. Search
    let query = vec![0.25; 384]; // Similar to dark theme
    let results = store.search(&query, 3).await;
    
    for result in results {
        println!(
            "Found: {} (similarity: {:.3})",
            result.metadata.content_preview,
            result.similarity
        );
    }
    
    // 4. Count
    let count = store.count().await;
    println!("Total vectors: {}", count);
}
```

### Example 3: Frontend Tauri Vector Store

```typescript
import { TauriVectorStore } from '@/services/cognitive/TauriVectorStore';
import type { SemanticMemoryEntry } from '@/services/cognitive/semanticMemory.types';

async function main() {
  // 1. Initialize store
  const store = new TauriVectorStore({
    dbPath: './data/semantic_memory.db',
    collectionName: 'user_memories',
    dimensions: 384,
  });
  
  await store.initialize();
  
  // 2. Add memory
  const entry: SemanticMemoryEntry = {
    id: 'pref-001',
    type: 'preference',
    owner: 'user-123',
    summary: 'User prefers minimal animations',
    details: 'Reduce motion for better UX',
    source: {
      type: 'conversation',
      timestamp: new Date().toISOString(),
    },
    tags: ['ui', 'accessibility'],
    embedding: new Array(384).fill(0.3), // Generated by Transformers.js
    importance: 0.8,
    created_at: new Date().toISOString(),
    access_count: 0,
    confidence: 0.8,
  };
  
  await store.add(entry);
  
  // 3. Search
  const queryEmbedding = new Array(384).fill(0.35); // Similar to minimal animations
  const results = await store.search(queryEmbedding, 5, {
    minScore: 0.7,
    types: ['preference'],
  });
  
  console.log('Search results:');
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.entry.summary} (score: ${result.score.toFixed(3)})`);
  });
  
  // 4. Get stats
  const stats = await store.getStats();
  console.log(`Total entries: ${stats.totalEntries}`);
  console.log(`Avg importance: ${stats.avgImportance.toFixed(2)}`);
}

main().catch(console.error);
```

### Example 4: Semantic Memory Integration

```typescript
import { SemanticMemoryEngine } from '@/services/cognitive/semanticMemoryEngine';

async function demonstrateSemanticMemory() {
  const semanticMemory = new SemanticMemoryEngine();
  await semanticMemory.initialize();
  
  // Store facts
  await semanticMemory.store('TITANE uses React for frontend', {
    type: 'fact',
    importance: 0.9,
    tags: ['architecture', 'frontend'],
  });
  
  await semanticMemory.store('React components use TypeScript', {
    type: 'fact',
    importance: 0.8,
    tags: ['typescript', 'frontend'],
  });
  
  // Recall related facts
  const query = 'What frontend technology does TITANE use?';
  const memories = await semanticMemory.recall(query, 3);
  
  console.log('Recalled memories:');
  memories.forEach(memory => {
    console.log(`- ${memory.summary} (importance: ${memory.importance})`);
  });
}
```

---

## 🎯 CROSS-REFERENCES

### Related Modules

- [UNIFIED_MEMORY.md](UNIFIED_MEMORY.md) — 3-layer memory architecture (STM/MTM/LTM)
- [COGNITIVE_ORCHESTRATOR.md](../frontend/COGNITIVE_ORCHESTRATOR.md) — SemanticMemoryEngine integration
- [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md) — Stage 2 context recall
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive pattern storage

### Related Documentation

- [ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md) — System architecture
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Data flow diagrams
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Tauri command API

---

## 📌 NOTES

**Design Decisions:**

1. **Why SQLite?** — Mature, embedded, zero-config, excellent for <1M vectors
2. **Why Linear Search?** — Simple, sufficient for <10K vectors, easy to upgrade to HNSW
3. **Why 384-dim?** — Sentence-transformers standard, good tradeoff (accuracy vs speed)
4. **Why Cosine Similarity?** — Robust to vector magnitude, widely used for text embeddings

**Future Improvements:**

- **HNSW Index** — For >100K vectors (~10x search speedup)
- **Batch Embedding** — GPU-accelerated embedding generation
- **Compression** — Quantization (f32 → int8) for 4x memory reduction
- **Hybrid Search** — Combine lexical (BM25) + semantic (vector) search
- **Multi-Modal** — Image/audio embeddings (CLIP, Wav2Vec)

**Known Limitations:**

- **Scalability**: Linear search degrades >10K vectors (HNSW upgrade needed)
- **Embedding Quality**: Depends on model (all-MiniLM-L6-v2 is general-purpose, not domain-specific)
- **No Incremental Updates**: Vectors immutable (delete + re-insert to update embedding)
- **No Clustering**: No automatic clustering/grouping (manual tier/type filtering only)

---

**Documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ

---

_Vector Store — Semantic search foundation_ 🔍✨
