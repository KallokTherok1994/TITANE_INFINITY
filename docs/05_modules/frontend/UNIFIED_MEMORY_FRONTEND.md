# 🎭 UnifiedMemory (Frontend) — Module Documentation

**Module Path:** `src/services/unified/UnifiedMemory.ts`  
**Version:** v20.0 (Consolidation frontend memory)  
**Purpose:** Frontend unified memory service (STM/MTM/LTM coordination)  
**Language:** TypeScript  
**Architecture Role:** Frontend memory orchestration + backend bridge

---

## 🎯 MODULE OVERVIEW

**UnifiedMemory (Frontend)** est le service frontend qui orchestre la mémoire unifiée TITANE∞. Il agit comme bridge entre UI et backend Memory OS (Rust), gère le caching frontend, et fournit API simple pour recall/store operations.

### Responsibilities

- 🔄 **Memory Orchestration** — Coordinate frontend + backend memory operations
- 💾 **Backend Bridge** — Call Tauri commands (memory_store, memory_recall)
- ⚡ **Frontend Caching** — LRU cache pour reduce backend calls
- 🔍 **Semantic Search** — Recall memories via semantic similarity
- 📊 **Importance Calculation** — Auto-calculate importance scores
- 🧠 **Context Building** — Build memory context bundles pour AI injection
- 📈 **Stats & Monitoring** — Track memory usage, performance metrics

### Key Components

**Main Class:**
- `UnifiedMemory` — Singleton memory orchestrator

**Dependencies:**
- Backend Memory OS (via Tauri commands: `memory_store`, `memory_recall`, `memory_stats`)
- `secureInvoke` (`src/lib/security.ts`) — Secure Tauri invocation
- `logger` (`src/lib/logger.ts`) — Logging

**Integration Points:**
- ChatEngine (recall before AI, store after AI)
- Cognitive engines (semantic memory, consolidation)
- UI stores (memory store display, stats)

---

## 📊 ARCHITECTURE

### Memory Flow (Frontend ↔ Backend)

```
┌──────────────────────────────────────────────────────────────┐
│                    UI / ChatEngine                           │
│                  (Memory operations)                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ UNIFIEDMEMORY.recall(query, limit)                           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: CHECK FRONTEND CACHE (LRU)                          │
│ - Check if query in cache (last 1000 queries)                │
│ - Return cached results if fresh (<5 min)                    │
│ - Skip backend call if cache hit                             │
└──────────────────────────────────────────────────────────────┘
                            ↓ (cache miss)
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: BACKEND DISPATCH (Tauri command: memory_recall)     │
│ - Call Rust backend Memory OS                                │
│ - Execute semantic search (vector similarity)                │
│ - Retrieve from STM + MTM + LTM (parallel)                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: MEMORY OS (Rust)                                    │
│ (See UNIFIED_MEMORY.md backend doc)                          │
│ - Parallel search: STM (<1ms) + MTM (~10ms) + LTM (~50ms)    │
│ - Merge results, score by recency + importance + similarity  │
│ - Return top K results                                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: RESPONSE PROCESSING                                 │
│ - Receive backend results (MemoryEntry[])                    │
│ - Cache results (LRU, 5 min TTL)                             │
│ - Build MemoryContext bundle                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 4: RETURN TO CALLER                                    │
│ - Return MemoryEntry[] or MemoryContext                      │
│ - Update stats (recall count, latency)                       │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    UI / ChatEngine                           │
│                  (Store interaction)                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ UNIFIEDMEMORY.store(content, role, importance, ...)          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: ENTRY CONSTRUCTION                                  │
│ - Build MemoryEntry (content, role, importance, tags, etc.)  │
│ - Calculate importance if not provided (auto-scoring)        │
│ - Add timestamp, conversation_id                             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: BACKEND DISPATCH (Tauri command: memory_store)      │
│ - Call Rust backend Memory OS                                │
│ - Store to STM (immediate)                                   │
│ - Schedule consolidation (STM → MTM → LTM)                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: MEMORY OS (Rust)                                    │
│ - Store to STM buffer                                        │
│ - Generate vector embedding                                  │
│ - Index in vector store                                      │
│ - Return MemoryId                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: CACHE INVALIDATION                                  │
│ - Invalidate related cache entries (same conversation_id)    │
│ - Update stats (store count)                                 │
│ - Return MemoryId                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 API REFERENCE

### Main Class: `UnifiedMemory`

```typescript
export class UnifiedMemory {
  private cache: LRUCache<string, MemoryEntry[]>;
  private static instance: UnifiedMemory;
  
  // Singleton
  static getInstance(): UnifiedMemory;
}
```

### Core Methods

#### `recall(query: string, limit: number): Promise<MemoryEntry[]>`

**Purpose:** Recall memories semantically similar to query

**Parameters:**
- `query: string` — Search query (natural language)
- `limit: number` — Max results to return

**Returns:** `Promise<MemoryEntry[]>` — Scored and ranked memories

**Example:**
```typescript
import { unifiedMemory } from '@/services/unified/UnifiedMemory';

const memories = await unifiedMemory.recall("pipeline OMEGA architecture", 10);
console.log(`Found ${memories.length} memories`);

