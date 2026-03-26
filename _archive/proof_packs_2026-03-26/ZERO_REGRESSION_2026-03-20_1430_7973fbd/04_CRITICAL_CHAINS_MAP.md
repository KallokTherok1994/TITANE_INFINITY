# 04 — CRITICAL CHAINS MAP
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Mapping Format
`chain | entry point | store/service | backend command | output | UI reflection | truth status`

---

## 1. Chat Send Chain

| Field | Value |
|-------|-------|
| Entry | User input → ChatInput component (src/components/) |
| Store/Service | src/services/ai/chatEngine.ts → tauriClient.ts (src/api/) |
| Backend Command | IPC: chat_commands.rs → chat_engine/ → ollama.rs / provider |
| Output | `{ ok, content, error }` IPC response + meta.provider_used |
| UI Reflection | ChatResponse component → displays message + provider badge |
| Truth Status | **PARTIAL_CHAIN** — provider display fixed (LOCK1), memory injection unproven in eval suite |

## 2. Chat Response Assembly Chain

| Field | Value |
|-------|-------|
| Entry | chat_commands.rs receives user message |
| Store/Service | runtime_real.rs → responsePolicy.ts (frontend policy enforcement) |
| Backend Command | chat_engine/ assembles: system_prompt + memory_injection + user_message → LLM |
| Output | StreamingResponse / CompletedResponse → ChatMessage |
| UI Reflection | Message displayed with metadata (provider, tokens, mode) |
| Truth Status | **WIRED_BUT_UNPROVEN** — assembly logic exists, no eval suite verifies prompt completeness |

## 3. Memory Save Chain

| Field | Value |
|-------|-------|
| Entry | After chat response → useChatMemory hook / memoryIntegration.ts |
| Store/Service | memoryStore.ts → IPC → memory_api.rs |
| Backend Command | memory_api.rs → memory_persistence.rs → DB (db_service.rs) |
| Output | `{ ok: true, memory_id }` |
| UI Reflection | None directly (silent save). Memory availability state in memoryStore |
| Truth Status | **PARTIAL_CHAIN** — LOCK4 fixed backend sync, no E2E eval proves save→recall round trip |

## 4. Memory Recall Chain

| Field | Value |
|-------|-------|
| Entry | New conversation start / explicit recall trigger |
| Store/Service | useMemoryEngineStore.ts → memoryIntegration.ts |
| Backend Command | memory_api.rs → memory_persistence.rs → DB query |
| Output | Array of memory items → returned to frontend |
| UI Reflection | Memory indicator in chat UI (if present) |
| Truth Status | **WIRED_BUT_UNPROVEN** — recall path exists, no eval suite verifies correct items returned |

## 5. Memory Injection into Prompt Chain

| Field | Value |
|-------|-------|
| Entry | chat_engine/ assembles system prompt |
| Store/Service | memoryIntegration.ts provides context → chatEngine.ts |
| Backend Command | Rust: memory items fetched, injected into prompt string before LLM call |
| Output | Augmented system prompt with memory items |
| UI Reflection | None (internal). Anti-lie check: UI must NOT claim memory used if not injected |
| Truth Status | **PARTIAL_CHAIN** — G1 fix applied, no automated eval verifies injection trace vs UI label |

## 6. Provider/Router Selection Chain

| Field | Value |
|-------|-------|
| Entry | ChatRequest arrives at runtime_real.rs |
| Store/Service | Provider selection logic (local_provider_refactor.rs, ollama_provider_refactor.rs, gemini_provider_refactor.rs) |
| Backend Command | Provider selected → request dispatched → response with meta.provider_used |
| Output | `{ ok, content, meta: { provider_used, model_used, latency_ms } }` |
| UI Reflection | Provider badge in ChatResponse (LOCK1 fix) |
| Truth Status | **PARTIAL_CHAIN** — provider_used now wired to UI (LOCK1), no eval suite verifies routing logic correctness across providers |

## 7. Fallback Chain

| Field | Value |
|-------|-------|
| Entry | Primary provider fails / timeout / error |
| Store/Service | circuitBreaker.ts → retryStrategy.ts → fallback provider |
| Backend Command | Rust: error handling in provider modules → fallback trigger |
| Output | Response with fallback provider metadata, explicit degraded state |
| UI Reflection | User must see WHICH provider is responding and that it's a fallback |
| Truth Status | **WIRED_BUT_UNPROVEN** — circuit breaker and retry exist, no eval proves honest fallback labeling |

## 8. Auto-Heal Chain

| Field | Value |
|-------|-------|
| Entry | Error detected (E2E, runtime, IPC) |
| Store/Service | scripts/autoheal/ (governance) + autoHealEngine.ts (frontend) + auto_heal.rs (backend) |
| Backend Command | auto_heal.rs → detection → classification → fix attempt |
| Output | AutoHeal entry in autoheal_rules.jsonl + verification commands |
| UI Reflection | useSelfHealingStore → UI health indicator (if present) |
| Truth Status | **WIRED_BUT_UNPROVEN** — auto-heal machinery exists, no eval verifies heal→truth alignment |

## 9. Agent Action → Runtime → UI Truth Chain

| Field | Value |
|-------|-------|
| Entry | Copilot agent (e.g., implement-subagent) makes code change |
| Store/Service | git commit → CI → gates (scripts/gates/) → verify_instructions.sh |
| Backend Command | Tauri build (cargo) → IPC contract validation → E2E |
| Output | Proof pack + explicit verdict |
| UI Reflection | TITANE runtime reflects actual state (no fake "improved", "learned", etc.) |
| Truth Status | **PARTIAL_CHAIN** — gates exist (g1-g9), verify_instructions.sh exists, but no eval suite for UI truth labels |

## 10. Desktop Critical Flow Chain

| Field | Value |
|-------|-------|
| Entry | User launches TITANE desktop app (AppImage/DEB) |
| Store/Service | tauri-init-fix.ts → Tauri window → IPC bootstrap → backend_selftest.rs |
| Backend Command | backend_selftest.rs → health checks → Ollama connectivity check |
| Output | App ready state, Ollama connection status |
| UI Reflection | Startup screen / health indicator (LOCK3 fix: system health from backend truth) |
| Truth Status | **PARTIAL_CHAIN** — LOCK3 fixed health polling source, no eval suite verifies desktop end-to-end |

---

## Truth Status Summary

| Chain | Status |
|-------|--------|
| Chat Send | PARTIAL_CHAIN |
| Response Assembly | WIRED_BUT_UNPROVEN |
| Memory Save | PARTIAL_CHAIN |
| Memory Recall | WIRED_BUT_UNPROVEN |
| Memory Injection | PARTIAL_CHAIN |
| Provider/Router | PARTIAL_CHAIN |
| Fallback | WIRED_BUT_UNPROVEN |
| Auto-Heal | WIRED_BUT_UNPROVEN |
| Agent→Runtime→UI | PARTIAL_CHAIN |
| Desktop Critical Flow | PARTIAL_CHAIN |

**0 chains are PROVEN_RUNTIME** — eval infrastructure is the root blocker.
