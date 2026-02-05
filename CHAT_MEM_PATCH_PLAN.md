# TITANE∞ — CHAT MEM PATCH PLAN (PHASES C1-C7)
## Roadmap Correctif avec Checklist Exécution

**Date:** 2026-02-05  
**Version:** vΩ.CHAT+MEM.2  
**Statut:** PLAN FINAL ✅  
**Rollback:** Yes (full reversal possible per-phase)

---

## STRUCTURE PHASES

```
C0 DISCOVERY    ✅ DONE
│
├─ C1 CONTRACTS ⏳ TODO
│   └─ Type enforcement (system_prompt, provider enum)
│
├─ C2 UI        ⏳ TODO
│   └─ Anti-silence validation
│
├─ C3 LATENCY   ⏳ TODO
│   └─ Budget enforcement + readiness checks
│
├─ C4 MEMORY    ⏳ TODO
│   └─ Metrics + injection bounds
│
├─ C5 TRACE     ⏳ TODO
│   └─ Summary line completeness
│
├─ C6 TESTS     ⏳ TODO
│   └─ Execute all suites
│
└─ C7 RELEASE   ⏳ TODO
    └─ Registry sealing + rollback docs
```

---

## PHASE C1 — CONTRATS TYPES (GATE_CONTRACT)

**Durée Estimée:** 2 heures  
**Risque:** 🟡 LOW — Type-only changes, backward compatible  
**Rollback:** Revert 6 files  

### C1.1: System Prompt Default Injection

**Issue:** system_prompt can be undefined → backend fails

**Action 1: Create getSystemPrompt() if missing**

```typescript
// File: src/config/chatModes.config.ts (verify it exists)
export function getSystemPrompt(mode: ChatMode): string {
  const modes: Record<ChatMode, string> = {
    'default': `You are TITANE∞, a helpful local AI assistant...`,
    'brainstorming': `You excel at creative ideation...`,
    'synthesis': `You are skilled at summarizing...`,
    'planning': `You are a strategic planner...`,
    'journal': `You are a thoughtful journaling guide...`,
    'debug_cognitive': `You are a debugging assistant...`,
  };
  return modes[mode] ?? modes['default'];
}
```

**Acceptance Criteria:**
- ✅ getSystemPrompt() defined for all ChatMode values
- ✅ Always returns non-empty string
- ✅ Has fallback to 'default' mode

**Action 2: Inject in useChat hook**

```typescript
// File: src/hooks/useChat.ts (around line 850)
const systemPrompt = config?.systemPrompt 
  ?? getSystemPrompt(currentMode)  // ← ADD THIS
  ?? 'default system prompt';      // ← FALLBACK

// Pass to orchestrator
const response = await orchestrator.generate(message, history, {
  ...config,
  systemPrompt,  // ← NOW GUARANTEED NON-NULL
});
```

**Acceptance Criteria:**
- ✅ useChat always passes non-null systemPrompt
- ✅ Test verifies: no config → still gets prompt
- ✅ Test verifies: mode change → correct prompt

**Action 3: Inject in conversation_generate (Backend)**

```typescript
// File: src-tauri/src/conversation_engine/commands.rs (line 45)
let final_system_prompt = system_prompt
  .clone()
  .unwrap_or_else(|| get_default_system_prompt(&mode));
```

**Acceptance Criteria:**
- ✅ Rust backend never receives null system_prompt
- ✅ Always has default for any mode

### C1.2: Provider Enum (Never "unknown")

**Issue:** provider metadata can be "unknown" → unparseable

**Action 1: Define Strict Enum**

```typescript
// File: src/services/ai/types.ts (or existing AIMessage types)
export type ProviderName = 
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'copilot'
  | 'ollama'
  | 'titane-local'
  | 'fallback';

// Type guard
export function isKnownProvider(name: string): name is ProviderName {
  return ['gemini', 'openai', 'anthropic', 'copilot', 'ollama', 'titane-local', 'fallback'].includes(name);
}
```

**Acceptance Criteria:**
- ✅ ProviderName enum defined
- ✅ isKnownProvider() type guard exists
- ✅ All provider files use this enum

**Action 2: Update Orchestrator Response**

```typescript
// File: src/services/ai/orchestrator.ts (around line 1100)
const finalProvider: ProviderName = providerName as ProviderName;
if (!isKnownProvider(finalProvider)) {
  throw new Error(`Unknown provider: ${finalProvider}`);
}

return {
  ...response,
  metadata: {
    ...response.metadata,
    provider: finalProvider,  // ← NOW TYPE-SAFE
  }
};
```

