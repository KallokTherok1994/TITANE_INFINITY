# TITANE∞ — CHAT MEM DISCOVERY (PHASE C0)
## Cartographie Exhaustive Chat IA + Mémoire Locale

**Date:** 2026-02-05  
**Version:** vΩ.CHAT+MEM.2  
**Statut:** DISCOVERY COMPLÈTE ✅  
**Gatekeeper:** GATE_DISCOVERY (PASS)

---

## 📋 TABLE DES MATIÈRES

1. **Composants UI Chat**
2. **Hooks Chat**
3. **Services Chat**
4. **Engine Routing & Fallback**
5. **Memory Stack (Storage, Compaction, Injection)**
6. **IPC Commands (Allowlist)**
7. **Tests Existants**
8. **Observations Critiques**

---

## 1. COMPOSANTS UI CHAT

### 1.1 Chat Bubbles & Messages

| Fichier | Ring | Rôle | Statut |
|---------|------|------|--------|
| `src/components/chat/ChatBubble.tsx` | 4 (UI) | Bulle flottante omniprésente, gestion état local | ✅ PRODUIT |
| `src/components/chat/MessageBubble.tsx` | 4 (UI) | Affichage 1 message avec reactions | ✅ PRODUIT |
| `src/components/chat/MessageListOptimized.tsx` | 4 (UI) | Liste virtualisée (50+ messages) | ✅ OPTIMISÉ |
| `src/components/AIChatBubble.tsx` | 4 (UI) | Wrapper legacy (deprecated) | ⚠️ LEGACY |
| `src/components/ChatWindow.tsx` | 4 (UI) | Conteneur chat | ✅ PRODUIT |

**Key Props:**
- `message.role` : 'user' | 'assistant' | 'system'
- `message.content` : string (never empty on success)
- `message.metadata?.provider` : enum (gemini, openai, ollama, fallback, etc.)
- `message.metadata?.status` : 'pending' | 'streaming' | 'ok' | 'error'
- `message.metadata?.uiId` : unique for rendering

**Anti-Silence Mechanics:**
- Empty message → show "Typing..." spinner
- Timeout state → show error message
- Never render silent bubble

### 1.2 Chat Input & Toolbar

| Fichier | Ring | Rôle | Statut |
|---------|------|------|--------|
| `src/components/chat/ChatInput.tsx` | 4 (UI) | Input field, send handler | ✅ PRODUIT |
| `src/components/chat/ChatToolbar.tsx` | 4 (UI) | Mode selector, export, clear | ✅ PRODUIT |
| `src/components/chat/ChatModeSelector.tsx` | 4 (UI) | Mode selection UI | ✅ PRODUIT |

**Status:** UI ready, no missing states detected.

### 1.3 Main Chat Page

| Fichier | Ring | Rôle | Statut |
|---------|------|------|--------|
| `src/ui/pages/Chat.tsx` | 4 (UI) | Main page entry point | ✅ PRODUIT |
| `src/components/sections/ConversationSection.tsx` | 4 (UI) | Extracted chat section (v25.3.0) | ✅ REFACTORISÉ |

**Composition:**
```
Chat.tsx
├─ useChat() hook
├─ ChatInput
├─ VirtualizedMessageList (or fallback)
├─ ChatToolbar
└─ ConversationSection (TTS, export, health)
```

---

## 2. HOOKS CHAT (CORE LOGIC)

### 2.1 Main Hook: useChat()

**Fichier:** `src/hooks/useChat.ts` (2200+ LOC)

**Responsabilités:**
- State: messages[], input, isLoading, error, mode
- Actions: sendMessage(), clearChat(), setMode()
- Memory integration: useChatMemory() hook
- Provider readiness tracking
- Debug info export

**Key Interface:**
```typescript
interface UseChatReturn {
  // State
  messages: AIMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  currentMode: ChatMode;
  
  // Memory
  messagesForMode: AIMessage[];
  memoryStats: { count, sizeMB, compressed };
  
  // Provider
  preferredProvider: string;
  lastProvider: string;
  providerReadiness: Record<string, boolean>;
  
  // Actions
  sendMessage: (content: string) => Promise<AIMessage>;
  handleSend: () => Promise<void>;
  setMode: (mode: ChatMode) => void;
  clearChat: () => void;
  
  // Debug
  getDebugInfo: () => object;
  exportChat: () => string;
}
```

