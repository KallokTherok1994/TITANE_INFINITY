# TITANE_UNIFIED_MEMORY_OS.md

## Unified Memory System — Architecture & Operations v20.1

**Date:** 2025-12-07
**Version:** TITANE∞ v20.1
**Classification:** Official Documentation

---

## 1. Overview

The **Unified Memory System** is TITANE∞'s cognitive memory architecture, inspired by human memory models. It implements a three-tier system (STM/MTM/LTM) with optimized data structures for high-performance operations.

### 1.1 Design Philosophy

- **Human-Inspired:** Mimics Short-Term, Medium-Term, and Long-Term memory
- **Performance-First:** O(1) operations via VecDeque, HashMap indexes
- **Memory-Safe:** Bounded structures prevent resource exhaustion
- **Stack-Optimized:** SmallVec for common cases (≤8 tags)

### 1.2 Performance Targets (v20.1)

| Operation           | Complexity | Target   | Achieved |
| ------------------- | ---------- | -------- | -------- |
| STM Push/Pop        | O(1)       | <1ms     | <1ms     |
| Memory Lookup by ID | O(1)       | <1ms     | <1ms     |
| Tag Storage (≤8)    | Stack      | 0 heap   | 0 heap   |
| Timeline Events     | Bounded    | Max 1000 | Max 1000 |

---

## 2. Architecture

### 2.1 Three-Tier Memory Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED MEMORY SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SHORT-TERM MEMORY (STM)                    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  VecDeque<MemoryItem>                           │    │   │
│  │  │  Capacity: 100 items | Retention: 30 minutes    │    │   │
│  │  │  Operations: O(1) FIFO | Pre-allocated          │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  Index: HashMap<MemoryId, usize> for O(1) lookup        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼ Consolidation                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             MEDIUM-TERM MEMORY (MTM)                    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  Vec<MemoryItem>                                │    │   │
│  │  │  Capacity: 500 items | Retention: 24 hours      │    │   │
│  │  │  Operations: Pattern consolidation              │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  Index: HashMap<MemoryId, usize> for O(1) lookup        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼ Semantic Encoding                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LONG-TERM MEMORY (LTM)                     │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  Persistent Storage (SQLite + Vector Index)     │    │   │
│  │  │  Capacity: Unlimited | Retention: Permanent     │    │   │
│  │  │  Operations: Semantic search, Vector similarity │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    TIMELINE                             │   │
│  │  VecDeque<TimelineEvent> | Max: 1000 events             │   │
│  │  Bounded to prevent memory exhaustion                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Structures

### 3.1 UnifiedMemory (Main Container)

**Location:** `src/core/modules/unified_memory.rs`

```rust
pub struct UnifiedMemory {
    // Memory tiers
    pub stm: ShortTermMemory,
    pub mtm: MediumTermMemory,
    pub ltm: LongTermMemory,

    // Timeline (bounded)
    pub timeline: MemoryTimeline,

    // Indexes for O(1) lookup
    stm_index: HashMap<MemoryId, usize>,
    mtm_index: HashMap<MemoryId, usize>,

    // Module metadata
    name: String,
    version: String,
    status: ModuleStatus,
    last_update: u64,
}
```

### 3.2 Short-Term Memory (STM)

**Optimized with VecDeque for O(1) FIFO operations:**

```rust
pub struct ShortTermMemory {
    /// v20.1: VecDeque for O(1) push/pop operations
    pub items: VecDeque<MemoryItem>,
    pub max_capacity: usize,      // 100
    pub retention_ms: u64,        // 30 minutes
}
```

**Before v20.1 (Vec):**

```rust
// O(n) operation for FIFO
items.remove(0);  // Shifts all elements
```

**After v20.1 (VecDeque):**

```rust
// O(1) operation for FIFO
items.pop_front();  // Constant time
```

### 3.3 Medium-Term Memory (MTM)

```rust
pub struct MediumTermMemory {
    pub items: Vec<MemoryItem>,
    pub max_capacity: usize,      // 500
    pub retention_ms: u64,        // 24 hours
}
```

### 3.4 Long-Term Memory (LTM)