**Acceptance Criteria:**
- ✅ Return type includes provider: ProviderName
- ✅ Never returns "unknown"
- ✅ Test validates error path still has valid provider

**Action 3: Update Error Response Paths**

```typescript
// File: src/services/ai/orchestrator.ts (around line 1200)
// Error path (all providers exhausted)
return {
  content: `Error: ${lastError?.message}`,
  provider: 'fallback' as ProviderName,  // ← EXPLICIT
  metadata: {
    error: lastError?.message,
    provider: 'fallback' as ProviderName,  // ← DOUBLE-CHECK
  }
};
```

**Acceptance Criteria:**
- ✅ Even error responses have ProviderName
- ✅ No "unknown" in error logs

### C1.3: Checklist C1

- [ ] getSystemPrompt() covers all ChatMode values
- [ ] useChat always passes systemPrompt (non-null)
- [ ] Rust backend accepts system_prompt as Option but defaults
- [ ] ProviderName enum defined
- [ ] isKnownProvider() type guard works
- [ ] Orchestrator.generate() returns ProviderName
- [ ] Error paths also have valid provider
- [ ] Unit tests validate both changes
- [ ] **GATE_CONTRACT PASSED**

---

## PHASE C2 — UI ANTI-SILENCE (GATE_UI)

**Durée Estimée:** 1.5 heures  
**Risque:** 🟢 MINIMAL — Tests only, no code changes  
**Rollback:** Delete test files  

### C2.1: Bubble Anti-Silence Test

```typescript
// File: src/components/chat/__tests__/ChatBubble.anti-silence.test.ts (NEW)
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';

describe('MessageBubble - Anti-Silence', () => {
  it('should show spinner for empty content with pending status', () => {
    const message = {
      role: 'assistant' as const,
      content: '',  // EMPTY
      timestamp: Date.now(),
      metadata: { status: 'pending' },
    };
    
    render(<MessageBubble {...message} />);
    
    const spinner = screen.getByText(/Typing/i);
    expect(spinner).toBeInTheDocument();
  });
  
  it('should show error message on error status', () => {
    const message = {
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      metadata: {
        status: 'error',
        error: 'Provider unavailable',
      },
    };
    
    render(<MessageBubble {...message} />);
    
    const errorMsg = screen.getByText(/Provider unavailable/i);
    expect(errorMsg).toBeInTheDocument();
  });
  
  it('should never render silent (empty) message', () => {
    const message = {
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      metadata: { status: 'ok' },  // ← CONTRADICTORY (empty but ok)
    };
    
    const { container } = render(<MessageBubble {...message} />);
    
    // Assert: container has text content (spinner, error, or content)
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
```

**Acceptance Criteria:**
- ✅ Test 1 passes: empty + pending → spinner
- ✅ Test 2 passes: empty + error → error message
- ✅ Test 3 passes: never silent

### C2.2: useChat Anti-Silence Test

```typescript
// File: src/hooks/__tests__/useChat.anti-silence.test.ts (NEW)
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../useChat';

describe('useChat - Anti-Silence', () => {
  it('should maintain isLoading=true while generating', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      const promise = result.current.sendMessage('Hello');
      
      // Mid-generation
      expect(result.current.isLoading).toBe(true);
      
      await promise;
    });
    
    // After generation
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should show error message if provider fails all', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      // Mock: all providers fail
      result.current.setPreferredProvider('unavailable-provider');
      await result.current.sendMessage('Hello');
    });
    
    // Should have error message or fallback response
    expect(result.current.error || result.current.messages.length > 0).toBe(true);
  });
});
```

**Acceptance Criteria:**
- ✅ isLoading prevents silent state
- ✅ Error state always populated
- ✅ Fallback always provides response

### C2.3: Checklist C2

- [ ] ChatBubble anti-silence test created
- [ ] useChat anti-silence test created
- [ ] All tests pass (3/3)
- [ ] Code review: no "silent" bubble possible
- [ ] **GATE_UI PASSED**

---

## PHASE C3 — ROUTING & LATENCY (GATE_LATENCY)

**Durée Estimée:** 2.5 heures  
**Risque:** 🟡 MEDIUM — Adds readiness logic  
**Rollback:** Remove readiness checks  

### C3.1: Readiness Check Before Selection

