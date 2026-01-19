# 🚀 P3 Issues & File Decomposition Strategy

**Document:** Roadmap for medium-priority refactoring and code quality improvements  
**Version:** v26.4.1  
**Status:** Reference document for v27.0 sprint planning  
**Last Updated:** 2026-01-17  

---

## P3 Issues Summary

Following the comprehensive **AUDIT_CHAT_IA_COMPLET_v26.4.1.md** audit, the following P3 (medium-priority) items have been identified for the v27.0 refactoring sprint:

- **P3-1:** Large file structure (chatEngine.ts - 2013 lines)
- **P3-2:** Large backend module (chat_orchestrator.rs - 2194 lines)
- **P3-3:** Complex hook implementation (useChat.ts - 2000+ lines)
- **P3-4:** Provider cascade logic (needs trait abstraction)
- **P3-5:** Test file organization (inline vs integration)

---

## P3-1: Large Frontend Module (chatEngine.ts)

### Current State
- **File:** `src/lib/ai/chatEngine.ts`
- **Size:** 2,013 lines
- **Impact:** 
  - Code maintainability ⚠️
  - Harder to locate functions
  - Longer TypeScript compilation cycles
  - Difficult to test individual concerns

### Proposed Decomposition

```
src/lib/ai/
├── chatEngine/
│   ├── index.ts              (40 lines)  - Public exports
│   ├── core.ts               (500 lines) - Core message routing
│   ├── providers.ts          (600 lines) - Provider abstraction layer
│   ├── streaming.ts          (300 lines) - Streaming response handling
│   ├── validation.ts         (200 lines) - Security validation (XSS/SQL/injection)
│   └── utils.ts              (200 lines) - Helper functions (formatting, parsing)
└── chatEngine.ts (deprecated) → re-export from index.ts for backwards compat
```

### Benefits
- ✅ **Maintainability:** Each module handles one concern
- ✅ **Testing:** Isolated unit tests per module
- ✅ **Performance:** Faster TS compilation (modular)
- ✅ **Readability:** ~300-600 lines per file (industry standard)

### Migration Path
```typescript
// Before (current)
import { sendMessage, validateInput } from './lib/ai/chatEngine';

// After (v27.0)
import { sendMessage } from './lib/ai/chatEngine/core';
import { validateInput } from './lib/ai/chatEngine/validation';

// With backwards-compat export
import { sendMessage, validateInput } from './lib/ai/chatEngine';
```

---

## P3-2: Large Backend Module (chat_orchestrator.rs)

### Current State
- **File:** `src-tauri/src/overdrive/chat_orchestrator.rs`
- **Size:** 2,194 lines
- **Impact:**
  - Rust compilation time (affects cargo check/test cycles)
  - High module coupling
  - Provider implementations scattered
  - Difficult to test individual providers

### Proposed Decomposition

```
src-tauri/src/overdrive/
├── orchestrator/
│   ├── mod.rs                (200 lines) - Public API + re-exports
│   ├── state.rs              (150 lines) - ChatOrchestratorState definition
│   ├── heartbeat.rs          (300 lines) - Provider health checks + caching
│   ├── conversation.rs       (200 lines) - Conversation management (CRUD)
│   ├── streaming.rs          (300 lines) - Streaming utilities + Ollama handler
│   ├── utils.rs              (150 lines) - Helper functions
│   └── providers/
│       ├── mod.rs            (100 lines) - Provider interface
│       ├── gemini.rs         (200 lines) - Gemini API implementation
│       ├── ollama.rs         (250 lines) - Ollama API implementation
│       ├── openai.rs         (200 lines) - OpenAI API implementation
│       ├── anthropic.rs      (200 lines) - Anthropic Claude implementation
│       ├── glm46v.rs         (200 lines) - GLM-4.6V local multimodal
│       └── local.rs          (100 lines) - Local fallback provider
└── chat_orchestrator.rs (deprecated) → re-export from orchestrator/mod.rs
```

### Benefits
- ✅ **Compilation Time:** -30% (modular Rust compilation)
- ✅ **Provider Maintenance:** Each provider in own file
- ✅ **Testing:** Integration tests per provider
- ✅ **Extensibility:** Adding new providers becomes trivial

### Provider Trait (v27.0 refactor)

```rust
pub trait ChatProvider: Send + Sync {
    async fn send(&self, request: &ChatRequest) -> Result<ChatMessage, TAPIError>;
    async fn health_check(&self) -> Result<ProviderHealth, TAPIError>;
    fn supported_models(&self) -> Vec<String>;
}

pub struct ProviderRegistry {
    providers: HashMap<String, Arc<dyn ChatProvider>>,
}

impl ProviderRegistry {
    pub fn new() -> Self { ... }
    pub async fn send_to(&self, provider: &str, request: &ChatRequest) 
        -> Result<ChatMessage, TAPIError> { ... }
    pub async fn cascade(&self, request: &ChatRequest, order: Vec<&str>) 
        -> Result<ChatMessage, TAPIError> { ... }
}
```