**Integration Points:**
- ✅ useChatMemory() for persistence
- ✅ useConversationEngine() for backend
- ✅ chatMemoryCompactor for compression
- ✅ Request ID generation + propagation

### 2.2 Memory Hook: useChatMemory()

**Fichier:** `src/hooks/useChatMemory.ts` (190+ LOC)

**Responsabilités:**
- Load/save by ChatMode
- Auto-compact if needed
- XP attribution (backend sync)

**Key Interface:**
```typescript
interface UseChatMemoryReturn {
  messagesForMode: AIMessage[];
  memoryStats: { count, sizeMB, compressed };
  
  loadHistory: () => AIMessage[];
  saveMessage: (msg: AIMessage) => void;
  clearMode: () => void;
  compactIfNeeded: () => CompactResult;
  awardXP: (domain, amount) => Promise<void>;
}
```

### 2.3 UI-Only Hook: useChatUI()

**Fichier:** `src/hooks/useChatUI.ts` (150+ LOC)

**Responsabilité:** Pure UI state (messages, input, error, suggestions)  
**IA Logic:** ZERO — no ChatEngine, no orchestrator  
**Isolation:** Strict (can be tested independently)

### 2.4 Other Hooks

| Hook | Location | Purpose | Isolation |
|------|----------|---------|-----------|
| `useConversationEngine()` | `src/hooks/useConversationEngine.ts` | Backend conversation lifecycle | Ring 3 (Services) |
| `useMemoryEngine()` | `src/hooks/useMemoryEngine.ts` | Memory CRUD operations | Ring 3 (Services) |
| `useAudioSettings()` | `src/hooks/useAudioSettings.ts` | Audio/TTS config | Ring 3 (Services) |

---

## 3. SERVICES CHAT (RING 2 — ORCHESTRATION)

### 3.1 Core Orchestrator

**Fichier:** `src/services/ai/orchestrator.ts` (1100+ LOC)

**Responsabilité:** Provider routing, fallback cascade, budget tracking

**Key Functions:**
```typescript
async generate(
  message: string,
  history: AIMessage[],
  config?: AIConfig
): Promise<AIResponse>
```

**Flow:**
1. Request ID generation: `req_${Date.now()}_${random}`
2. Global budget check: `REQUEST_BUDGETS.globalRequestMs` (25s)
3. Provider selection (neural + cognitive)
4. Cascade: [primary, alternates..., titane-local]
5. Summary log: `[AI_SUMMARY] request_id=... latency_total=... ...`

**Fallback Chain:**
```
Gemini Cloud (8s)
  ↓ (fail)
OpenAI (8s)
  ↓ (fail)
Claude/Anthropic (8s)
  ↓ (fail)
Ollama Local (8s)
  ↓ (fail)
titane-local (infaillible)
  ↓
RESPONSE GUARANTEED
```

### 3.2 Chat Service

**Fichier:** `src/services/api/chat.ts`

**Responsabilité:** Frontend ↔ Tauri bridge

**Key Functions:**
```typescript
async sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse>
```

**Implements:**
- Request ID propagation
- System prompt normalization
- Budget enforcement
- Summary log capture

### 3.3 Conversation Engine (Ring 3 Wrapper)

**Fichier:** `src/services/conversationEngine.ts`

**Responsabilité:** Multi-conversation lifecycle

**Key Functions:**
```typescript
async generate(
  prompt: string,
  conversationId: string,
  options?: ConversationConfig
): Promise<ConversationResponse>
```

**Stores conversations in Ring 1 (localStorage or Rust backend)**

### 3.4 ConversationManager

**Fichier:** `src/services/ai/ConversationManager.ts`

**Responsabilité:** Singleton manager for multi-conversation

**Implements:**
- Conversation creation/deletion
- Message history per conversation
- Provider routing per conversation
- Memory injection per conversation

---