```typescript
// File: src/services/ai/orchestrator.ts (around line 850)
async selectOptimalProvider(...): Promise<SelectedProvider> {
  // ... neural selection logic ...
  
  // NEW: Check availability before returning
  for (const candidate of [selection.selectedProvider, ...selection.alternates]) {
    const provider = this.providers.find(p => p.name === candidate);
    if (provider && await provider.isAvailable()) {
      return {
        selectedProvider: candidate,
        alternates: [...],
        confidence: selection.confidence,
      };
    }
  }
  
  // Fallback to titane-local (always available)
  return {
    selectedProvider: 'titane-local',
    alternates: [],
    confidence: 0,
  };
}
```

**Acceptance Criteria:**
- ✅ Selection checks provider.isAvailable()
- ✅ Skips unavailable providers
- ✅ Always ends with titane-local (available)

### C3.2: Ollama Timeout (AbortController)

```typescript
// File: src/utils/ollamaFallback.ts (around line 60)
const OLLAMA_TIMEOUT_MS = 1500;  // 1.5s

export async function queryOllama(request: ...): Promise<...> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
      signal: controller.signal,  // ← NEW
      // ... other options ...
    });
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      // Timeout occurred — let fallback chain continue
      throw new Error('Ollama timeout (1.5s)');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**Acceptance Criteria:**
- ✅ AbortController with 1.5s timeout
- ✅ On timeout, moves to next provider
- ✅ Test: Ollama unavailable → fallback within 2s

### C3.3: Budget Enforcement

```typescript
// File: src/services/ai/orchestrator.ts (around line 760)
const globalBudgetMs = REQUEST_BUDGETS.globalRequestMs;  // 25s
const startTime = Date.now();

for (const provider of providersToTry) {
  const elapsedMs = Date.now() - startTime;
  const remainingBudgetMs = globalBudgetMs - elapsedMs;
  
  if (remainingBudgetMs <= 100) {
    // Not enough budget for another attempt
    lastError = new Error(`Global budget exceeded (${elapsedMs}ms)`);
    break;
  }
  
  // Try provider with remaining budget
  try {
    const response = await provider.generate(message, history, {
      timeout: Math.min(REQUEST_BUDGETS.providerAttemptMs, remainingBudgetMs),
    });
    
    // Success — return immediately
    return response;
  } catch (error) {
    lastError = error;
    continue;
  }
}