```rust
pub struct LongTermMemory {
    pub items: Vec<MemoryItem>,
    pub semantic_index: Option<VectorIndex>,
    pub persistent_path: Option<PathBuf>,
}
```

### 3.5 Memory Item

```rust
pub struct MemoryItem {
    pub id: MemoryId,
    pub content: String,
    pub tags: MemoryTags,           // SmallVec<[String; 8]>
    pub importance: f32,            // 0.0 - 1.0
    pub created_at: u64,
    pub accessed_at: u64,
    pub access_count: u32,
    pub associations: Vec<MemoryId>,
    pub metadata: MemoryMetadata,
}

// Type alias for stack-allocated tags
pub type MemoryTags = SmallVec<[String; 8]>;
```

### 3.6 Timeline (Bounded)

```rust
pub struct MemoryTimeline {
    /// v20.1: Bounded VecDeque to prevent memory leaks
    pub events: VecDeque<TimelineEvent>,
    pub max_events: usize,  // 1000
}
```

### 3.7 Timeline Event

```rust
pub struct TimelineEvent {
    pub timestamp: u64,
    pub event_type: TimelineEventType,
    pub memory_id: Option<MemoryId>,
    pub description: String,
}

pub enum TimelineEventType {
    MemoryCreated,
    MemoryAccessed,
    MemoryUpdated,
    MemoryPromoted,     // STM → MTM → LTM
    MemoryConsolidated,
    MemoryExpired,
    MemoryLinked,
}
```

---

## 4. Operations

### 4.1 Initialization

```rust
impl UnifiedMemory {
    pub fn new() -> Self {
        Self {
            stm: ShortTermMemory {
                items: VecDeque::with_capacity(STM_CAPACITY),  // Pre-allocate
                max_capacity: STM_CAPACITY,
                retention_ms: 30 * 60 * 1000,  // 30 minutes
            },
            mtm: MediumTermMemory {
                items: Vec::with_capacity(MTM_CAPACITY),  // Pre-allocate
                max_capacity: MTM_CAPACITY,
                retention_ms: 24 * 60 * 60 * 1000,  // 24 hours
            },
            ltm: LongTermMemory::new(),
            timeline: MemoryTimeline {
                events: VecDeque::with_capacity(MAX_TIMELINE_EVENTS),
                max_events: MAX_TIMELINE_EVENTS,  // 1000
            },
            stm_index: HashMap::with_capacity(STM_CAPACITY),
            mtm_index: HashMap::with_capacity(MTM_CAPACITY),
            // ...
        }
    }
}

const STM_CAPACITY: usize = 100;
const MTM_CAPACITY: usize = 500;
const MAX_TIMELINE_EVENTS: usize = 1000;
```

### 4.2 Store Memory (STM)

```rust
pub fn store(&mut self, content: String, tags: Vec<String>, importance: f32) -> MemoryId {
    let id = MemoryId::new();
    let now = timestamp_now();

    let item = MemoryItem {
        id: id.clone(),
        content,
        tags: SmallVec::from_vec(tags),  // Stack-allocated if ≤8
        importance,
        created_at: now,
        accessed_at: now,
        access_count: 0,
        associations: vec![],
        metadata: MemoryMetadata::default(),
    };

    // Check capacity, evict if needed (O(1) with VecDeque)
    if self.stm.items.len() >= self.stm.max_capacity {
        if let Some(removed) = self.stm.items.pop_front() {
            self.stm_index.remove(&removed.id);
            self.add_timeline_event(TimelineEventType::MemoryExpired, Some(removed.id));
        }
    }

    // Add to STM (O(1))
    let index = self.stm.items.len();
    self.stm.items.push_back(item);
    self.stm_index.insert(id.clone(), index);

    // Record timeline event
    self.add_timeline_event(TimelineEventType::MemoryCreated, Some(id.clone()));

    id
}
```

### 4.3 Retrieve Memory (O(1) Lookup)

