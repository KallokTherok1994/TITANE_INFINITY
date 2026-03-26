# CHAT CHAIN GAP MAP
## Proof Pack: POST_SEAL_CORRECTION_2026-03-21_1228_9b50cc67e

---

## Canonical Chat Path (src/services/ai/chatEngine.ts v24.3.0)

```
UI → useChat → ChatEngineOmega.sendMessage()
  → Phase 1.1: Input validation (inputValidator)
  → Phase 1.2: Parallel context loading
      → memoryIntegration.loadContext()   ← GAP D-002 WAS HERE
      → cognitiveOmega.enrichContext()
  → Phase 1.3: Prompt assembly
      → formatMemoryContext()             ← GAP D-003 WAS HERE
      → buildSystemPrompt()
      → cognitiveContext injection
  → tryBackendPipeline() → IPC → Tauri
     OR aiOrchestrator.sendMessage()
  → Response normalization
  → memoryIntegration.saveInteraction()
  → UI reflection
```

---

## Gap D-002: MEMORY_CONSUMPTION_UNPROVEN

### Was:
`chatMemoryCompactor.getStats()` returns `{count, sizeMB, compressed}` but NO unit test
existed to verify:
- `count` = actual stored message count
- `sizeMB` = actual localStorage string length / (1024×1024), not an estimate
- `compressed` = false when no compaction occurred

### Fix:
Created `src/__tests__/memory-consumption-truth.test.ts` with 6 targeted tests.

### Evidence of repair:
```
✓ returns count=0 and sizeMB=0 when no messages stored
✓ count reflects exact number of saved messages
✓ sizeMB is > 0 after messages are saved
✓ sizeMB is computed from stored JSON string length (not estimated)
✓ compressed flag is false when no compression occurred
✓ autoCleanupIfNeeded returns consistent sizeMB after save
6/6 PASS × 3 runs = 18/18 zero flakiness
```

### Status: **CLOSED — MEMORY_CONSUMPTION_PROVEN**

---

## Gap D-003: RESPONSE_ASSEMBLY_UNPROVEN

### Was:
`formatMemoryContext()` and `buildSystemPrompt()` are private methods in `ChatEngineOmega`.
The assembly pipeline (memory context → sources → promptContext.memory → systemPrompt) had
NO unit test verifying that:
- `sources` array is populated from `MemoryContext` content
- project/decision/knowledge data reaches `data.*` fields
- `buildSystemPrompt` produces a real non-empty string

### Fix:
Created `src/__tests__/response-assembly-truth.test.ts` with 9 targeted tests.

### Evidence of repair:
```
✓ empty MemoryContext produces empty sources array
✓ activeProjects populates sources with "projets"
✓ recentDecisions populates sources with "decisions"
✓ relevantKnowledge populates sources with "knowledge"
✓ data.projects contains project title from MemoryContext
✓ data.decisions contains decision title from MemoryContext
✓ returns non-empty string for standard mode with empty context
✓ returns non-empty string when memory sources are present
✓ promptContext.memory is set when sources are non-empty
9/9 PASS × 3 runs = 27/27 zero flakiness
```

### Status: **CLOSED — RESPONSE_ASSEMBLY_PROVEN**

---

## Remaining Known Gap (pre-existing, not in scope this session)

| Gap | Chain Point | Status |
|---|---|---|
| Memory injection into LLM prompt (backend) | Rust chat_engine/memory.rs ↔ IPC payload | WIRED — Rust tests pass, IPC payload unverifiable in browser harness |
| Online provider chain | All providers except titane-local | NO_KEY_ENV — expected, not masked |

---

## Chat Chain Final Status

| Chain step | Status |
|---|---|
| Input validation | PROVEN (inputValidator tests) |
| Memory context loading | WIRED — fallback path tested |
| Memory stats truth | **PROVEN (new — D-002 closed)** |
| Prompt assembly (formatMemoryContext + buildSystemPrompt) | **PROVEN (new — D-003 closed)** |
| Cognitive context injection | WIRED — cognitiveOmega exists, integration tested |
| IPC backend pipeline | WIRED — Rust tests 26/26 PASS |
| Response normalization | PROVEN (omega-provider-tests) |
| Memory save after response | WIRED — saveInteraction() called in chat path |

**Overall chain: CHAT_CHAIN_PARTIAL→QUALIFIED**
All provable steps now have tests. Backend IPC chain requires Tauri runtime (cannot prove in browser harness — honest block, not masked).
