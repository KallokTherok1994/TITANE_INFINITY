# 01 BOOTSTRAP — REAL STATE ESTABLISHMENT

## A. REAL_STATE

### Configuration Surface (Readable from Code)
```yaml
OMEGA_PROFILES:
  - DIRECT: maxTokens=1024, clarification_threshold=0.85
  - BALANCED: maxTokens=4096, injectLTM=true, clarification_threshold=0.72 ✓
  - DEEP: maxTokens=8192, injectLTM=true, maxSources=10 [UNPROVEN]
  - ARCHITECT: maxTokens=12000, injectLTM=true, maxSources=12 [UNPROVEN]
  - OMEGA: maxTokens=16000, injectLTM=true, maxSources=20 [NEW, UNPROVEN]

Modelfile:
  - num_ctx: 32768 ✓
  - num_predict: 8192 ✓
  - temperature: 0.75 (universal; no mode differentiation)
  - top_p: 0.92 (universal; no mode differentiation)
  
Response Policy Source of Truth:
  - File: src/services/ai/responsePolicy.ts ✓ (single canonical source)
  - runtimeProven field: ALL non-DIRECT/BALANCED = false
  
Chat Orchestrator:
  - Ψ Uses responsePolicy.selectResponseProfile() ✓
  - Ψ Passes profile to provider (ollama, claude, openai, etc.) ✓
  - Ψ Memory bridge enrich_context() called ✓ (in theory)
  
Memory Bridge (Rust):
  - omega::memory_bridge::OmegaMemoryBridge exists ✓
  - enrich_context() fetches STM, MTM, LTM, vector ✓
  - BUT: No proof it's actually injected into prompt assembly
  - NO METRICS: no latency/token cost tracking
```

### Runtime Surface (Proven by Test/Execution)
```
❌ MISSING: No E2E runtime proof for:
  - DEEP profile selection working end-to-end
  - Response length actually increased for DEEP vs DIRECT
  - LTM memory actually injected into prompt
  - Clarification questions actually reduced under same ambiguity
  - Response shape matches profile (structure level)
  - Latency acceptable for each profile timeout

⚠️  PARTIALLY PROVEN:
  - Chat input/output working (screens show responses)
  - BALANCED profile at least responds (default mode)
  - Ollama connects and generates text

❌ NOT MEASURED:
  - Response token count by profile
  - Memory sources injected per request
  - Clarification trigger count before/after
  - Latency by profile
  - User preference storage/recall
```

---

## B. TARGET_DELTA

### What We're Fixing (Tier 1)
**Restore Runtime Proof Chain:**
- Enable DEEP profile E2E verification
- Measure response shape difference vs DIRECT
- Record memory injection
- Confirm timeout/latency acceptable

**Why this tier?**
- Fast: test-only, no refactoring
- Unblocking: proves whether config is working or just cosmetic
- Non-breaking: doesn't change production code
- Measurable: generates proof matrix

### Success Criteria
1. E2E test sends request → profile=DEEP
2. Response received with metadata (tokens, memory_sources, latency)
3. Compare vs identical request with profile=DIRECT
4. Measure difference in response structure/depth/length
5. Run x3, consistent results
6. VERDICT: PASS (config working) or FAIL (needs fix)

---

## C. CURRENT_REAL_LOCK

**Lock Name:** `DEEP_ARCHITECT_OMEGA_RUNTIME_UNPROVEN`

**Classification:** CONFIGURATION_WIRED_BUT_UNPROVEN

**Root Cause:**
- Profiles defined in responsePolicy.ts
- Profile selection logic exists (selectResponseProfile())
- BUT: No end-to-end test runs real request through DEEP profile
- NO proof that response actually uses DEEP params
- NO proof that response is more developed/structured than DIRECT
- NO latency/memory measurement

**Risk If Not Fixed:**
- UI claims "DEEP reasoning available" but it's just configuration (lying UI)
- User selects DEEP expecting deeper reasoning but gets same response as DIRECT
- Release certifies features that aren't runtime verified
- Memory injection wired but possibly not consumed

**Proof Location:** Missing

---

## D. DEFECT_CLASSIFICATION

| Aspect | Current State | Classification |
|--------|---------------|-----------------|
| Config fidelity | Profiles defined | ✓ GOOD |
| Routing selection | selectResponseProfile() exists | ✓ GOOD |
| Memory policy | injectLTM: true configured | ✓ GOOD |
| Runtime proof | ❌ NONE | **DEFECT: UNPROVEN_RUNTIME** |
| E2E test | ❌ NONE | **DEFECT: TEST_MISSING** |
| Metrics | ❌ NONE | **DEFECT: NO_INSTRUMENTATION** |
| Degraded UI markers | ❌ NONE | **DEFECT: HONESTY_MISSING** |

---

## E. FILES_TOUCHED (Planned for Tier 1)

**Test-only (no prod code changes yet):**
- `e2e/spec/chat-profile-deep.spec.ts` (new)
- `proof_packs/.../14_TEST_RUNS_X3.md` (generated)

**Metrics (add instrumentation):**
- Potentially: src-tauri/src/conversation_engine/commands.rs (add response metadata)

---

## F. NEXT_ACTION <= 30 MIN

1. Create E2E test file: `e2e/spec/chat-profile-deep.spec.ts`
   - Send: "Explique en détail: qu'est-ce qu'un modèle IA ?"
   - Expect profile=DEEP selected
   - Capture: response tokens, latency, memory_sources
   
2. Run test x3, capture output
   
3. Measure: token_count(DEEP) vs token_count(DIRECT) for same query

4. Generate proof matrix

5. VERDICT: PASS or FAIL

---

## G. BUILD_STATUS

Build reproducibility failing (G6: NON-REPRODUCIBLE) but unrelated to chat profile changes.

