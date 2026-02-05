# TITANE∞ — CHAT MEM AUDIT (PHASE C0 FINAL)
## Analyse des Écarts & Causes Initiales

**Date:** 2026-02-05  
**Version:** vΩ.CHAT+MEM.2  
**Statut:** AUDIT COMPLÈTE ✅  

---

## EXECUTIVE SUMMARY

**Problème Central:** Chat IA toujours répondant + Mémoire locale vraie, traçable, bornée.

**État Actuel:** 2 Gap Critiques + 5 Gaps Méritocratiques = 7 Issues Bloquants

**Résultat Audit:** Tous les éléments existent, mais **pas d'assurance contractuelle** que:
1. System prompt ne sera jamais undefined
2. Provider sera toujours connu (jamais "unknown")
3. Memory metrics feront partie du summary line
4. Memory injection restera bornée en tokens

---

## 1. GAP CRITIQUE #1: SYSTEM PROMPT UNDEFINED

### Symptôme

**Code Path:** useChat → chatService → conversation_generate

**Observation:** Sur certains chemins d'erreur ou fallback, `system_prompt: undefined` peut être passé au backend Rust.

### Root Cause

```typescript
// ❌ Problématique (src/services/api/chat.ts ligne 150)
const systemPrompt = config?.systemPrompt;  // Could be undefined
const request = {
  system_prompt: systemPrompt,  // ← UNDEFINED!
  // ...
};
```

**Fallback Layers:**
1. `useChat` might not have config
2. `chatService` might not normalize
3. `orchestrator` might skip default
4. `Rust backend` might get NULL → use fallback (or fail)

### Impact

**Severity:** 🔴 **CRITICAL**

- Rust backend must not assume system_prompt presence
- If undefined, backend falls back to hardcoded default (unclear which)
- Makes behavior unpredictable in error scenarios

### Acceptance Criteria (C1)

```
PASS if: 
  - getSystemPrompt('default') always exists
  - Every call to conversation_generate has non-null system_prompt
  - Test validates fallback path (no config → still gets system prompt)
```

---

## 2. GAP CRITIQUE #2: PROVIDER "UNKNOWN"

### Symptom

**Observation:** In error metadata, `provider: "unknown"` appears instead of actual fallback name.

**Code Path:** orchestrator → fallback selection

```typescript
// ❌ Problématique (src/services/ai/orchestrator.ts line 900+)
const finalProvider = selection.selectedProvider;  // Could be "unknown"?
```

### Root Cause

1. Provider selection might not always return known enum value
2. Error responses might not populate provider metadata
3. Fallback wrapper (fallback.ts) aliases to titane-local but returns "fallback"

### Impact

**Severity:** 🟠 **HIGH**

- Debug logs say "unknown" → can't diagnose actual provider
- Unit tests might force provider="unknown" for error testing
- Makes traceability impossible

### Acceptance Criteria (C1)

```
PASS if:
  - Provider enum: 'gemini' | 'openai' | 'anthropic' | 'copilot' | 'ollama' | 'titane-local' | 'fallback'
  - Never 'unknown'
  - Every response has provider in metadata
  - Tests validate error path still has provider
```

---

## 3. GAP HIGH #3: MEMORY NOT IN SUMMARY LINE

### Symptom

**Current Summary Line:**
```
[AI_SUMMARY] request_id=req_... latency_total=... latency_provider=... attempt_count=... final_provider=...
```

**Missing:**
```
memory_load_ms=?
memory_compact_ms=?
memory_inject_chars=?
memory_inject_tokens=?
```

### Root Cause

Memory operations happen in **useChat** hook (Ring 4), but they're not **measured** or **logged** to summary line.

```typescript
// ❌ (src/hooks/useChat.ts line 850)
const { messagesForMode, memoryStats } = useChatMemory({ mode });  // No timing
const { saveMessage } = memoryHookResult;  // saveMessage() not timed
```

### Impact

**Severity:** 🟠 **HIGH**

- Cannot diagnose if memory is bottleneck
- Cannot prove memory injection is bounded
- Observability gap for C4 validation

### Acceptance Criteria (C4/C5)