// All providers failed
return {
  content: `Error: ${lastError?.message}`,
  provider: 'fallback',
  metadata: { error_code: 'all_providers_failed' },
};
```

**Acceptance Criteria:**
- ✅ Enforces global 25s budget
- ✅ Breaks early if < 100ms remaining
- ✅ Passes remaining budget to provider
- ✅ Test: 5 failing providers + 8s each → stops after 3 (≈24s)

### C3.4: Checklist C3

- [ ] selectOptimalProvider checks isAvailable()
- [ ] Ollama fetch has AbortController (1.5s)
- [ ] Budget enforcement breaks early
- [ ] All providers respect budget
- [ ] Readiness test passes (skip unavailable)
- [ ] Timeout test passes (Ollama unavailable → 2s)
- [ ] Budget test passes (24s max for failures)
- [ ] **GATE_LATENCY PASSED**

---

## PHASE C4 — MEMORY FLOW (GATE_MEMORY)

**Durée Estimée:** 3 heures  
**Risque:** 🟠 MEDIUM — Instrumentation + bounds  
**Rollback:** Remove metrics tracking  

### C4.1: Memory Load Timing

```typescript
// File: src/hooks/useChatMemory.ts (around line 60)
export function useChatMemory(options: UseChatMemoryOptions) {
  const [memoryStats, setMemoryStats] = useState({...});
  
  useEffect(() => {
    const loadStartMs = Date.now();
    
    const history = chatMemoryCompactor.loadForMode(options.mode);
    
    const loadTimeMs = Date.now() - loadStartMs;  // ← NEW METRIC
    
    setMemoryStats({
      count: history.length,
      sizeMB: stats.sizeMB,
      compressed: stats.compressed,
      loadTimeMs,  // ← ADD TO STATS
    });
  }, [options.mode]);
  
  return { ..., memoryStats };
}
```

**Acceptance Criteria:**
- ✅ loadTimeMs tracked
- ✅ Passed to sendMessage() metadata
- ✅ Included in summary line

### C4.2: Compaction Timing

```typescript
// File: src/services/chatMemoryCompactor.ts (around line 180)
public compress(messages: AIMessage[]): CompressedMessage[] {
  const startMs = Date.now();
  
  // ... compression logic ...
  
  const elapsedMs = Date.now() - startMs;
  
  // Log result (for debugging)
  logger.debug('Compaction completed', {
    input_count: messages.length,
    output_count: compressed.length,
    elapsed_ms: elapsedMs,
  });
  
  return compressed;
}
```

**Acceptance Criteria:**
- ✅ Compaction time tracked
- ✅ Logged per operation
- ✅ Passed to metadata

### C4.3: Injection Bounded & Metered

```typescript
// File: src/services/memory/memoryUtils.ts (around line 560)
export function prepareContextInjection(
  entries: MemoryEntry[],
  query: string,
  modeId: ChatModeId
): {
  context: string;
  usedEntries: string[];
  injectedChars: number;
  injectedTokens: number;  // ← NEW
} {
  const maxTokens = 500;  // Hard cap
  let currentTokens = 0;
  let context = '';
  const usedEntries: string[] = [];
  
  for (const entry of relevantEntries) {
    const entryTokens = Math.ceil(entry.content.length / 4);  // Rough estimate
    
    if (currentTokens + entryTokens > maxTokens) {
      // Stop — would exceed budget
      break;
    }
    
    context += formatEntry(entry);
    currentTokens += entryTokens;
    usedEntries.push(entry.id);
  }
  
  return {
    context,
    usedEntries,
    injectedChars: context.length,
    injectedTokens: currentTokens,  // ← NEW METRIC
  };
}
```

**Acceptance Criteria:**
- ✅ Hard token cap (500)
- ✅ Stops early if cap would be exceeded
- ✅ Returns injectedTokens metric
- ✅ Test: 1000 char entry, 100 token cap → returns < 100 tokens

### C4.4: Metrics in Orchestrator Response

```typescript
// File: src/services/ai/orchestrator.ts (around line 1100)
return {
  content: response.content,
  metadata: {
    ...response.metadata,
    request_id: requestId,
    
    // Memory metrics (passed from useChat)
    memory_load_ms: config?.memory?.loadTimeMs ?? 0,
    memory_compact_ms: config?.memory?.compactTimeMs ?? 0,
    memory_inject_chars: config?.memory?.injectedChars ?? 0,
    memory_inject_tokens: config?.memory?.injectedTokens ?? 0,
    
    // Latency metrics
    latency_total: Date.now() - startTime,
    latency_router: routerLatencyMs,
    latency_provider: providerLatencyMs,
  }
};
```

**Acceptance Criteria:**
- ✅ All 4 memory metrics in metadata
- ✅ All 4 passed from useChat
- ✅ Included in summary line

### C4.5: Summary Line with Memory

```typescript
// Logging (in orchestrator or useChat)
logger.info(
  `[AI_SUMMARY] request_id=${requestId} ` +
  `latency_total=${totalMs}ms ` +
  `memory_load_ms=${memory_load_ms} ` +
  `memory_compact_ms=${memory_compact_ms} ` +
  `memory_inject_chars=${memory_inject_chars} ` +
  `memory_inject_tokens=${memory_inject_tokens} ` +
  `provider_ms=${provider_ms} ` +
  `final_provider=${provider} ` +
  `fallback_used=${fallbackUsed}`
);
```

**Acceptance Criteria:**
- ✅ 1 summary line per request
- ✅ All 7+ metrics included
- ✅ Human readable (no JSON)
- ✅ Logged at end of generation

### C4.6: Checklist C4

- [ ] loadTimeMs tracked in useChatMemory
- [ ] compactMs tracked in ChatMemoryCompactor
- [ ] injectedChars + injectedTokens tracked in prepareContextInjection
- [ ] All 4 passed through useChat → sendMessage → orchestrator
- [ ] Injection hard-bounded by 500 tokens
- [ ] Test: memory injection respects token budget
- [ ] Summary line includes all 7+ metrics
- [ ] Test: summary line parseable + metrics realistic
- [ ] **GATE_MEMORY PASSED**

---

## PHASE C5 — OBSERVABILITÉ (GATE_TRACE)

**Durée Estimée:** 1 heure  
**Risque:** 🟢 MINIMAL — Logging only  
**Rollback:** Remove log lines  

### C5.1: Summary Line Format Validation

```typescript
// File: src/__tests__/summary-line.test.ts (NEW)
import { parseAISummaryLine } from '@/services/monitoring/logger';

