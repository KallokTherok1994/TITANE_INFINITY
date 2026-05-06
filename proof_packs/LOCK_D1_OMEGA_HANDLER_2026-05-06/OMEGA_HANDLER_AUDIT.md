# D1 — OMEGA Handler Audit

**Date:** 2026-05-06  

## OMEGA Executor State

All 8 TaskTypes in `ParallelExecutor` (line 427 of executor.rs) use `DefaultTaskHandler` — a mock returning heuristic JSON.

| TaskType | Handler | Real Surface | D1 Action |
|----------|---------|-------------|-----------|
| Memory | DefaultTaskHandler | OmegaMemoryBridge (available, unused) | SELECTED — shadow contract declared |
| Knowledge | DefaultTaskHandler | None | FUTURE D1.x |
| Reasoning | DefaultTaskHandler | None | FUTURE D3+ |
| Safety | DefaultTaskHandler | guardrails.rs (available, unused) | FUTURE D2+ |
| Context | DefaultTaskHandler | context_v2.rs (enrichment) | FUTURE D2+ |
| Identity | DefaultTaskHandler | None | FUTURE D2+ (D2 identity gate required) |
| CodeGen | DefaultTaskHandler | None | FUTURE D3+ |
| TextGen | DefaultTaskHandler | LLM providers | FUTURE D2+ |

## D1 Handler Selection: Memory

**Selected surface:** `src-tauri/src/omega/memory_bridge.rs::OmegaMemoryBridge`  
**Method:** `enrich_context(&mut OmegaContextV2)` — reads STM/MTM/LTM via MemoryOS  
**Baseline:** UnifiedMemory (NOT MemoryGraph v2)  

**Why Memory was selected over other handlers:**
1. OmegaMemoryBridge already exists and is tested (created in C1)
2. No identity gate required for shadow reads
3. Risk is LOW — shadow mode, no pipeline injection
4. Fallback is trivial — DefaultTaskHandler mock remains in place
5. OmegaMemoryBridge is the only handler with a real TypeScript contract + Rust surface pair available

## D1 Handler Contract (TypeScript)

Exported from `OmegaHandlerUpgradeContract.ts`:
- `D1_SELECTED_HANDLER = 'Memory'`
- `D1_MEMORY_HANDLER_DEFAULT_MODE = 'shadow'`
- `OMEGA_D1_MEMORY_HANDLER_FLAG = false` (default)
- 5 known_limits declared
- `validateMemoryHandlerOutput()` — enforces shadow_used, identity_safe, known_limits, memory_source

## Forbidden Actions (D1 boundary)

1. Do NOT call `register_handler()` in executor.rs with OmegaMemoryBridge (reserved for D2)
2. Do NOT set `memory_graph_v2_active: true` in adapter (reserved for D2)
3. Do NOT inject shadow output into OMEGA pipeline response (reserved for D2)
4. Do NOT remove DefaultTaskHandler for Memory (it remains the authoritative runtime handler)