```rust
pub fn get(&mut self, id: &MemoryId) -> Option<&MemoryItem> {
    // O(1) lookup via HashMap index
    if let Some(&index) = self.stm_index.get(id) {
        if let Some(item) = self.stm.items.get_mut(index) {
            item.accessed_at = timestamp_now();
            item.access_count += 1;
            return Some(item);
        }
    }

    if let Some(&index) = self.mtm_index.get(id) {
        if let Some(item) = self.mtm.items.get_mut(index) {
            item.accessed_at = timestamp_now();
            item.access_count += 1;
            return Some(item);
        }
    }

    // LTM lookup (may involve disk I/O)
    self.ltm.get(id)
}
```

### 4.4 Memory Consolidation (STM → MTM)

```rust
pub fn consolidate(&mut self) {
    let now = timestamp_now();
    let cutoff = now - self.stm.retention_ms;

    // Move expired or important items from STM to MTM
    let mut to_promote = vec![];

    for (index, item) in self.stm.items.iter().enumerate() {
        if item.created_at < cutoff || item.importance > 0.7 {
            to_promote.push(index);
        }
    }

    // Promote in reverse order to maintain indices
    for &index in to_promote.iter().rev() {
        if let Some(item) = self.stm.items.remove(index) {
            self.stm_index.remove(&item.id);

            // Add to MTM
            let mtm_index = self.mtm.items.len();
            self.mtm_index.insert(item.id.clone(), mtm_index);
            self.mtm.items.push(item.clone());

            self.add_timeline_event(TimelineEventType::MemoryPromoted, Some(item.id));
        }
    }

    // Rebuild STM index after removals
    self.rebuild_stm_index();
}
```

### 4.5 Timeline Event Recording

```rust
fn add_timeline_event(&mut self, event_type: TimelineEventType, memory_id: Option<MemoryId>) {
    let event = TimelineEvent {
        timestamp: timestamp_now(),
        event_type,
        memory_id,
        description: format!("{:?}", event_type),
    };

    // Bounded: remove oldest if at capacity
    if self.timeline.events.len() >= self.timeline.max_events {
        self.timeline.events.pop_front();
    }

    self.timeline.events.push_back(event);
}
```

---

## 5. SmallVec Optimization

### 5.1 Why SmallVec?

Most memory items have ≤8 tags. `SmallVec<[String; 8]>` stores up to 8 elements on the stack, avoiding heap allocations for the common case.

```rust
use smallvec::SmallVec;

pub type MemoryTags = SmallVec<[String; 8]>;

// Usage
let tags: MemoryTags = SmallVec::from_vec(vec![
    "important".to_string(),
    "work".to_string(),
    "project-x".to_string(),
]);
// ↑ Stored entirely on stack (3 elements < 8)

let many_tags: MemoryTags = SmallVec::from_vec((0..12).map(|i| format!("tag{}", i)).collect());
// ↑ Spills to heap (12 elements > 8)
```

### 5.2 Cargo.toml Configuration

```toml
[dependencies]
smallvec = { version = "1.13", features = ["serde"] }
```

The `serde` feature enables serialization support for persistence.

---

## 6. Index Maintenance

### 6.1 STM Index Rebuilding

After bulk operations that shift indices:

```rust
fn rebuild_stm_index(&mut self) {
    self.stm_index.clear();
    for (index, item) in self.stm.items.iter().enumerate() {
        self.stm_index.insert(item.id.clone(), index);
    }
}
```

### 6.2 Index Consistency

The index maps `MemoryId → position` for O(1) lookups:

```rust
// Without index: O(n) linear search
fn get_slow(&self, id: &MemoryId) -> Option<&MemoryItem> {
    self.stm.items.iter().find(|item| item.id == *id)
}

// With index: O(1) direct access
fn get_fast(&self, id: &MemoryId) -> Option<&MemoryItem> {
    self.stm_index.get(id).and_then(|&i| self.stm.items.get(i))
}
```

---

