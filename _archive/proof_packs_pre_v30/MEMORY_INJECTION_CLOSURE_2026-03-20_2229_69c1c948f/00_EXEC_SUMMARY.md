# 00 — EXEC SUMMARY

A) EXEC_MODE: BACKGROUND / PROOF-DRIVEN / CONTINUATION
B) SCOPE_RING: Ring 2 (conversation pipeline) + Ring 3 (UnifiedMemory core)
C) RISK: HIGH — memory stored but never consumed; answers had zero memory access
D) PLAN: Map live path → patch LTM full content load → patch pre-generation recall hook → patch response metadata → cargo check → proof pack
E) PROOFS: cargo check EXIT 0, code trace, diff
F) ROLLBACK: git restore -- src-tauri/src/core/modules/unified_memory.rs src-tauri/src/core/modules/mod.rs src-tauri/src/conversation_engine/commands.rs

## PRIMARY LOCK: MEMORY_INJECTION_UNPROVEN — closed

### Root cause found:
1. Live path is `conversation_generate()` (commands.rs) — NOT the deprecated `chat_send_message()`
2. `conversation_generate()` used `orchestrator` state only for API keys, never for `unified_memory`
3. `recall()` was never called before building the chat prompt
4. LTM `recall()` returned placeholder `"[LTM:N]"` content even if disk files existed
5. Response JSON had no real `memoryRecallIds` (only synthetic `build_memory_used_ids()` IDs)

### Three patches applied (all minimal):

PATCH A — `core/modules/unified_memory.rs` recall() LTM section:
  Replaced `"[LTM:N]"` placeholder with real `std::fs::read() + serde_json::from_slice()`
  Safe degradation: missing/corrupt files → `continue` (no crash, no fake content)

PATCH B — `conversation_engine/commands.rs` pre-generation recall hook:
  Added `orchestrator.unified_memory.write().recall(message, 5)` before system_prompt assembly
  Gated by `router_decision.wants_memory` (factual/code queries skip this)
  Token budget: items capped at 200 chars; max 5 items; labeled [STM|0.xx], [MTM|...], [LTM|...]
  Injected as `## MEMORY_CONTEXT\n...\n## END_MEMORY_CONTEXT` section in system_prompt

PATCH C — `conversation_engine/commands.rs` response metadata:
  Added `memoryRecallIds` and `memoryRecallCount` to response JSON `metadata` field
  Real item IDs from `recall()` — empty array if no recall (honest, not fake)

PATCH D — `core/modules/mod.rs`:
  Exported `MemoryTier` from `pub use unified_memory` (needed by commands.rs)

CARGO CHECK: EXIT 0
FINAL VERDICT: MEMORY_INJECTION_CERTIFIED
