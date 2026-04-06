# MODEL_SELECTION_MAP — TITANE∞
## Discovery Document: Current Model/Provider Selection Reality
### Date: 2026-03-26 | Lock: #1 Boot Truth

---

## A) EXEC_MODE: CERTIFY (read-only discovery, no patches)
## B) STATUS: REAL_STATE — no hallucination

---

## 1. PROVIDER SELECTION (Active)

**File**: `src/services/ai/orchestrator.ts:590`
**Function**: `selectOptimalProvider(message, context, conversationHistory)`

### Provider List and Base Scores (auto mode)

| Provider | Base Score | Class | Notes |
|---|---|---|---|
| titane-local | 0 | LOCAL_KERNEL | Emergency fallback, never fails |
| tauri-backend | 20 | LOCAL_RUST | Rust ChatEngine cascade |
| ollama | 30 (+200 if local mode) | LOCAL_LLM | gemma2:2b default |
| gemini | 40 | CLOUD | gemini-2.0-flash-exp default |
| openai | 45 | CLOUD | gpt-4o default |
| copilot | 42 | CLOUD | GitHub Copilot |
| claude | 50 | CLOUD | claude-3-5-sonnet default |

### Scoring Factors Applied Per Turn

1. **Explicit override** — `preferredProvider === 'local'` → forces ollama
2. **Cloud bonuses** — complex query (+15-35) or long context (+15-25) boosts cloud providers
3. **Metrics adjustment** — recent success >95% + latency <3s: +15; latency >10s: -20; success <70%: -30
4. **Recovery boost** — unused >10s with no failures: +1/10s (max +20)
5. **Message complexity** — `messageLength > 200 || contextLength > 5000` = isComplexQuery
6. **Recent failure penalty** — failed <30s ago: -25
7. **Diversity penalty** — same provider used <2s ago: -20
8. **Concurrency penalty** — request queue full: -20 (not for titane-local)

### Selection Reason Codes (existing)
- `'optimal'` — score > 80
- `'fallback'` — 60 < score ≤ 80
- `'availability'` — score ≤ 60
- `'recovery'` — diversity forcing

---

## 2. MODEL-CLASS SELECTION (Missing)

**Status**: DOES NOT EXIST

The Super Prompt requires:
- HAIKU class → fast classification, routing pre-pass, cheap summaries
- SONNET class → daily implementation, standard coding, normal refactors
- OPUS class → architecture, contradiction handling, deep synthesis

**Current reality**:
- Each provider has ONE hardcoded default model (gemini-2.0-flash-exp, gpt-4o, claude-3-5-sonnet)
- No logic selects Haiku vs Sonnet vs Opus based on task complexity
- No model-class abstraction exists
- Model is selected by choosing the provider, not by choosing a model class

**Gap**: No model-class routing. Lock #1 will add `modelClass` field to `TraceMeta` as metadata, but will NOT change provider selection algorithm. That is Lock #2.

---

## 3. EFFORT SELECTION (Partially Defined, Not Wired)

**File**: `src/services/ai/responsePolicy.ts:86`
```typescript
reasoningEffort: 'low' | 'medium' | 'high'
```

- Defined in ResponseProfile system
- DIRECT: low | BALANCED: medium | DEEP: high | ARCHITECT: high
- **Not consumed by any provider** — this field is defined but no provider reads it
- No `max` effort level exists in current profiles (Lock #1 will define it in classifier output)

---

## 4. BACKEND AI ROUTER (Rust)

**File**: `src-tauri/src/ai/router.rs`

```rust
enum AIRouterStatus { Online, Offline, Degraded }
```

Three-cascade strategy:
1. Check cache → return if hit
2. UnifiedIA (Claude/OpenAI Tauri commands)
3. Gemini direct API
4. Ollama local
5. Error propagation

This router is invoked from within `pipeline.rs` via `generate_ai_response()`.
It selects provider by availability, not by model class or task complexity.

---

## 5. TIMEOUTS (Active Configuration)

**File**: `src/config/aiTimeouts.config.ts`

| Provider | Timeout |
|---|---|
| titane-local | 5,000ms |
| tauri-backend | 50,000ms |
| ollama | 45,000ms |
| gemini/openai/claude | 30,000ms each |
| Global budget | 52,000ms |
| Max attempts | 2 |

---

## 6. MODEL PER PROVIDER (Current Defaults)

| Provider | Default Model | Source |
|---|---|---|
| claude | claude-3-5-sonnet | provider config |
| openai | gpt-4o | provider config |
| gemini | gemini-2.0-flash-exp | `src/services/ai/providers/gemini.ts:46` |
| ollama | gemma2:2b (or VITE_OLLAMA_MODEL) | `src/services/ai/providers/ollama.ts:33` |
| glm46v | THUDM/glm-4v-9b | `src/services/ai/providers/glm46v.ts` |
| titane-local | titane-local-v19.2Ω | hardcoded |

---

## 7. STATUS VERDICT

| Surface | Status |
|---|---|
| Provider selection active | ✅ YES (neural scoring) |
| Provider selection emits reason_code | ✅ YES (optimal/fallback/availability/recovery) |
| Model-class selection (Haiku/Sonnet/Opus) | ❌ ABSENT |
| Effort level consumed by providers | ❌ ABSENT |
| Task complexity → provider mapping | ⚠️ PARTIAL (crude: length > 200 = complex) |
| Model class in response trace meta | ❌ ABSENT |
| Long-context selection rule | ❌ NOT IMPLEMENTED |

**G_MODEL_SELECTION_REAL**: PARTIAL (provider selection works, model-class absent)