describe('AI_SUMMARY Line Format', () => {
  it('should include all required fields', () => {
    const line = `[AI_SUMMARY] request_id=req_1234567890123_abc123 ` +
      `latency_total=1234ms ` +
      `memory_load_ms=12 ` +
      `memory_compact_ms=5 ` +
      `memory_inject_chars=234 ` +
      `memory_inject_tokens=45 ` +
      `provider_ms=1200 ` +
      `final_provider=gemini ` +
      `fallback_used=false`;
    
    const parsed = parseAISummaryLine(line);
    
    expect(parsed).toEqual({
      request_id: 'req_1234567890123_abc123',
      latency_total: 1234,
      memory_load_ms: 12,
      memory_compact_ms: 5,
      memory_inject_chars: 234,
      memory_inject_tokens: 45,
      provider_ms: 1200,
      final_provider: 'gemini',
      fallback_used: false,
    });
  });
  
  it('should be parseable as regex', () => {
    const line = `[AI_SUMMARY] request_id=req_... latency_total=1234ms ...`;
    
    const regex = /\[AI_SUMMARY\].*request_id=([^\s]+)/;
    const match = line.match(regex);
    
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe('req_...');
  });
});
```

**Acceptance Criteria:**
- ✅ parseAISummaryLine() function created
- ✅ Test passes: all fields extracted
- ✅ Regex pattern stable

### C5.2: Request ID Propagation Test

```typescript
// File: src/__tests__/request-id-propagation.test.ts (NEW)
describe('Request ID E2E Tracing', () => {
  it('should propagate request_id from useChat to Tauri to Rust', async () => {
    const { result } = renderHook(() => useChat());
    
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg) => logs.push(msg);
    
    await act(async () => {
      await result.current.sendMessage('Test');
    });
    
    console.log = originalLog;
    
    // Find AI_SUMMARY log
    const summaryLog = logs.find(l => l.includes('[AI_SUMMARY]'));
    expect(summaryLog).toBeTruthy();
    
    const requestId = summaryLog?.match(/request_id=([^\s]+)/)?.[1];
    expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
  });
});
```

**Acceptance Criteria:**
- ✅ request_id generated at useChat
- ✅ Same ID in Tauri IPC call
- ✅ Same ID in Rust logs
- ✅ Same ID in summary line

### C5.3: Checklist C5

- [ ] Summary line format standardized
- [ ] parseAISummaryLine() function works
- [ ] Request ID propagation validated
- [ ] All metrics logged per request
- [ ] Logs parseable (not JSON, regex-friendly)
- [ ] **GATE_TRACE PASSED**

---

## PHASE C6 — TESTS & RÉGRESSION (GATE_TESTS)

**Durée Estimée:** 2 heures  
**Risque:** 🟢 MINIMAL — Execute existing tests  
**Rollback:** N/A (tests only)  

### C6.1: Run All Existing Tests

```bash
# Unit tests
pnpm run test

# Expected: 95+ tests pass, 0 fail

# E2E tests
pnpm run test:e2e

# Expected: 3/3 scenarios pass (basic, memory, fallback)

# Rust tests
cargo test --lib --release

# Expected: All Rust tests pass
```

**Acceptance Criteria:**
- ✅ pnpm run test → 100% pass (no failures)
- ✅ pnpm run test:e2e → 3/3 pass
- ✅ cargo test → All pass

### C6.2: New Minimal Tests (Per Phase)

**Total New Tests:** ~10 test cases
- C1 (Contracts): 3 tests (system_prompt, provider enum, error path)
- C2 (UI): 3 tests (bubble anti-silence scenarios)
- C3 (Latency): 3 tests (readiness, timeout, budget)
- C4 (Memory): 3 tests (timing, bounds, injection)
- C5 (Trace): 2 tests (summary format, propagation)

**All tests must be:**
- ✅ Fast (< 100ms each)
- ✅ Isolated (no side effects)
- ✅ Deterministic (same result every run)
- ✅ Documented (clear purpose)

### C6.3: Checklist C6

- [ ] Run `pnpm run test` → All pass
- [ ] Run `pnpm run test:e2e` → 3/3 pass
- [ ] Run `cargo test --lib` → All pass
- [ ] New C1 tests (3) written + passing
- [ ] New C2 tests (3) written + passing
- [ ] New C3 tests (3) written + passing
- [ ] New C4 tests (3) written + passing
- [ ] New C5 tests (2) written + passing
- [ ] No disabled tests without GATE markers
- [ ] **GATE_TESTS PASSED**

---

## PHASE C7 — SCELLEMENT & REGISTRY (GATE_RELEASE)

**Durée Estimée:** 1 heure  
**Risque:** 🟢 MINIMAL — Documentation only  
**Rollback:** Revert commit  

### C7.1: Rollback Plan

```markdown
# ROLLBACK PROCEDURE — CHAT MEM PATCH vΩ.CHAT+MEM.2