---

## P3-3: Complex React Hook (useChat.ts)

### Current State
- **File:** `src/hooks/useChat.ts`
- **Size:** 2,000+ lines
- **Impact:**
  - Hook complexity makes re-render logic hard to follow
  - State management scattered across hook body
  - Streaming logic mixed with core state
  - Memory management intertwined with UI state

### Proposed Decomposition

```
src/hooks/
├── useChat/
│   ├── index.ts              (100 lines) - Main hook export
│   ├── useChat.core.ts       (600 lines) - State + dispatch logic
│   ├── useChat.streaming.ts  (400 lines) - Streaming event listener
│   ├── useChat.memory.ts     (300 lines) - Conversation memory (save/load)
│   ├── useChat.providers.ts  (300 lines) - Provider selection logic
│   ├── useChat.utils.ts      (200 lines) - Formatting + helpers
│   └── types.ts              (150 lines) - TypeScript interfaces
└── useChat.ts (deprecated)   → re-export from index.ts
```

### Core Modules

#### useChat.core.ts
```typescript
export interface UseChatState {
  conversations: ConversationMemory[];
  currentConversationId: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  provider: string;
}

export interface UseChatActions {
  sendMessage: (message: string) => Promise<void>;
  setProvider: (provider: string) => void;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
}

export function useChat(): [UseChatState, UseChatActions] { ... }
```

#### useChat.streaming.ts
```typescript
export function useStreamingListener(
  conversationId: string,
  onChunk: (chunk: string) => void
): void { ... }
```

#### useChat.memory.ts
```typescript
export function useChatMemory(
  conversationId: string
): ConversationMemory | null { ... }

export function saveChatMemory(
  conversationId: string,
  memory: ConversationMemory
): Promise<void> { ... }
```

### Benefits
- ✅ **Reusability:** Export individual sub-hooks
- ✅ **Testing:** Mock each concern independently
- ✅ **Performance:** Lazy-load streaming module only when needed
- ✅ **Maintainability:** Clear separation of UI state vs memory state

---

## P3-4: Provider Cascade Abstraction

### Current Implementation (now internal)
```rust
// chat_orchestrator.rs - linear cascade
let providers_to_try: Vec<String> = if requested_provider == "auto" {
    vec!["ollama", "local"]  // Hard-coded cascade order
} else {
    vec![requested_provider]
};

for provider in providers_to_try {
    match provider.as_str() {
        "openai" => send_to_openai(...).await,
        "ollama" => send_to_ollama(...).await,
        "local" => send_to_local(...).await,
        _ => ...
    }
}
```

### Proposed (v27.0 refactor)
```rust
// providers/cascade.rs
#[derive(Clone)]
pub struct ProviderCascade {
    registry: Arc<ProviderRegistry>,
    order: Vec<String>,
    fallback: String,
}

impl ProviderCascade {
    pub fn auto() -> Self {
        ProviderCascade {
            registry: Arc::new(ProviderRegistry::new()),
            order: vec!["ollama".into(), "local".into()],
            fallback: "local".into(),
        }
    }

    pub fn custom(order: Vec<String>) -> Self { ... }

    pub async fn send(&self, request: &ChatRequest) 
        -> Result<ChatMessage, TAPIError> {
        for provider_name in &self.order {
            if let Ok(msg) = self.registry.send_to(provider_name, request).await {
                return Ok(msg);
            }
        }
        // Fall back to last provider
        self.registry.send_to(&self.fallback, request).await
    }
}
```

### Benefits
- ✅ **Extensibility:** Easy to add/remove providers
- ✅ **Testability:** Mock entire cascade
- ✅ **Configuration:** Cascade order from env/config
- ✅ **Monitoring:** Track cascade attempts per session

---

## P3-5: Test File Organization

### Current State
- Tests inline in source files (mixed concerns)
- Example: `chat_orchestrator.rs` has 40+ lines of `#[cfg(test)]`

### Proposed (v27.0)

```
src-tauri/
├── src/
│   ├── overdrive/
│   │   ├── orchestrator/
│   │   │   ├── mod.rs
│   │   │   ├── state.rs
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── tests/                      # NEW: Integration tests
    ├── chat_orchestrator.rs    (200 lines) - End-to-end orchestrator tests
    ├── providers_integration.rs (300 lines) - Provider health checks
    ├── fixtures/
    │   ├── mock_ollama.rs      - Ollama mock server
    │   ├── mock_gemini.rs      - Gemini mock server
    │   └── test_data.rs        - Sample messages, conversations
    └── helpers.rs              - Test utilities
```

