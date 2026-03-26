# 05 — MEMORY CONSUMPTION PROOF MAP

## Trace for one real memory item (Conversation type)

1. ENTERED: User sends message → chat_send_message() line 629 calls store_in_unified_memory()
2. SAVED (STM): store() → MemoryItem pushed to stm.items VecDeque — RAM
3. PERSISTED (LTM): When STM overflows → promote_stm_to_mtm() → when MTM overflows or item ages
   →  promote_mtm_to_ltm() → std::fs::write(<ltm_path>/<id>.mem, json) — DISK (after fix)
4. RETRIEVED: recall(query) → keyword match on content + tags → returns Vec<MemoryItem>
   ⚠️ LTM recall returns shallow metadata item (content = "[LTM:0]") — full disk content NOT loaded
   (src line ~404: "For now, return metadata as lightweight item. In production would load full content")
5. INJECTED: ❌ ABSENT — recall() is NEVER called before building a chat prompt
   system_prompt is built at lines 698-715 without memory context
6. INFLUENCED ANSWER: ❌ UNPROVEN — memory is stored but never retrieved to influence generation
7. PROOF: cargo check EXIT 0 confirms fs::write compiles; runtime proof BLOCKED_ENV (no display)

## MEMORY_INJECTION_UNPROVEN — classified, not patched (out of scope for minimal fix)
## MEMORY_CONSUMPTION_UNPROVEN — classified, not patched

## LTM FULL-CONTENT RECALL — additional gap
  LTM recall returns placeholder "[LTM:N]" content, not the full stored text.
  A full `std::fs::read` is needed in recall() for LTM items.
  Classified: MEMORY_RETRIEVAL_UNPROVEN for LTM full content (index metadata retrieval works).