## 4. ENGINE ROUTING & FALLBACK

### 4.1 Provider List (Real Implementations)

| Provider | Type | Location | Status | Availability |
|----------|------|----------|--------|--------------|
| `gemini` | Cloud | `src/services/ai/providers/gemini.ts` | ✅ | Requires API key |
| `openai` | Cloud | `src/services/ai/providers/openai.ts` | ✅ | Requires API key |
| `anthropic` | Cloud | `src/services/ai/providers/anthropic.ts` | ✅ | Requires API key |
| `copilot` | Cloud | `src/services/ai/providers/copilot.ts` | ✅ | GitHub token |
| `ollama` | Local | `src/services/ai/providers/ollama.ts` | ✅ | Local server |
| `titane-local` | Local | `src/services/ai/providers/titaneLocal.ts` | ✅ INFAILLIBLE | Always OK |
| `fallback` (WRAPPER) | Fallback | `src/services/ai/providers/fallback.ts` | ✅ | Redirects to titane-local |

### 4.2 Orchestrator Decision Logic (Simplified)

```
IS_VITEST? 
  → Use forced provider (deterministic)
  
preferredProvider !== 'auto'?
  → Use preferred (cognitive decision skipped)
  
Cognitive Confidence > 70%?
  → Use cognitive choice
  
ELSE:
  → Use neural selection (RACETRACK)
```

### 4.3 Rust Backend (Tauri)

**Location:** `src-tauri/src/conversation_engine/`

**Key Command:** `conversation_generate`

**Request Payload:**
```rust
pub struct OmegaGenerateArgs {
    pub message: String,
    pub conversation_id: String,
    pub mode: Option<String>,
    pub provider: Option<String>,
    pub system_prompt: Option<String>,
    pub request_id: Option<String>,  // v∞ — End-to-end tracing
}
```

**Response Payload:**
```rust
pub struct OmegaGenerateResponse {
    pub content: String,
    pub provider_used: String,
    pub fallback_used: bool,
    pub metadata: {
        pub request_id: String,
        pub latency_total_ms: u64,
        pub provider_latency_ms: u64,
    }
}
```

---

## 5. MEMORY STACK (LOCAL-FIRST)

### 5.1 Storage Layer

**Fichier:** `src/services/chatMemoryCompactor.ts` (360+ LOC)

**Responsibility:** Load/save to localStorage with compression

**Key Data Structure:**
```typescript
interface ModeMemory {
  mode: ChatMode;                    // 'default', 'brainstorming', etc.
  messages: AIMessage[];             // Raw conversation history
  compressed: CompressedMessage[];   // Summarized entries
  lastCompacted: number;             // Timestamp
}
```

**Storage Keys:**
```
localStorage['titane_chat_mode_default']     → ModeMemory JSON
localStorage['titane_chat_mode_brainstorming'] → ModeMemory JSON
...
```

**Compaction Thresholds:**
```typescript
const COMPRESSION_THRESHOLD = 30;   // Compact if > 30 messages
const COMPRESSION_TARGET = 20;      // Keep 20 after compress
```

### 5.2 Compaction Algorithm (Deterministic)

**Location:** `ChatMemoryCompactor.compress()`

**Input:** `messages: AIMessage[]`

**Process:**
1. Group by conversation turn (user ↔ assistant pairs)
2. Summarize long turns (merge 3+ into 1)
3. Keep metadata (provider, timestamp, uiId)
4. Sort by timestamp (ascending)

**Output:** `compressed: CompressedMessage[]`

**Guarantee:** DETERMINISTIC (same input → same output)

### 5.3 Injection (Context Enhancement)

**Location:** `src/services/memory/memoryUtils.ts`

**Function:** `prepareContextInjection()`

**Input:**
- `entries: MemoryEntry[]` (all memory entries)
- `query: string` (user question)
- `modeId: ChatModeId` (current mode)

**Process:**
1. Filter by permissions
2. Score by relevance
3. Truncate to token budget
4. Format for system prompt injection

**Output:**
```typescript
{
  context: string,           // Ready to inject in prompt
  usedEntries: string[],     // IDs used
  tokenCount: number,        // Actual tokens consumed
}
```