### Benefits
- ✅ **Separation of Concerns:** Tests not mixed with source code
- ✅ **CI/CD:** Run integration tests separately (slower but comprehensive)
- ✅ **Reproducibility:** Mock servers for consistent testing
- ✅ **Documentation:** Tests serve as integration examples

---

## Priority Timeline

### ✅ COMPLETED (v26.4.1)
- [x] P1/P2 audit fixes (warnings, deprecated APIs, test docs)
- [x] All Rust compiler warnings eliminated (0 warnings)
- [x] All unit tests passing (4668 passed, 8 ignored)

### 📋 v27.0 Sprint (Q1 2026) - REFACTOR SPRINT
- [ ] Task 1: Decompose chatEngine.ts → 6 modules
  - Duration: 1-2 weeks
  - PR: Break into core/providers/streaming/validation/utils
  - Impact: Frontend compilation -15%

- [ ] Task 2: Decompose chat_orchestrator.rs → 8 modules
  - Duration: 2-3 weeks
  - PR: Extract providers into individual files + traits
  - Impact: Backend compilation -30%

- [ ] Task 3: Refactor useChat hook → 5 modules
  - Duration: 1-2 weeks
  - PR: Split core/streaming/memory/providers/utils
  - Impact: Hook re-render complexity -60%

- [ ] Task 4: Create ProviderCascade abstraction
  - Duration: 1 week
  - PR: New trait + registry pattern
  - Impact: Adding new providers becomes trivial

- [ ] Task 5: Reorganize integration tests
  - Duration: 1-2 weeks
  - PR: Move tests to `tests/` folder + add mock servers
  - Impact: Test coverage +15%, faster iteration

### 📋 v27.1 Sprint (Q2 2026)
- [ ] Full ProviderCascade integration in commands
- [ ] Integration test suite expansion
- [ ] Performance benchmarking (before/after decomposition)

### 📋 v28.0 Release (Late 2026)
- [ ] Remove deprecated `chat_send_message` entirely
- [ ] Full OMEGA v3 pipeline integration
- [ ] Legacy API cleanup

---

## Success Metrics

| Metric | Current | Target v27.0 | Target v28.0 |
|--------|---------|-------------|-------------|
| **Max File Size** | 2194 lines | 500 lines | 300 lines |
| **Avg File Size** | 1200 lines | 350 lines | 250 lines |
| **Build Time** | 14.3s | 10s | 8s |
| **Test Coverage** | 98% | 99% | 99.5% |
| **Cyclomatic Complexity** | High | Medium | Low |
| **Maintainability Index** | 65/100 | 80/100 | 90/100 |

---

## Implementation Guidelines

### 1. Backwards Compatibility
- Always provide re-export from old path during migration
- Use deprecation warnings for v27.0 → v28.0 transition
- Document migration path clearly

### 2. Incremental Rollout
- Feature flags for new modules (allow gradual testing)
- Canary testing with early adopters
- Gradual migration from old to new in application code

### 3. Testing Strategy
- Unit tests for isolated modules (keep in `src/`)
- Integration tests for module interactions (`tests/`)
- E2E tests for complete workflows

### 4. Performance Monitoring
- Benchmark compilation time per sprint
- Monitor runtime performance before/after decomposition
- Track memory usage with profiler

### 5. Documentation
- Add module-level comments explaining dependencies
- Create architecture diagrams for new structure
- Update contributor guidelines

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Decomposition breaks backward compat** | High | Maintain re-export layer, extensive testing |
| **Circular imports introduced** | Medium | Enforce module dependency graph review |
| **Performance regression** | Medium | Benchmark before/after, profile hot paths |
| **Learning curve for team** | Low | Documentation + pair programming sessions |
| **Timeline slippage** | Medium | Break into smaller PRs, sprint planning buffer |

---

## Related Documents

- **AUDIT_CHAT_IA_COMPLET_v26.4.1.md** - Complete audit (96/100 score)
- **PHASE_4_CLOSURE.md** - Phase 4 official closure
- **ARCHITECTURE.md** - Current system architecture
- **CONTRIBUTING.md** - Development guidelines

---

## Questions & Discussion

For questions about this roadmap:
1. Review [GitHub Discussions](https://github.com/KallokTherok1994/TITANE_INFINITY/discussions)
2. Open a GitHub Issue with label `refactor/p3`
3. Request code review in PR template

---

**Document Status:** ✅ Reference → Ready for RFC (Request for Comments)  
**Next Action:** Schedule refactoring sprint planning session  
**Owner:** TITANE∞ Refactoring Team  
