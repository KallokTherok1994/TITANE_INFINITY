# 🧠 Cognitive Orchestrator — Module Documentation

**Version:** v24.2.0 (vΩ.42)  
**Module Path:** `src/services/cognitive/cognitiveOmegaIntegration.ts`  
**Type:** Frontend (TypeScript)  
**Lines:** 796  
**Complexity:** ⭐⭐⭐⭐⭐ (Expert)

---

## 📋 MODULE OVERVIEW

### Purpose

Cognitive Orchestrator (CognitiveOmegaOrchestrator) est le **cerveau cognitif frontend** de TITANE∞. Il orchestre **4 moteurs cognitifs** qui enrichissent le pipeline OMEGA avec mémoire sémantique, cohérence multi-tours, évaluation qualité, et observabilité.

### Responsibilities

1. **Semantic Memory Management** — Long-term memory avec vector search (384-dim embeddings)
2. **Goal & Consistency Tracking** — Cohérence multi-tours, goal tracking, fact validation
3. **Conversation Evaluation** — Quality metrics, regression detection, baseline comparison
4. **Cognitive Observability** — Introspection, tracing, decision logging, debug panel

### Components

- **CognitiveOmegaOrchestrator** (class orchestration principale)
- **4 Cognitive Engines:**
  1. **SemanticMemoryEngine** (v∞.42) — Vector search, embeddings, memory storage
  2. **GoalConsistencyEngine** (v∞.42) — Multi-turn coherence, goal tracking, fact checking
  3. **ConversationEvaluationEngine** (v∞.42) — Quality scoring, regression detection
  4. **CognitiveObservabilityEngine** (v∞.42) — Tracing, decision logging, debug panel

---

## 🏗️ ARCHITECTURE

### Cognitive Orchestrator Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│                   CHAT ENGINE OMEGA v19.2Ω               │
│                  (Frontend AI Orchestration)             │
└──────────────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  COGNITIVE OMEGA ORCHESTRATOR vΩ.42              │
    │  (4 Cognitive Engines Integration)               │
    └──────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────────┐
    │  ENGINE 1: SEMANTIC MEMORY ENGINE                     │
    │  - 384D embeddings (all-MiniLM-L6-v2)                 │
    │  - SQLite vector store (Tauri backend)                │
    │  - Hybrid retrieval (similarity + importance + recency│
    │  - Auto-cleanup (max 10K memories, 365 days TTL)      │
    └───────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────────┐
    │  ENGINE 2: GOAL & CONSISTENCY ENGINE                  │
    │  - Multi-turn coherence tracking                      │
    │  - Goal management (parent goals + subgoals)          │
    │  - Fact tracking (confidence decay over time)         │
    │  - Consistency violation detection                    │
    │  - Auto-correction (apply fixes to raw output)        │
    └───────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────────┐
    │  ENGINE 3: CONVERSATION EVALUATION ENGINE             │
    │  - Live quality evaluation (coherence, relevance)     │
    │  - Baseline comparison (detect regressions)           │
    │  - Metrics tracking (conversation_consistency, etc.)  │
    │  - A/B testing support (compare provider quality)     │
    └───────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────────┐
    │  ENGINE 4: COGNITIVE OBSERVABILITY ENGINE             │
    │  - Execution tracing (all pipeline phases)            │
    │  - Decision logging (why choices made)                │
    │  - Debug panel data (introspection UI)                │
    │  - Export formats (JSON, CSV, Markdown)               │
    └───────────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  OMEGA PIPELINE (Backend Rust)                   │
    │  - Enriched context (semantic memories + goals)  │
    │  - Consistency checks applied                    │
    │  - Quality metrics tracked                       │
    │  - Full observability                            │
    └──────────────────────────────────────────────────┘
```

### OMEGA Integration Points

```typescript
// PHASE 1.3.2: Inject cognitive context (BEFORE AI generation)
const enrichedContext = await cognitiveOrchestrator.enrichContext(
  message, 
  history, 
  mode
);
// → Returns: { memories, goals, facts, trace }

// PHASE 1.5.1: Check consistency (AFTER AI generation, raw output)
const consistencyCheck = await cognitiveOrchestrator.checkConsistency(
  rawOutput, 
  enrichedContext
);
// → Returns: { violations[], auto_corrections[], consistency_score }

// PHASE 1.7.2: Apply auto-corrections (if violations detected)
if (consistencyCheck.violations.length > 0) {
  finalOutput = cognitiveOrchestrator.applyCorrections(
    rawOutput, 
    consistencyCheck.auto_corrections
  );
}

// ALL PHASES: Trace execution (observability)
cognitiveOrchestrator.trace('phase_name', { data });
```

---

## 🔧 API REFERENCE

### Core Class: `CognitiveOmegaOrchestrator`

```typescript
class CognitiveOmegaOrchestrator {
  // Core engines
  private semanticMemory: SemanticMemoryEngine;
  private goalConsistency: GoalConsistencyEngine;
  private evaluation: ConversationEvaluationEngine;
  private observability: CognitiveObservabilityEngine;

  // State
  private isInitialized: boolean;
  private stats: {
    totalInteractions: number;
    totalMemoriesCreated: number;
    totalViolationsDetected: number;
    totalCorrectionsApplied: number;
    totalEvaluations: number;
    avgConsistencyScore: number;
    avgQualityScore: number;
  };
}
```

### Methods

#### `enrichContext(message: string, history: AIMessage[], mode: ChatMode) -> Promise<EnrichedContext>`

**Description:** Enrich conversation context avec semantic memories + goals + facts (Phase 1.3.2)

**Parameters:**
- `message` — Current user message
- `history` — Conversation history (past messages)
- `mode` — Chat mode (chat, code, creative)

**Returns:** `Promise<EnrichedContext>` (memories, goals, facts, trace)

**Example:**
```typescript
const enriched = await cognitiveOrchestrator.enrichContext(
  "Explain vector databases",
  conversationHistory,
  "chat"
);

console.log("Semantic memories:", enriched.memories.length); // → 5 relevant memories
console.log("Active goals:", enriched.goals); // → ["Understand AI architecture"]
console.log("Known facts:", enriched.facts); // → ["TITANE uses Qdrant", ...]
```

**Enrichment Process:**
1. **Semantic search** (vector similarity, top 5 memories)
2. **Goal retrieval** (active conversation goals)
3. **Fact retrieval** (known facts from previous turns)
4. **Trace logging** (observability engine)

**Impact:**
- ✅ **Better context** → AI has access to long-term memories
- ✅ **Goal awareness** → AI stays focused on user goals
- ✅ **Fact consistency** → AI avoids contradicting previous statements

---

#### `checkConsistency(rawOutput: string, context: EnrichedContext) -> Promise<ConsistencyCheckResult>`

**Description:** Check consistency of raw AI output (Phase 1.5.1)

**Parameters:**
- `rawOutput` — Raw AI-generated response (before finalization)
- `context` — Enriched context (from enrichContext)

**Returns:** `Promise<ConsistencyCheckResult>` (violations, corrections, score)

**Example:**
```typescript
const rawOutput = "TITANE uses MySQL for vector storage";

const check = await cognitiveOrchestrator.checkConsistency(rawOutput, enrichedContext);

console.log("Violations detected:", check.violations.length); // → 1
console.log("Violation:", check.violations[0].description);
// → "Contradiction: TITANE uses Qdrant, not MySQL"

console.log("Auto-correction:", check.auto_corrections[0].corrected);
// → "TITANE uses Qdrant for vector storage"

console.log("Consistency score:", check.consistency_score); // → 0.6 (violation detected)
```

**Consistency Checks:**
1. **Goal alignment** — Response addresses user goal?
2. **Fact consistency** — No contradictions with known facts?
3. **Multi-turn coherence** — Consistent with conversation history?

**Violations Types:**
- **Contradiction** — Contradicts known fact
- **Goal drift** — Ignores active conversation goal
- **Incoherence** — Inconsistent with previous turns

---

#### `applyCorrections(text: string, corrections: AutoCorrection[]) -> string`

**Description:** Apply auto-corrections to raw output (Phase 1.7.2)

**Parameters:**
- `text` — Raw output with violations
- `corrections` — Auto-corrections generated by GoalConsistencyEngine

**Returns:** `string` (corrected output)

**Example:**
```typescript
const rawOutput = "TITANE uses MySQL for vector storage";
const corrections = [
  {
    original: "MySQL",
    corrected: "Qdrant",
    violations: [{ type: "contradiction", ... }]
  }
];

const corrected = cognitiveOrchestrator.applyCorrections(rawOutput, corrections);
console.log(corrected);
// → "TITANE uses Qdrant for vector storage"
```

---

#### `storeMemory(content: string, role: string, importance: number, tags: string[]) -> Promise<MemoryId>`

**Description:** Store semantic memory (Phase 1.6, après AI generation)

**Parameters:**
- `content` — Memory content (user message or AI response)
- `role` — Message role ("user" or "assistant")
- `importance` — Importance score (0.0 → 1.0)
- `tags` — Optional tags (["technical", "vector-db"])

**Returns:** `Promise<MemoryId>` (unique memory ID)

**Example:**
```typescript
const memoryId = await cognitiveOrchestrator.storeMemory(
  "TITANE uses Qdrant for vector search",
  "assistant",
  0.8, // High importance
  ["technical", "vector-db", "architecture"]
);

console.log("Memory stored:", memoryId); // → "mem_abc123"
```

**Storage Process:**
1. **Generate embedding** (384-dim vector via Transformers.js)
2. **Store in vector DB** (Tauri SQLite backend)
3. **Track metadata** (timestamp, role, importance, tags)
4. **Auto-cleanup** (if exceeds 10K memories, remove oldest low-importance)

---

#### `evaluateQuality(message: string, response: string, context: EnrichedContext) -> Promise<ConversationMetrics>`

**Description:** Evaluate conversation quality (coherence, relevance, goal alignment)

**Parameters:**
- `message` — User message
- `response` — AI response
- `context` — Enriched context

**Returns:** `Promise<ConversationMetrics>` (quality scores)

**Example:**
```typescript
const metrics = await cognitiveOrchestrator.evaluateQuality(
  "Explain vector databases",
  aiResponse,
  enrichedContext
);

console.log("Conversation consistency:", metrics.conversation_consistency); // → 0.92
console.log("Goal completion:", metrics.goal_completion); // → 0.85
console.log("Coherence:", metrics.coherence); // → 0.88
```

**Metrics:**
- `conversation_consistency` (0.0 → 1.0) — Consistent with history?
- `goal_completion` (0.0 → 1.0) — Addresses user goal?
- `coherence` (0.0 → 1.0) — Logically coherent?

---

#### `trace(phase: string, data: any) -> void`

**Description:** Log trace event (observability)

**Parameters:**
- `phase` — Phase name ('input_received', 'model_invoked', 'output_sent', etc.)
- `data` — Phase-specific data (payload, latency, metadata)

**Example:**
```typescript
cognitiveOrchestrator.trace('input_received', {
  message: userMessage,
  timestamp: Date.now()
});

cognitiveOrchestrator.trace('model_invoked', {
  provider: 'claude',
  latency_ms: 1250
});

cognitiveOrchestrator.trace('output_sent', {
  response: aiResponse,
  quality_score: 0.88
});
```

**Trace Phases:**
- `input_received` — User message received
- `semantic_memory_retrieved` — Memories fetched
- `goal_state_loaded` — Goals loaded
- `facts_loaded` — Facts loaded
- `context_built` — Enriched context ready
- `model_invoked` — AI provider called
- `raw_output` — Raw AI response
- `consistency_check` — Consistency validated
- `auto_correction` — Corrections applied
- `final_output` — Finalized response
- `output_sent` — Response sent to user

---

#### `getStats() -> CognitiveStats`

**Description:** Get orchestrator statistics

**Returns:** `CognitiveStats` (interactions, memories, violations, corrections, scores)

**Example:**
```typescript
const stats = cognitiveOrchestrator.getStats();

console.log("Total interactions:", stats.totalInteractions); // → 142
console.log("Total memories created:", stats.totalMemoriesCreated); // → 284
console.log("Total violations detected:", stats.totalViolationsDetected); // → 7
console.log("Total corrections applied:", stats.totalCorrectionsApplied); // → 5
console.log("Average consistency score:", stats.avgConsistencyScore); // → 0.94
console.log("Average quality score:", stats.avgQualityScore); // → 0.87
```

---

## 🧩 SUB-MODULES (4 Cognitive Engines)

### 1. SemanticMemoryEngine

**Purpose:** Long-term semantic memory avec vector search

**Key Features:**
- **384-dim embeddings** (all-MiniLM-L6-v2, Transformers.js)
- **SQLite vector store** (Tauri backend, persistent)
- **Hybrid retrieval** (similarity 70% + importance 20% + recency 10%)
- **Auto-cleanup** (max 10K memories, 365 days TTL)

**Methods:**
- `store(content, metadata) -> MemoryId` — Store semantic memory
- `recall(query, limit) -> Memory[]` — Retrieve top-K similar memories
- `clear() -> void` — Clear all memories

**Example:**
```typescript
// Store memory
const memoryId = await semanticMemory.store(
  "TITANE uses Qdrant for vector search",
  { importance: 0.8, tags: ["architecture"] }
);

// Recall similar memories
const memories = await semanticMemory.recall("vector database", 5);
memories.forEach(mem => {
  console.log(`Score: ${mem.score}, Content: ${mem.entry.summary}`);
});
```

---

### 2. GoalConsistencyEngine

**Purpose:** Multi-turn coherence, goal tracking, fact validation

**Key Features:**
- **Goal management** (parent goals + subgoals hierarchy)
- **Fact tracking** (confidence decay over time)
- **Consistency violation detection** (contradictions, goal drift, incoherence)
- **Auto-correction** (generate fixes for violations)

**Methods:**
- `createGoal(label, priority) -> GoalId` — Create conversation goal
- `addFact(statement, confidence) -> FactId` — Track known fact
- `checkConsistency(output, context) -> ConsistencyCheckResult` — Validate output
- `autoCorrect(violations) -> AutoCorrection[]` — Generate corrections

**Example:**
```typescript
// Create goal
const goalId = await goalConsistency.createGoal("Understand AI architecture", "high");

// Add fact
await goalConsistency.addFact("TITANE uses Qdrant for vectors", 0.95);

// Check consistency
const check = await goalConsistency.checkConsistency(
  "TITANE uses MySQL for vectors", 
  { goals, facts }
);
console.log("Violations:", check.violations); 
// → [{ type: "contradiction", ... }]
```

---

### 3. ConversationEvaluationEngine

**Purpose:** Quality metrics, regression detection, baseline comparison

**Key Features:**
- **Live evaluation** (coherence, relevance, goal alignment)
- **Regression detection** (compare current quality vs baseline)
- **Metrics tracking** (conversation_consistency, goal_completion, coherence)
- **A/B testing support** (compare provider quality)

**Methods:**
- `evaluateQuality(message, response, context) -> Metrics` — Evaluate quality
- `detectRegression(currentMetrics, baseline) -> boolean` — Detect quality drop
- `getBaseline() -> Metrics` — Get baseline metrics (average of past conversations)

**Example:**
```typescript
const metrics = await evaluation.evaluateQuality(message, response, context);
console.log("Quality:", metrics.coherence); // → 0.88

const baseline = evaluation.getBaseline();
const isRegression = evaluation.detectRegression(metrics, baseline);
console.log("Regression detected:", isRegression); // → false
```

---

### 4. CognitiveObservabilityEngine

**Purpose:** Introspection, tracing, decision logging, debug panel

**Key Features:**
- **Execution tracing** (all pipeline phases logged)
- **Decision logging** (why choices made)
- **Debug panel data** (UI introspection)
- **Export formats** (JSON, CSV, Markdown)

**Methods:**
- `trace(phase, data) -> void` — Log trace event
- `logDecision(decision, rationale) -> void` — Log decision + reason
- `getTraces(filter) -> Trace[]` — Retrieve traces (filtered by phase, time range)
- `exportTraces(format) -> string` — Export traces (JSON, CSV, Markdown)

**Example:**
```typescript
// Trace execution
observability.trace('model_invoked', { provider: 'claude', latency: 1250 });

// Log decision
observability.logDecision('provider_selection', {
  decision: 'claude',
  rationale: 'Highest quality for technical queries'
});

// Export traces (debug)
const tracesJSON = observability.exportTraces('json');
console.log(tracesJSON);
```

---

## 💾 DATA STRUCTURES

### `EnrichedContext`

```typescript
interface EnrichedContext {
  memories: MemorySearchResult[];      // Semantic memories (top 5)
  goals: ConversationGoal[];           // Active conversation goals
  facts: ConversationFact[];           // Known facts (high confidence)
  trace: CognitiveTrace;               // Observability trace
}
```

---

### `ConsistencyCheckResult`

```typescript
interface ConsistencyCheckResult {
  violations: ConsistencyViolation[];  // Detected violations
  auto_corrections: AutoCorrection[];  // Suggested fixes
  consistency_score: number;           // 0.0 → 1.0
}
```

---

### `ConversationMetrics`

```typescript
interface ConversationMetrics {
  conversation_consistency: number;    // 0.0 → 1.0
  goal_completion: number;             // 0.0 → 1.0
  coherence: number;                   // 0.0 → 1.0
  [key: string]: number;               // Extensible
}
```

---

### `CognitiveStats`

```typescript
interface CognitiveStats {
  totalInteractions: number;
  totalMemoriesCreated: number;
  totalViolationsDetected: number;
  totalCorrectionsApplied: number;
  totalEvaluations: number;
  avgConsistencyScore: number;
  avgQualityScore: number;
}
```

---

## 🧪 TESTING

### Integration Tests

**Location:** `src/services/cognitive/__tests__/cognitiveOmegaIntegration.test.ts`

**Key Tests:**

1. **test_enrich_context** — Context enrichment
2. **test_consistency_check** — Consistency validation
3. **test_auto_correction** — Auto-correction application
4. **test_memory_storage** — Semantic memory storage
5. **test_quality_evaluation** — Quality metrics scoring
6. **test_trace_logging** — Observability tracing

---

## ⚡ PERFORMANCE

### Latency Benchmarks

| Operation               | Latency (avg) | Notes                          |
| ----------------------- | ------------- | ------------------------------ |
| **Enrich Context**      | ~50-100ms     | Semantic search + goal/fact retrieval |
| **Consistency Check**   | ~20-40ms      | Violation detection + auto-correction generation |
| **Store Memory**        | ~30-60ms      | Embedding generation + vector storage |
| **Evaluate Quality**    | ~10-20ms      | Metrics computation |
| **Trace Logging**       | ~1-5ms        | Log event (async, non-blocking) |

**Total Cognitive Overhead:** ~100-200ms (added to OMEGA pipeline)

---

## 🔗 INTEGRATIONS

### ChatEngine Integration

**Location:** `src/services/ai/chatEngine.ts`

```typescript
// Phase 1.3.2: Enrich context (BEFORE AI generation)
const enrichedContext = await cognitiveOrchestrator.enrichContext(
  message,
  history,
  mode
);

// Inject into AI prompt
const prompt = buildPrompt(message, enrichedContext.memories, enrichedContext.goals);

// Phase 1.5.1: Check consistency (AFTER AI generation)
const consistencyCheck = await cognitiveOrchestrator.checkConsistency(
  rawOutput,
  enrichedContext
);

// Phase 1.7.2: Apply corrections (if violations)
if (consistencyCheck.violations.length > 0) {
  finalOutput = cognitiveOrchestrator.applyCorrections(
    rawOutput,
    consistencyCheck.auto_corrections
  );
}

// Phase 1.6: Store memory
await cognitiveOrchestrator.storeMemory(finalOutput, "assistant", 0.7, ["response"]);
```

---

## 📚 CROSS-REFERENCES

### Related Modules

- **[CHAT_ENGINE.md](../frontend/CHAT_ENGINE.md)** — ChatEngine (integrates Cognitive Orchestrator)
- **[UNIFIED_MEMORY_FRONTEND.md](../frontend/UNIFIED_MEMORY_FRONTEND.md)** — UnifiedMemory (frontend memory service)
- **[CONVERSATION_ENGINE.md](../backend/CONVERSATION_ENGINE.md)** — ConversationEngine (backend orchestration)

### Architecture Docs

- **[ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md)** — System architecture
- **[DATA_FLOW_CHAT.md](../../02_architecture_reality/DATA_FLOW_CHAT.md)** — Data flow (cognitive integration)

### Guides

- **[docs/99_ARCHIVE/sessions/COGNITIVE_OMEGA_INTEGRATION_GUIDE_v42.md](../../99_ARCHIVE/sessions/COGNITIVE_OMEGA_INTEGRATION_GUIDE_v42.md)** — Cognitive Omega integration guide

---

**Module Documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Cognitive Engines Team

---

_Cognitive Orchestrator — 4 moteurs cognitifs pour intelligence augmentée_ 🧠✨