memories.forEach((mem) => {
  console.log(`- ${mem.content.substring(0, 100)}... (score: ${mem.score})`);
});
```

#### `store(content: string, role: MemoryRole, importance: number, conversationId?: string, tags?: string[]): Promise<UnifiedMemoryEntry>`

**Purpose:** Store new memory (interaction, observation, fact)

**Parameters:**
- `content: string` — Memory content (text)
- `role: MemoryRole` — 'user' | 'assistant' | 'system'
- `importance: number` — Importance score (0.0-1.0)
- `conversationId?: string` — Optional conversation grouping
- `tags?: string[]` — Optional tags for categorization

**Returns:** `Promise<UnifiedMemoryEntry>` — Stored memory with ID

**Example:**
```typescript
const memory = await unifiedMemory.store(
  "Le pipeline OMEGA a 10 étapes de traitement intelligent",
  'system',
  0.8, // high importance
  'conv_architecture_123',
  ['architecture', 'omega', 'pipeline']
);

console.log('Memory stored:', memory.id);
```

#### `getStats(): Promise<MemoryStats>`

**Purpose:** Get memory system statistics

**Returns:** `Promise<MemoryStats>` — Stats (STM/MTM/LTM counts, performance metrics)

**Example:**
```typescript
const stats = await unifiedMemory.getStats();
console.log('Memory stats:', {
  stm: stats.stm_count,
  mtm: stats.mtm_count,
  ltm: stats.ltm_count,
  total: stats.total_count,
});
```

#### `buildContext(memories: MemoryEntry[], query: string): MemoryContext`

**Purpose:** Build memory context bundle (pour AI injection)

**Parameters:**
- `memories: MemoryEntry[]` — Retrieved memories
- `query: string` — Original query

**Returns:** `MemoryContext` — Context bundle avec metadata

**Example:**
```typescript
const memories = await unifiedMemory.recall(userMessage, 10);
const context = unifiedMemory.buildContext(memories, userMessage);

// Inject into AI prompt
const promptWithContext = `
Context mémoire:
${context.memories.map(m => `- ${m.content}`).join('\n')}

User query: ${userMessage}
`;
```

---

## 💾 DATA STRUCTURES

### `UnifiedMemoryEntry`

```typescript
interface UnifiedMemoryEntry {
  /// Unique ID
  id: string;
  /// Memory content (text)
  content: string;
  /// Role (user, assistant, system)
  role: 'user' | 'assistant' | 'system';
  /// Importance score (0.0-1.0)
  importance: number;
  /// Conversation ID (grouping)
  conversationId?: string;
  /// Tags (categorization)
  tags: string[];
  /// Timestamp created
  timestamp: number;
  /// Last accessed timestamp
  lastAccessed: number;
  /// Access count
  accessCount: number;
  /// Current layer (STM, MTM, LTM)
  layer: 'STM' | 'MTM' | 'LTM';
  /// Similarity score (for recall results)
  score?: number;
}
```

### `MemoryContext`

```typescript
interface MemoryContext {
  /// Retrieved memories
  memories: UnifiedMemoryEntry[];
  /// Total count retrieved
  totalCount: number;
  /// Search query used
  query: string;
  /// Retrieval time (ms)
  retrievalTimeMs: number;
}
```

### `MemoryStats`

```typescript
interface MemoryStats {
  /// STM count
  stm_count: number;
  /// MTM count
  mtm_count: number;
  /// LTM count
  ltm_count: number;
  /// Total memories
  total_count: number;
  /// Average importance
  avg_importance: number;
  /// Performance metrics
  performance: {
    avg_recall_latency_ms: number;
    avg_store_latency_ms: number;
    cache_hit_rate: number;
  };
}
```

---

## 🔗 INTEGRATIONS

### ChatEngine Integration

**Flow:** ChatEngine → UnifiedMemory (recall → generate → store)

**Example:**
```typescript
// In ChatEngine
// Phase 1.2: Recall memories
const memories = await unifiedMemory.recall(userMessage, 10);
const context = unifiedMemory.buildContext(memories, userMessage);

// Phase 1.6: Store interaction
await unifiedMemory.store(
  `${userMessage}\n\n${aiResponse.content}`,
  'assistant',
  calculateImportance(config.mode, userMessage),
  conversationId,
  [config.mode, 'conversation']
);
```

### Backend Memory OS Integration

**Flow:** UnifiedMemory (Frontend) → Tauri commands → Memory OS (Backend Rust)

**Example:**
```typescript
// Recall: frontend → backend
const backendResults = await secureInvoke<MemoryEntry[]>('memory_recall', {
  query: query,
  limit: limit,
});

// Store: frontend → backend
const memoryId = await secureInvoke<string>('memory_store', {
  content: content,
  role: role,
  importance: importance,
  conversation_id: conversationId,
  tags: tags,
});
```

---

## 🧪 TESTING

### Unit Tests

**File:** `src/services/unified/__tests__/UnifiedMemory.test.ts`

```bash
# Run UnifiedMemory tests
npm run test UnifiedMemory

# Run with coverage
npm run test:coverage UnifiedMemory
```

**Key Test Cases:**
- `test_recall_basic` — Basic recall flow
- `test_recall_cache_hit` — Frontend cache hit
- `test_store_basic` — Basic store flow
- `test_importance_calculation` — Auto-importance scoring
- `test_context_building` — Memory context bundle construction
- `test_stats` — Stats retrieval

---

## 📚 RELATED DOCUMENTATION

**Backend:**
- [UNIFIED_MEMORY.md](../backend/UNIFIED_MEMORY.md) — Backend Memory OS (Rust)

**Frontend:**
- [CHAT_ENGINE.md](CHAT_ENGINE.md) — ChatEngine integration
- [COGNITIVE_ORCHESTRATOR.md](COGNITIVE_ORCHESTRATOR.md) — Cognitive engines

**Architecture:**
- [DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md) — Memory flow in chat
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Tauri memory commands

---

**Module documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ
