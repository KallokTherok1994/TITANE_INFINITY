# MEMORY_CONSUMPTION_MAP — TITANE∞
## Discovery Document: Memory Write → Persist → Recall → Inject → Consume → Effect Chain
### Date: 2026-03-26 | Lock: #1 Boot Truth

---

## A) EXEC_MODE: CERTIFY (read-only discovery, no patches)
## B) STATUS: REAL_STATE — no hallucination

---

## 1. MEMORY ARCHITECTURE OVERVIEW

Three-tier system:
```
STM (Short-Term)  → memory/stm.json  — TTL 5min,  max 50,  importance 0.0-0.3
MTM (Medium-Term) → memory/mtm.json  — TTL 30min, max 200, importance 0.3-0.7
LTM (Long-Term)   → memory/ltm.json  — TTL 24h,   max 1000, importance 0.7-1.0
```

---

## 2. WRITE CHAIN

### 2A. Chat Interaction Write
**File**: `src/services/api/memory.ts` — `saveChatInteraction(interaction)`

Triggered after each AI response.
Writes: user message + assistant reply as `MemoryEntry` with type `'conversation'`.
Importance: low (0.1-0.2) → goes to STM.

### 2B. Structured Entry Write
**File**: `src/services/api/memory.ts` — `saveStructuredEntry(entry)`

Called explicitly for: knowledge, decision, project entries.
Importance determines tier placement:
- < 0.3 → STM
- 0.3-0.7 → MTM
- ≥ 0.7 → LTM

### 2C. Backend MultiLayer Write (Rust)
**File**: `src-tauri/src/conversation_engine/mod.rs:248-261`

Triggered after every 10 turns: `mlm.consolidate_session()`
Writes: concept extraction from session into intermediate layer.
Independent of frontend memory write.

### 2D. MemoryBridge Auto-Store Intent
**File**: `src/services/memory/MemoryBridge.ts`

Detects STORE intent from user message (patterns: "retiens", "note", "n'oublie pas").
Confidence: 0.85.
When detected: creates MemoryEntry with type `'knowledge'` and importance 0.7 → goes to LTM.

---

## 3. PERSIST CHAIN

**File**: `src/services/memory/UnifiedMemoryService.ts`

```
saveEntry(entry)
  → calculate tier (by importance)
  → write to memory/stm.json | mtm.json | ltm.json
  → update accessCount, lastAccessed
  → respect maxEntries per tier
  → evict oldest entries if full
```

**Backend persist** (Rust):
```
src-tauri/src/commands/persistent_memory.rs
  → SQLite via Tauri commands
  → separate from JSON memory files
  → accessed via tauriClient.persistentMemoryRead()
```

**Known gap**: Two parallel persistence paths exist (JSON files vs SQLite). Unified consumption is not proven.

---

## 4. RECALL CHAIN

### 4A. Intent-Based Recall (MemoryBridge)
**File**: `src/services/memory/MemoryBridge.ts:267-323`

```
detectIntent(userMessage)
  → intent = RECALL | STORE | CLARIFY
  → confidence scoring
  → extract keywords (>3 chars, non-stopwords, max 8)
  → UnifiedMemoryService.recall(keywords)
  → rank by: importance(70%) + recency(30%)
  → return top entries
```

### 4B. Context Load (Memory API)
**File**: `src/services/api/memory.ts` — `loadContext(config)`

```
loadContext({ includeProjects, includeDecisions, includeKnowledge, includeRituals })
  → getActiveProjects(limit:5)
  → getRecentDecisions(limit:10, timeWindow:'7d')
  → getKnowledge(limit:20)
  → getActiveRituals()
  → return MemoryContext object
```

Timeout: 5000ms.

---

## 5. INJECT CHAIN

### 5A. Provider-Level Injection (Gemini, Ollama, TitaneLocal)
**Files**:
- `src/services/ai/providers/gemini.ts:93-162`
- `src/services/ai/providers/ollama.ts:269-285`
- `src/services/ai/providers/titaneLocal.ts:485-527`

Pattern:
```
1. Check if hasInjectedSystemHistory (avoid double injection)
2. memoryIntegration.loadContext({ ... })
3. Build memoryLTMInjection string:
   "📋 Contexte Mémoire LTM:\n" + projects + decisions + knowledge
4. Append to message OR add to system prompt section
```

Format of injected memory:
```
📋 Contexte Mémoire LTM:
Projets actifs: [projects]
Décisions récentes: [decisions]
Base de connaissances: N entrées
```

### 5B. MemoryBridge Injection (Chat Engine)
**File**: `src/services/memory/MemoryBridge.ts`

Format:
```
[Mémoire STM] (type, importance%, tierlevel): content
[Mémoire MTM] (type, importance%, tierlevel): content
[Mémoire LTM] (type, importance%, tierlevel): content
```

Returns: `systemPromptAddition + relevantMemories + contextSize`

---

## 6. CONSUME → BEHAVIOR CHANGE

**Status**: UNPROVEN END-TO-END

What is claimed:
- Memory context is injected into AI prompt
- AI uses memory context to answer differently than without it

What is proven:
- Memory context IS appended to messages/system prompts (code evidence)
- Memory IS loaded (code path exists)
- Memory DOES populate memory/stm.json, mtm.json, ltm.json (file evidence)

What is NOT proven:
- That injected memory actually changes AI output in a measurable way
- That no-memory baseline vs with-memory response quality difference exists
- That memory classification (STABLE_USER_PREFERENCE vs NOISE) works correctly
- That memory injection does not silently fail due to empty recall

---

## 7. MEMORY CLASSIFICATION (Current vs Required)

**Current types** (`UnifiedMemoryService.ts:18-36`):
```typescript
type: 'fact' | 'preference' | 'context' | 'conversation' | 'knowledge' | 'decision' | 'project'
```

**Required by Super Prompt** (memory governance):
```
STABLE_USER_PREFERENCE | DURABLE_CONSTRAINT | CURRENT_TASK_OVERRIDE
SHORT_LIVED_CONTEXT | NOISE | DO_NOT_STORE
```

**Gap**: Current classification is content-type, not governance-type. No NOISE detection. No DO_NOT_STORE filter. No DURABLE_CONSTRAINT priority logic.

---

## 8. CONSUMPTION ORDER (Required vs Actual)

**Required (Super Prompt §8)**:
1. explicit current instruction
2. durable constraint
3. stable user preference
4. local task context
5. default system policy

**Actual**: No priority ordering exists. Memory is loaded by importance score + recency. No governance-level priority.

---

## 9. STATUS VERDICT

| Chain Step | Status | Notes |
|---|---|---|
| Write (chat interaction) | ✅ ACTIVE | saveChatInteraction() called after each response |
| Write (structured) | ✅ ACTIVE | saveStructuredEntry() available |
| Write (intent-detected) | ⚠️ PARTIAL | MemoryBridge STORE intent detection, confidence 0.85 |
| Persist (JSON files) | ✅ ACTIVE | stm/mtm/ltm.json files |
| Persist (SQLite backend) | ✅ ACTIVE | persistent_memory.rs |
| Recall (intent-based) | ⚠️ PARTIAL | keyword extraction, importance+recency ranking |
| Recall (context load) | ✅ ACTIVE | loadContext() called in providers |
| Inject (to AI prompt) | ✅ ACTIVE | 3 providers inject memory context |
| Consume (behavior change) | ❌ UNPROVEN | No baseline comparison, no diff test |
| Memory governance classification | ❌ ABSENT | No STABLE_PREFERENCE/NOISE/DURABLE_CONSTRAINT |
| Priority ordering | ❌ ABSENT | No consumption order enforcement |

**G_MEMORY_CONSUMPTION_REAL**: BLOCKED (inject is active but behavior change is unproven)