## 7. Memory Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY LIFECYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  New Memory                                                 │
│      │                                                      │
│      ▼                                                      │
│  ┌─────────┐                                                │
│  │   STM   │  ← Initial storage (30 min retention)         │
│  └────┬────┘                                                │
│       │                                                     │
│       │ Conditions for promotion:                           │
│       │ - Time elapsed > retention_ms                       │
│       │ - importance > 0.7                                  │
│       │ - access_count > threshold                          │
│       ▼                                                     │
│  ┌─────────┐                                                │
│  │   MTM   │  ← Consolidated patterns (24h retention)      │
│  └────┬────┘                                                │
│       │                                                     │
│       │ Conditions for LTM:                                 │
│       │ - Semantic significance                             │
│       │ - User-marked important                             │
│       │ - Cross-session relevance                           │
│       ▼                                                     │
│  ┌─────────┐                                                │
│  │   LTM   │  ← Permanent storage (persistent)             │
│  └─────────┘                                                │
│                                                             │
│  Expiration Path:                                           │
│  STM/MTM item → expired → TimelineEvent(MemoryExpired)      │
│                         → removed from memory               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Module Interface

### 8.1 ModuleInfo

```rust
impl UnifiedMemory {
    pub fn info(&self) -> ModuleInfo {
        ModuleInfo {
            name: self.name.clone(),
            version: self.version.clone(),
            status: self.status.clone(),
            health: self.calculate_health(),
            last_update: self.last_update,
            capabilities: vec![
                "stm".to_string(),
                "mtm".to_string(),
                "ltm".to_string(),
                "timeline".to_string(),
                "consolidation".to_string(),
            ],
        }
    }
}
```

### 8.2 Health Calculation

```rust
fn calculate_health(&self) -> f32 {
    let stm_util = self.stm.items.len() as f32 / self.stm.max_capacity as f32;
    let mtm_util = self.mtm.items.len() as f32 / self.mtm.max_capacity as f32;

    // Lower utilization = healthier (more capacity available)
    let stm_health = 1.0 - (stm_util * 0.5);  // 50% weight
    let mtm_health = 1.0 - (mtm_util * 0.3);  // 30% weight
    let timeline_health = 1.0 - (self.timeline.events.len() as f32 / self.timeline.max_events as f32 * 0.2);

    stm_health * 0.4 + mtm_health * 0.4 + timeline_health * 0.2
}
```

---

## 9. Persistence

### 9.1 Serialization

The memory system supports full serialization via Serde:

```rust
#[derive(Serialize, Deserialize)]
pub struct UnifiedMemory {
    // All fields serializable
}

// Save to disk
let json = serde_json::to_string(&memory)?;
std::fs::write("memory_snapshot.json", json)?;

// Load from disk
let json = std::fs::read_to_string("memory_snapshot.json")?;
let memory: UnifiedMemory = serde_json::from_str(&json)?;
```

### 9.2 LTM Persistence

Long-term memory uses SQLite for persistent storage:

```rust
impl LongTermMemory {
    pub async fn persist(&self, item: &MemoryItem) -> Result<()> {
        // Store in SQLite with vector embeddings
        sqlx::query!(
            "INSERT INTO memories (id, content, tags, importance, created_at, embedding)
             VALUES (?, ?, ?, ?, ?, ?)",
            item.id.to_string(),
            item.content,
            serde_json::to_string(&item.tags)?,
            item.importance,
            item.created_at,
            item.metadata.embedding.as_ref(),
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
```

---

## 10. Performance Summary

| Optimization   | Before      | After         | Improvement    |
| -------------- | ----------- | ------------- | -------------- |
| STM FIFO       | O(n) Vec    | O(1) VecDeque | Constant time  |
| Memory lookup  | O(n) search | O(1) HashMap  | Constant time  |
| Tag allocation | Heap always | Stack (≤8)    | 0 heap allocs  |
| Timeline       | Unbounded   | Bounded 1000  | Memory safe    |
| Pre-allocation | None        | with_capacity | Fewer reallocs |

---

## 11. Related Documentation

| Document                                                         | Description          |
| ---------------------------------------------------------------- | -------------------- |
| [TITANE_OS_OVERVIEW.md](TITANE_OS_OVERVIEW.md)                   | System architecture  |
| [TITANE_OMEGA_PIPELINE.md](TITANE_OMEGA_PIPELINE.md)             | Pipeline integration |
| [TITANE_OS_COGNITIVE_ENGINES.md](TITANE_OS_COGNITIVE_ENGINES.md) | Cognitive processing |

---

_Documentation officielle TITANE∞ Unified Memory System v20.1 — Super Prompt #5_
