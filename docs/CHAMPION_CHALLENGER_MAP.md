# CHAMPION_CHALLENGER_MAP — TITANE∞
## Discovery Document: Champion Definition, Eval Gaps, Promotion Infrastructure
### Date: 2026-03-26 | Lock: #1 Boot Truth

---

## A) EXEC_MODE: CERTIFY (read-only discovery, no patches)
## B) STATUS: REAL_STATE — no hallucination

---

## 1. CHAMPION/CHALLENGER FRAMEWORK STATUS

**Status: NOT IMPLEMENTED**

No A/B testing infrastructure exists. No variant switching. No comparison framework.
No champion registry. No challenger registry. No eval scorecard.

This document defines the BASELINE for the champion (current system) so Lock #2 can
implement the framework properly.

---

## 2. CURRENT CHAMPION DEFINITION

The current production system IS the champion. Baseline snapshot:

### Champion: TITANE∞ v28.88.0 — Manual Mode System

**Orchestration policy**:
- Mode: user-selected, default = `ConversationMode::Default`
- Provider: neural scoring (orchestrator.ts, 9 factors), cloud-first
- Effort: static per profile (defined but not auto-wired)
- Memory: always-load LTM context in 3 providers (gemini, ollama, titaneLocal)
- Fallback: titane-local (always available)
- Trace meta: none emitted

**Response profile**:
- No automatic profile selection
- Effective behavior = BALANCED for all queries (implicit)
- maxTokens: varies by provider config
- temperature: varies by provider config (0.5-0.7)

**Known strengths**:
- Provider fallback chain is robust (never hard-fails)
- French language enforcement active (FrenchMastery)
- Singularity meta-processing adds coherence validation
- Memory persistence works (JSON + SQLite dual-path)

**Known weaknesses**:
- Mode never adapts to query type (always Default unless user switches)
- No trace meta → no observability
- No quality scoring → no improvement signal
- Crude complexity detection (length > 200 = complex)

---

## 3. EXISTING EVALS (What Can Serve as Champion Baseline)

### Unit Tests (partially cover champion behavior)

| Test File | Coverage | Useful for Champion |
|---|---|---|
| `src/__tests__/chatEngine.test.ts` | Mode importance scoring | ⚠️ Partial (tests mode weights, not selection) |
| `src/__tests__/chatEngine-memory-integration.test.ts` | Memory tier tests | ⚠️ Partial (legacy format) |
| `src/services/conversationEngine.test.ts` | ConversationEngine flow | ✅ Good baseline |
| `tests/integration/audit-system.test.ts` | System-level audits | ✅ Good baseline |

### E2E Tests

| Test File | Coverage | Useful for Champion |
|---|---|---|
| `tests/e2e/chat-profile-comparison.spec.ts` | Profile comparison | ✅ DIRECT champion/challenger candidate |
| `e2e/desktop/online-chat-proof-ui.wdio.test.js` | Desktop chat proof | ✅ Runtime truth |

`chat-profile-comparison.spec.ts` is the closest thing to a champion/challenger test. It compares responses across profiles but does NOT have:
- Formal champion definition
- Scorecard dimensions
- Promotion gate
- Regression detection

---

## 4. MISSING EVALS (Required by Super Prompt §15)

### LANE A — Mode Classification (Lock #1: implementing)
- [ ] Direct query → DIRECT mode
- [ ] Ambiguous query → CLARIFY_LIGHT mode
- [ ] Architecture query → ARCHITECT mode
- [ ] Repair query → REPAIR mode
- [ ] Certification query → CERTIFY mode
- [ ] Symbolic/spiritual query → EXPLORATION mode
- [ ] Exploratory query → EXPLORATION mode

### LANE B — Model Selection
- [ ] Small task → HAIKU class
- [ ] Normal implementation → SONNET class
- [ ] Architecture/contradiction → OPUS class
- [ ] Plan+execute → OPUSPLAN class
- [ ] Large context → [1m] justified only when needed

### LANE C — Memory Consumption
- [ ] Stable preference changes output shape
- [ ] Temporary override beats durable preference
- [ ] Noise is not stored
- [ ] Empty recall does not claim memory usage

### LANE D — Fallback Honesty
- [ ] Unavailable provider/model → explicit fallback
- [ ] Degraded mode → exposed to user
- [ ] Partial context → acknowledged
- [ ] Blocked memory retrieval → no false memory claim

### LANE E — Champion/Challenger
- [ ] Challenger compared to champion
- [ ] Regression blocks promotion
- [ ] Rollback path works
- [ ] Proof pack generated

### LANE F — Stability x3
- [ ] Same classification input 3 times → identical output

---

## 5. SCORECARD DIMENSIONS (Required, Not Yet Implemented)

For champion/challenger comparison, per Super Prompt §10:

| Dimension | Champion Baseline | Measurement Method |
|---|---|---|
| Answer usefulness | Unknown (no score) | Human eval or LLM judge |
| Clarification rate | Unknown | Count clarify requests / total turns |
| Response length appropriateness | Unknown | Token count vs complexity signal |
| Structural coherence | Unknown | Singularity coherence score (exists in pipeline) |
| Latency | avg 180ms (memory/system_state.json) | timing in TraceMeta |
| Model cost budget | Unknown | Token count × provider cost |
| Memory relevance | Unknown | Recall hit rate |
| Fallback honesty | Unknown | Log analysis |
| User alignment | Unknown | Explicit feedback mechanism absent |
| Architectural correctness | Unknown | Gate pass rate |

---

## 6. PROMOTION GAP ANALYSIS

For a challenger to beat the champion, these conditions must be met (Super Prompt §10):
- Critical regressions = 0 ← No regression detection exists
- Measurable improvement ← No improvement measurement exists
- Proof pack complete ← Manual proof pack process only
- Rollback clear ← Git revert is rollback, but not formalized per challenger

**Promotion infrastructure needed for Lock #2**:
1. `runtime/stable/challenger-registry.json` — register challengers
2. `src/services/ai/challengerRegistry.ts` — comparison logic
3. Scorecard evaluation function
4. Regression detection (Lane E tests)
5. Promotion gate check

---

## 7. STATUS VERDICT

| Component | Status |
|---|---|
| Champion defined (baseline snapshot) | ✅ DONE (this document) |
| Challenger framework | ❌ NOT IMPLEMENTED |
| Existing evals usable as baseline | ⚠️ PARTIAL (unit tests + 1 profile comparison) |
| Scorecard dimensions | ❌ NOT MEASURED |
| Promotion gate | ❌ NOT IMPLEMENTED |
| Rollback per challenger | ❌ NOT FORMALIZED |

**G_CHAMPION_DEFINED**: PARTIAL (baseline defined here, no registry)
**G_CHALLENGER_FRAMEWORK_READY**: FAIL (not implemented, Lock #2)
**G_PROMOTION_GUARDED**: FAIL (no gate exists)
