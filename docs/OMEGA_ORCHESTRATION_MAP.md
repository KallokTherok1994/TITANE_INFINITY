# OMEGA_ORCHESTRATION_MAP — TITANE∞
## Discovery Document: Full Chain — Input → Analysis → Routing → Provider → Validation → Persistence → Autoheal
### Date: 2026-03-26 | Lock: #1 Boot Truth

---

## A) EXEC_MODE: CERTIFY (read-only discovery, no patches)
## B) STATUS: REAL_STATE — no hallucination

---

## 1. COMPLETE ORCHESTRATION CHAIN (Current Reality)

```
USER TURN (message string)
    │
    ├─ Frontend: useConversationEngine.sendMessage()
    │   [src/hooks/useConversationEngine.ts:345]
    │
    ├─ STEP 0: Input sanitization
    │   orchestrator.sanitizeMessage()
    │   [src/services/ai/orchestrator.ts:494-558]
    │   - Type check, length limit (50k), script removal
    │   - HTML strip, null byte detection
    │
    ├─ STEP 1: Memory context load (parallel)
    │   memoryIntegration.loadContext()
    │   Timeout: 5000ms
    │   Returns: MemoryContext (projects, decisions, knowledge)
    │
    ├─ STEP 2: Mode resolution (MANUAL ONLY — no auto-classification)
    │   currentMode = options.mode || 'default'
    │   No input analysis. No signal detection. User-driven.
    │
    ├─ STEP 3: Provider selection
    │   aiOrchestrator.selectOptimalProvider()
    │   [src/services/ai/orchestrator.ts:590]
    │   Neural scoring (9 factors) → selected provider
    │
    ├─ STEP 4: ConversationRequest construction
    │   { user_message, conversation_id, mode, ai_config,
    │     emotion_context, custom_system_prompt, history }
    │
    ├─ STEP 5: Tauri IPC call
    │   invoke('conversation_generate', { request })
    │   [src/services/conversationEngine.ts]
    │
    └─ BACKEND (Rust)
        │
        ├─ STEP 6: Offline sim check
        │   [src-tauri/src/conversation_engine/mod.rs]
        │   If OFFLINE_SIM: return deterministic response, skip everything
        │
        ├─ STEP 7: OMEGA Bridge attempt (primary path)
        │   omega_bridge.process_through_omega(&request)
        │   [src-tauri/src/conversation_engine/omega_integration.rs:111]
        │   - Converts request to OmegaPipelineInput
        │   - Executes OmegaPipeline
        │   - Converts back to ConversationResponse
        │
        ├─ STEP 7-FAIL → Legacy Pipeline fallback
        │   [src-tauri/src/conversation_engine/mod.rs:283-306]
        │   pipeline.process(request)
        │
        ├─ STEP 8: ConversationPipeline.process() [ACTIVE PATH]
        │   [src-tauri/src/conversation_engine/pipeline.rs:64-296]
        │   │
        │   ├─ 8.1: preprocess(message) — validation + sanitization
        │   │
        │   ├─ 8.2-8.4: Parallel analysis:
        │   │   ├─ Intent: intent_analyzer.analyze(message)
        │   │   │         [src-tauri/src/engines/conversation_os/router.rs]
        │   │   │         Returns: Question|Search|Code|Chat|Command|Clarification|Unknown
        │   │   ├─ Emotion: emotion_analyzer.analyze(message, emotion_ctx)
        │   │   │           Returns: EmotionState {valence, intensity, energy}
        │   │   └─ Memory: load context from SQLite/persistent memory
        │   │
        │   ├─ 8.5: build_prompt(message, request, intention, emotion, memory_context)
        │   │   [pipeline.rs:318-427]
        │   │   ├─ Priority 1: custom_system_prompt from request (if present)
        │   │   ├─ Priority 2: match request.mode → (system_identity, mode_instruction)
        │   │   └─ Builds full prompt with: identity + mode + emotion + memory + history + message
        │   │
        │   ├─ 8.6: FrenchMastery post-processing
        │   │       Language validation, French enforcement
        │   │
        │   ├─ 8.7: API Neutralizer
        │   │       Strips API artifacts, normalizes output
        │   │
        │   ├─ 8.8: Cognitive compression
        │   │       Extracts tags + cognitive summary
        │   │
        │   ├─ 8.9: Memory write
        │   │       save conversation turn to persistent memory
        │   │
        │   ├─ 8.10: Singularity sync
        │   │        [pipeline.rs:212-262]
        │   │        singularity.singularity_meta_process_conversation()
        │   │        Validates coherence, enriches meta-tags, may correct
        │   │
        │   ├─ 8.11: Self-healing check
        │   │         core/healing/AutoFixEngine — check for repair signals
        │   │
        │   └─ 8.12: Singularity meta return
        │             Final message after all post-processing
        │
        ├─ STEP 9: MultiLayer Memory consolidation
        │   [mod.rs:248-261]
        │   Every 10 turns: mlm.consolidate_session()
        │   Extract concepts → write to intermediate layer
        │
        └─ STEP 10: Return ConversationResponse
            { assistant_message, conversation_id, message_id,
              detected_intention, detected_emotion,
              cognitive_tags, cognitive_summary, metadata }
            NOTE: No trace_meta (mode_used, effort_level, etc.)
```