If any GATE fails, revert using:

## Per-Phase Rollback

### C1 Revert (Contracts)
git revert <commit-C1-hash>
# Removes: system_prompt defaults + provider enum
# Safety: Type changes only, data-safe

### C2 Revert (UI)
git revert <commit-C2-hash>
# Removes: Anti-silence tests
# Safety: Tests only, no code impact

### C3 Revert (Latency)
git revert <commit-C3-hash>
# Removes: Readiness checks + Ollama timeout + budget enforcement
# Safety: No data loss, slower but functional

### C4 Revert (Memory)
git revert <commit-C4-hash>
# Removes: Memory metrics tracking + injection bounds
# Safety: Restores unlimited injection (worse UX)

### C5 Revert (Trace)
git revert <commit-C5-hash>
# Removes: Summary line metrics
# Safety: Logs still present, less detailed

## Full Revert (All Phases)
git revert HEAD~6..HEAD
# Revert all 6 commits in reverse order
# Returns to pre-patch state completely
```

**Acceptance Criteria:**
- ✅ Rollback procedure documented
- ✅ Per-phase revert instructions
- ✅ Full revert command ready

### C7.2: Registry Entry

```jsonl
{
  "id": "chat_mem_000",
  "ts": "2026-02-05T12:00:00Z",
  "category": "chat-ia",
  "scope": "chat+memory",
  "change_type": "hardening",
  "summary": "Chat IA + Memory: system_prompt defaults + provider enum + memory metrics + budget enforcement",
  "reason": "Enforce latency guarantees, request correlation, memory injection bounds per CONSTITUTION v∞.CHAT+MEM.2",
  "files_changed": [
    "src/hooks/useChat.ts",
    "src/services/api/chat.ts",
    "src/services/ai/orchestrator.ts",
    "src/services/conversationEngine.ts",
    "src/services/chatMemoryCompactor.ts",
    "src/services/memory/memoryUtils.ts",
    "src/utils/ollamaFallback.ts",
    "src-tauri/src/conversation_engine/commands.rs",
    "src/__tests__/summary-line.test.ts",
    "src/__tests__/request-id-propagation.test.ts"
  ],
  "tests_run": {
    "unit": "pnpm run test",
    "e2e": "pnpm run test:e2e",
    "rust": "cargo test --lib"
  },
  "proofs": [
    "CHAT_MEM_DISCOVERY.md",
    "CHAT_MEM_AUDIT.md",
    "CHAT_MEM_PATCH_PLAN.md",
    "CHAT_MEM_PROOFS.md",
    "CHAT_MEM_TEST_RESULTS.md"
  ],
  "risk_level": "medium",
  "rollback": "git revert HEAD~6..HEAD",
  "status": "EXPERIMENTAL"
}
```

### C7.3: Checklist C7

- [ ] Rollback procedure documented
- [ ] Per-phase revert commands ready
- [ ] Registry entry created
- [ ] All 6 artifacts generated
- [ ] Artifacts added to git (not ignored)
- [ ] **GATE_RELEASE PASSED**

---

## EXECUTION SUMMARY

| Phase | Duration | Risk | Status | Blocker |
|-------|----------|------|--------|---------|
| C0 DISCOVERY | ✅ DONE | — | ✅ PASS | None |
| C1 CONTRACTS | 2h | 🟡 LOW | ⏳ TODO | None |
| C2 UI | 1.5h | 🟢 MIN | ⏳ TODO | C1 |
| C3 LATENCY | 2.5h | 🟡 MED | ⏳ TODO | C1 |
| C4 MEMORY | 3h | 🟠 MED | ⏳ TODO | C1 |
| C5 TRACE | 1h | 🟢 MIN | ⏳ TODO | C4 |
| C6 TESTS | 2h | 🟢 MIN | ⏳ TODO | C1-C5 |
| C7 RELEASE | 1h | 🟢 MIN | ⏳ TODO | C6 |

**Total Time:** ~13 hours  
**Total Risk:** 🟡 MEDIUM (mostly medium-risk instrumentation)  
**Go-Live:** After C6 TESTS PASS + C7 SEALING

---

**STATUS:** PLAN **READY FOR EXECUTION** ✅