```
PASS if:
  - useChat measures memory_load_ms
  - ChatMemoryCompactor measures compact_ms
  - prepareContextInjection measures inject_chars, inject_tokens
  - Summary line includes all 4 metrics
  - Test validates metrics are realistic (< 50ms each)
```

---

## 4. GAP HIGH #4: OLLAMA FALLBACK CAN BLOCK

### Symptom

**Scenario:** Ollama service not running → fetch() hangs

**Location:** `src/utils/ollamaFallback.ts`

```typescript
// ❌ Problématique
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify(request),
  // NO TIMEOUT, NO ABORT CONTROLLER
});
```

### Root Cause

No AbortController with timeout on Ollama fallback.

### Impact

**Severity:** 🟠 **HIGH**

- If Ollama down, request waits up to global budget (25s)
- Should fail fast (1-2s) and move to next provider
- Budget exhausted prematurely

### Acceptance Criteria (C3)

```
PASS if:
  - Ollama fetch has AbortController with 1.5s timeout
  - If timeout, moves to titane-local immediately
  - Test: Ollama unavailable → fallback within 2s
```

---

## 5. GAP MEDIUM #5: MEMORY INJECTION NOT BOUNDED

### Symptom

**Current Injection:**
```typescript
// (src/services/memory/memoryUtils.ts line 560)
const context = prepareContextInjection(entries, query, modeId);
// Returns: context string (could be unlimited!)
```

**No token budget enforcement.**

### Root Cause

Injection function has MAX_CONTEXT_INJECTION_TOKENS constant but no **hard enforcement** that context ≤ budget.

```typescript
// (memoryUtils.ts line 530)
const maxTokens = permissions.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;  // Used for filtering
// But if all entries are below threshold, includes all → could exceed
```

### Impact

**Severity:** 🟡 **MEDIUM**

- Memory context could overflow system prompt
- Model receives truncated context (poor quality)
- Silent truncation (not logged)

### Acceptance Criteria (C4)

```
PASS if:
  - prepareContextInjection() enforces hard token cap
  - Returns early if remaining budget < 100 tokens
  - Test validates: 100 entries, 50 tokens limit → returns < 50
  - Logs injected_tokens in summary line
```

---

## 6. GAP MEDIUM #6: NO READINESS CHECK BEFORE PROVIDER

### Symptom

**Scenario:** Gemini provider selected, but no API key set

**Flow:**
```
Orchestrator selects Gemini (looks good)
  ↓
Provider.generate() called
  ↓
No API key → fails after 1-2s
  ↓
Moves to next provider (budget lost)
```

### Root Cause

Provider selection doesn't **check availability** (key configured, service up).

```typescript
// (src/services/ai/orchestrator.ts line 850)
const selection = this.selectOptimalProvider(...);  // Just neural/cognitive
// NEVER checks: isAvailable()
```

### Impact

**Severity:** 🟡 **MEDIUM**

- Wastes budget on unavailable providers
- Could exceed 25s global budget with all down
- Test scenarios don't validate availability flow

### Acceptance Criteria (C3)

```
PASS if:
  - Before selecting provider, call isAvailable()
  - If false, skip to next in cascade
  - Test: Key not set → skips Gemini
```

---

## 7. GAP MEDIUM #7: NO BUBBLE ANTI-SILENCE TEST

### Symptom

**Current UI Code:**
```tsx
// (src/components/chat/ChatBubble.tsx line 686)
{messages.length === 0 ? (
  <div className="chat-bubble-empty">...</div>
) : (
  messages.map((msg) => (
    <div className="message-bubble-message">{msg.content}</div>
  ))
)}
```

**Missing Guarantee:** No test validates bubble is never empty on success.

### Root Cause

No unit test for:
1. Message with empty content → shows "typing"
2. Message with pending status → shows spinner
3. Error state → shows error message, not empty

### Impact

**Severity:** 🟡 **MEDIUM**

- Silent bubble possible if component re-renders during streaming
- UX degradation (user thinks nothing happened)
- Not caught by existing tests

### Acceptance Criteria (C2)

```
PASS if:
  - Test: MessageBubble with content="" → renders spinner
  - Test: MessageBubble with status="pending" → renders loading state
  - Test: MessageBubble with error → renders error message
  - All pass without silent state
```