---

## 2. WHAT IS MISSING FROM THE CHAIN

Between STEP 2 and STEP 3, the canonical OMEGA chain requires:

```
REQUIRED:
USER TURN
→ INPUT ANALYSIS           ← MISSING: no signal detection
→ MODE CLASSIFIER          ← MISSING: mode is manual
→ COMPLEXITY/RISK CLASSIFIER  ← MISSING: only crude length check
→ MEMORY SCOPE SELECTOR    ← MISSING: memory loaded identically for all modes
→ MODEL/PROVIDER SELECTOR  ← PARTIAL: provider selected, not model class
→ EFFORT SELECTOR          ← MISSING: effort not set per turn
→ PROMPT POLICY ASSEMBLER  ← PARTIAL: mode-based prompts exist, but no policy assembly
→ EXECUTION                ← ✅ ACTIVE
→ RESPONSE VALIDATION      ← ⚠️ PARTIAL: sanitization exists, no validation against mode
→ MEMORY WRITE POLICY      ← PARTIAL: writes happen, no governance
→ OBSERVATION/SCORING      ← MISSING: no scoring of response quality
→ CHALLENGER COMPARISON    ← MISSING: no comparison framework
→ SHADOW LEARNING OUTPUT   ← MISSING
→ FINAL RESPONSE + TRACE META ← MISSING: no trace meta emitted
```

---

## 3. AUTOHEAL INTEGRATION (Current State)

**File**: `scripts/autoheal/autoheal_rules.jsonl`

- 1 rule exists: `AH-2026-03-23-1006-ORCHESTRATOR_FIXES-001`
  - Scope: orchestrator.ts
  - Fixes: memory leak + recovery threshold + streaming timeout
- Status: MANUAL_ONLY (PostToolUse auto-capture is DISABLED per `.clinerules/05-truth-surface.md`)

Autoheal is NOT part of the runtime orchestration chain. It is a documentation system.

---

## 4. OBSERVATION/SCORING (Missing)

No scoring system exists for:
- Response usefulness
- Mode appropriateness
- Provider selection quality
- Memory relevance

No feedback loop from response quality to provider selection.
`ProviderStats.reliability` is updated on success/failure (binary), not on response quality.

---

## 5. STATUS VERDICT

| Chain Step | Status |
|---|---|
| INPUT ANALYSIS | ❌ ABSENT |
| MODE CLASSIFIER | ❌ ABSENT (user-driven only) |
| COMPLEXITY/RISK CLASSIFIER | ❌ ABSENT |
| MEMORY SCOPE SELECTOR | ❌ ABSENT (always loads same context) |
| MODEL/PROVIDER SELECTOR | ⚠️ PARTIAL (provider yes, model class no) |
| EFFORT SELECTOR | ❌ ABSENT |
| PROMPT POLICY ASSEMBLER | ⚠️ PARTIAL (mode prompts exist, no policy layer) |
| EXECUTION | ✅ ACTIVE |
| RESPONSE VALIDATION | ⚠️ PARTIAL (sanitization, no mode-coherence check) |
| MEMORY WRITE POLICY | ⚠️ PARTIAL (writes happen, no governance) |
| OBSERVATION/SCORING | ❌ ABSENT |
| CHALLENGER COMPARISON | ❌ ABSENT |
| SHADOW LEARNING OUTPUT | ❌ ABSENT |
| TRACE META IN RESPONSE | ❌ ABSENT |

**G_OMEGA_CHAIN_MAPPED**: PASS (this document maps the real state)
**G_BOOT_TRUTH**: PASS (repo reality documented without hallucination)
