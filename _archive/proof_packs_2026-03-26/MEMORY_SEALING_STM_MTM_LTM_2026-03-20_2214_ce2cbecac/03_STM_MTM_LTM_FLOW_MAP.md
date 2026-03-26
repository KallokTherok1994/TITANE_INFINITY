# 03 — STM/MTM/LTM FLOW MAP

input turn (ChatRequest)
  → chat_send_message() dispatches to provider
  → provider returns ChatMessage
  → store_in_unified_memory(state, request, response) [orchestrator line 629]
      → format combined: "User: ...\nAssistant (provider): ..."
      → calculate_message_importance()
      → build tags: [provider, model, "tokens:N", "default_prompt"]
      → memory.store(content, MemoryType::Conversation, importance, tags)
          → MemoryItem created with tier=ShortTerm
          → pushed to stm.items (VecDeque) — RAM ONLY
          → if stm.items.len() > stm.max_capacity → promote_stm_to_mtm()
              → items: age>2min AND importance>0.4 OR age>retention_ms → move to mtm.items Vec
              → if mtm.items.len() > max_capacity → promote_mtm_to_ltm()
                  → items: age>3d AND importance>0.6 OR age>7d → move to ltm.index
                  → ✅ FIXED: serde_json::to_string(item) + std::fs::write(metadata.file_path)
                  → on write failure: remove from ltm.index (no ghost entries)

STM read (for recall, not pre-prompt):
  → recall(query, max) → keyword match on stm.items + mtm.items + ltm.index metadata

MTM consolidation trigger:
  → threshold-based: STM overflow triggers STM→MTM promotion
  → threshold-based: MTM overflow triggers MTM→LTM promotion
  → also runs in tick() (async, called how often? — NOT observed in orchestrator startup)

LTM promotion: see above. After fix: real .mem files written + index rebuilt on init()

Retrieval query: recall(query, max_results) — keyword/tag lexical match, no semantic
Ranking: sorted by importance descending (partial: b.importance.partial_cmp(a.importance))
Injection into prompt: ❌ ABSENT — recall() is never called before building chat prompt
  → MEMORY_INJECTION_UNPROVEN remains OPEN (not patched — separate concern)
Answer metadata: none — response does not include used_memory_ids

Startup restore (FIXED):
  → init() → restore_ltm_from_disk() → scan ltm.storage_path/*.mem → rebuild ltm.index