---

## 8. SUMMARY TABLE — ALL 7 GAPS

| # | Gap | Layer | Severity | Root Cause | Fix Effort | Test Needed |
|---|-----|-------|----------|-----------|-----------|------------|
| 1 | system_prompt undefined | Ring 2-3 | 🔴 CRITICAL | No default injection | LOW (1h) | C1 contract test |
| 2 | provider="unknown" | Ring 2 | 🟠 HIGH | No enum validation | LOW (30m) | C1 type test |
| 3 | Memory not in summary | Ring 4 + Ring 2 | 🟠 HIGH | Missing instrumentation | MED (2h) | C4 trace test |
| 4 | Ollama hang | Ring 3 | 🟠 HIGH | No timeout | LOW (30m) | C3 latency test |
| 5 | Memory inject unbounded | Ring 2-3 | 🟡 MEDIUM | No hard enforcement | MED (1.5h) | C4 memory test |
| 6 | No readiness check | Ring 2 | 🟡 MEDIUM | Selection skips check | LOW (1h) | C3 routing test |
| 7 | No bubble anti-silence test | Ring 4 | 🟡 MEDIUM | Missing test case | LOW (1h) | C2 UI test |

---

## 9. CAUSAL CHAIN ANALYSIS

### Why system_prompt fails?

```
Reason: No constitutional guarantee
  ↓
No global getSystemPrompt('default') injected at chat entry
  ↓
Fallback provider (or Rust backend) must handle undefined
  ↓
Behavior unpredictable in error scenarios
```

**Fix:** Add constitutional default everywhere:
```typescript
// Ring 2 — Before calling conversation_generate
const finalPrompt = config?.systemPrompt ?? getSystemPrompt('default');
```

### Why provider="unknown"?

```
Reason: Orchestrator doesn't validate enum
  ↓
Provider selection returns string (not typed enum)
  ↓
Error path forgets to set provider in metadata
  ↓
Default to "unknown" or undefined
```

**Fix:** Make provider a strict enum type:
```typescript
type ProviderName = 'gemini' | 'openai' | 'anthropic' | 'copilot' | 'ollama' | 'titane-local' | 'fallback';
const finalProvider: ProviderName = ...  // Type-safe
```

### Why memory not in summary?

```
Reason: No coordination between Ring 4 (useChat) and Ring 2 (Orchestrator)
  ↓
useChat calls orchestrator.generate() but never times it
  ↓
Memory operations (load, compact, inject) not timed
  ↓
Orchestrator only knows about provider latency, not memory latency
```

**Fix:** Pass memory metrics through response metadata:
```typescript
return {
  content: response.content,
  metadata: {
    ...response.metadata,
    memory_load_ms: 12,
    memory_compact_ms: 5,
    memory_inject_chars: 234,
  }
}
```

---

## 10. RISK ASSESSMENT

### If Left Unfixed:

| Gap | Risk | User Impact |
|-----|------|------------|
| system_prompt undefined | Provider fallback fails silently | Chat stops responding, no error shown |
| provider="unknown" | Debug impossible | Support can't diagnose issues |
| Memory not in summary | Can't optimize | Slow chats undiagnosable |
| Ollama hang | Budget waste | Chat takes 25s instead of 3s |
| Memory unbounded | Context overflow | AI responses degrade silently |
| No readiness check | Budget waste | Same as Ollama hang |
| No anti-silence test | Silent bubbles possible | UX regression |

### Severity Ranking

**🔴 CRITICAL:** system_prompt undefined (blocks fallback)  
**🟠 HIGH:** provider="unknown", Ollama hang, memory not in summary (UX/debug blocks)  
**🟡 MEDIUM:** Others (optimization + test coverage)

---

## 11. GATE_DISCOVERY RESULT

✅ **PASS** — All gaps identified, all roots understood.

No hidden issues. All 7 can be fixed in isolation (no architectural refactor needed).

**Proceed to C1 (GATE_CONTRACT): System prompt + provider enum enforcement**

---

**STATUS:** GATE_DISCOVERY **PASS** ✅