### 5.4 Memory Stores

| Store | Location | Purpose | Scope |
|-------|----------|---------|-------|
| `useMemoryEngineStore` | `src/stores/useMemoryEngineStore.ts` | Global memory state (Zustand) | All features |
| `useChatMemory` | Hook | Per-mode message history | Chat only |
| localStorage | Browser | Persistent ModeMemory JSON | Durable |
| Rust backend | Tauri | Encrypted persistent conversations | Optional |

---

## 6. IPC COMMANDS (ALLOWLIST)

### 6.1 Core Chat Commands

**Location:** `src-tauri/src/conversation_engine/commands.rs`

| Command | Input | Output | Allowed | Version |
|---------|-------|--------|---------|---------|
| `conversation_generate` | OmegaGenerateArgs | OmegaGenerateResponse | ✅ | v∞ |
| `conversation_reset` | conversation_id | void | ✅ | v∞ |
| `conversation_list` | mode? | Vec<ConversationSummary> | ✅ | v∞ |
| `conversation_delete` | conversation_id | void | ✅ | v∞ |

### 6.2 Memory Commands

| Command | Input | Output | Allowed |
|---------|-------|--------|---------|
| `memory_save` | (mode, messages) | void | ✅ |
| `memory_load` | mode | Vec<AIMessage> | ✅ |
| `memory_compact` | mode | CompactResult | ✅ |
| `memory_get_stats` | void | MemoryStats | ✅ |

### 6.3 Provider Status Commands

| Command | Input | Output | Allowed |
|---------|-------|--------|---------|
| `get_gemini_key_status` | void | KeyStatus | ✅ |
| `get_openai_key_status` | void | KeyStatus | ✅ |
| `get_anthropic_key_status` | void | KeyStatus | ✅ |
| `get_copilot_key_status` | void | KeyStatus | ✅ |
| `chat_get_providers_status` | void | Map<String, bool> | ✅ |

**Status Cache:** 30s TTL + singleflight + exponential backoff

### 6.4 Allowlist Validation

**File:** `src-tauri/src/commands/security.rs`

**Current Status:** ✅ CLEAN (no unauthorized commands exposed)

---

## 7. TESTS EXISTANTS

### 7.1 Unit Tests

| Test File | Suite | Coverage | Status |
|-----------|-------|----------|--------|
| `src/__tests__/cloud-agent-timeout-config.test.ts` | Timeout config | REQUEST_BUDGETS | ✅ PASS |
| `src/__tests__/useChat.test.ts` | useChat hook | Core logic | ✅ PASS |
| `src/__tests__/chatMemoryCompactor.test.ts` | Compactor | Compression algo | ✅ PASS |

### 7.2 Integration Tests

| Test File | Suite | Coverage | Status |
|-----------|-------|----------|--------|
| `tests/contract/tauri-ipc-contract.test.ts` | IPC Contract | Command mapping | ✅ PASS |
| `src/services/ai/__tests__/orchestrator.test.ts` | Orchestrator | Routing logic | ✅ PASS |

### 7.3 E2E Tests (Playwright)

| Scenario | Location | Coverage | Status |
|----------|----------|----------|--------|
| Basic chat flow | `tests/e2e/chat.e2e.ts` | Send message → Response | ⏳ PENDING RUN |
| Memory persistence | `tests/e2e/memory.e2e.ts` | Save → Load → Compact | ⏳ PENDING RUN |
| Fallback cascade | `tests/e2e/fallback.e2e.ts` | Provider unavailable → fallback | ⏳ PENDING RUN |

---

## 8. OBSERVABILITÉ ACTUELLE

### 8.1 Request ID Tracing

**Generated:** `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

**Propagation Path:**
```
useChat.sendMessage()
  → chatService.sendChatMessage()
    → conversation_generate (IPC)
      → Rust ConversationEngineState
        → AI Provider
          → Response logged
```

**Summary Line Format:**
```
[AI_SUMMARY] request_id=req_1738761234567_a3b4c5 
            latency_total=1234ms 
            latency_router=45ms 
            latency_provider=1189ms 
            attempt_count=1 
            final_provider=gemini 
            fallback_used=false
```

### 8.2 Missing Observability

❌ **memory_load_ms** — not tracked  
❌ **memory_compact_ms** — not tracked  
❌ **memory_inject_chars** — not tracked  
❌ Unified summary line for memory events

---

## 9. OBSERVATIONS CRITIQUES (GATE_DISCOVERY)

### 9.1 ✅ RÉUSSIS

- Chat UI anti-silence mechanics in place (empty → spinner, error → message)
- Request ID propagation functional (req_X end-to-end)
- Fallback cascade implemented (6-provider chain)
- Memory compaction deterministic (tested)
- IPC allowlist clean (no unauthorized surface)
- Budget enforcement exists (REQUEST_BUDGETS)

### 9.2 ⚠️ GAPS DÉTECTÉS

| Gap | Impact | Severity | Owner |
|-----|--------|----------|-------|
| Memory metrics not in summary line | Cannot diagnose memory bottlenecks | 🔴 CRITICAL | C4 |
| system_prompt can be undefined on error paths | Fallback provider gets null prompt | 🟠 HIGH | C1 |
| provider enum not enforced at type level | "unknown" values still possible | 🟠 HIGH | C1 |
| No test for UI bubble anti-silence | Silent state not validated | 🟡 MEDIUM | C2 |
| Memory injection not bounded by token count | Could exceed context window | 🟡 MEDIUM | C4 |
| Ollama fallback can timeout (no AbortController) | May hang 60+ seconds | 🟠 HIGH | C3 |
| No readiness check before provider selection | Wastes budget on unavailable providers | 🟡 MEDIUM | C3 |

### 9.3 ARCHITECTURE COMPLIANCE

✅ **4-Ring Structure Intact**
- Ring 1 (Core): Types, constants
- Ring 2 (Engines): Orchestrator, memory
- Ring 3 (Services): Chat, conversation
- Ring 4 (UI): React components

✅ **Ring Isolation:**
- Hooks (Ring 4) → Services (Ring 3) ✅
- Services (Ring 3) → Engines (Ring 2) ✅
- Engines (Ring 2) → Core (Ring 1) ✅
- Reverse imports: **NONE DETECTED**

---

## 10. CARTOGRAPHIE COMPLÈTE (TABLE RÉSUMÉE)

| Component | Ring | File | Status | Rôle |
|-----------|------|------|--------|------|
| ChatBubble | 4 | chat/ChatBubble.tsx | ✅ | UI message display |
| useChat | 4 | hooks/useChat.ts | ✅ | Main chat logic hook |
| useChatMemory | 4 | hooks/useChatMemory.ts | ✅ | Memory persistence |
| ChatMemoryCompactor | 3 | services/chatMemoryCompactor.ts | ✅ | Compression engine |
| Orchestrator | 2 | services/ai/orchestrator.ts | ✅ | Provider routing |
| ConversationEngine | 3 | services/conversationEngine.ts | ✅ | Backend wrapper |
| conversation_generate | Backend | commands.rs | ✅ | Tauri IPC |
| MemoryContextEngine | Backend | memory_context.rs | ✅ | Rust memory |
| AIMessage Type | 1 | types/AIMessage.ts | ✅ | Type contract |
| ChatMode Type | 1 | types/ChatMode.ts | ✅ | Mode enum |

---

## 11. PROCHAINES ÉTAPES (PHASES C1-C7)

- **C1 CONTRACTS:** System prompt required, provider enum enforced
- **C2 UI ANTI-SILENCE:** Tests for empty bubble prevention
- **C3 LATENCY:** Budget enforcement, readiness checks
- **C4 MEMORY:** Metrics tracking, injection bounds
- **C5 TRACE:** Summary line completeness
- **C6 TESTS:** Run all suites, add minimums
- **C7 RELEASE:** Registry sealing, rollback

---

**STATUS:** GATE_DISCOVERY **PASS** ✅

Tous les composants critiques sont cartographiés sans hypothèse.  
Prêt pour PHASE C1 (GATE_CONTRACT).
