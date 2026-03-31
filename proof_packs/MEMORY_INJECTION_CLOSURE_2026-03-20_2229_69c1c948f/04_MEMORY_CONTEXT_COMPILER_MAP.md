# 04 — MEMORY CONTEXT COMPILER MAP

## System prompt construction (commands.rs, after fix):

```
parts = [
  1. base (from ChatRequest.system_prompt or empty)
  2. stm_context_block (MultiLayerMemoryManager.get_immediate_context — recent turns)
  3. memory_recall_block (UnifiedMemory.recall() — STM/MTM/LTM keyword match)
  4. [TIME_CONTEXT | TWINS_CONTEXT] (if cognitive_flow or twins active)
]
final = parts.join("\n\n")
```

## Memory context format:
```
## MEMORY_CONTEXT
[STM|0.85] User: Bonjour\nAssistant (ollama): Bonjour! Comment puis-je vous aider?…
[MTM|0.70] User: Montre-moi du code Python\nAssistant (gemini): Voici un exemple:…
[LTM|0.65] User: Mon projet s'appelle TITANE…
## END_MEMORY_CONTEXT
```

## Token budget / truncation:
- Max items: 5 (MEMORY_RECALL_MAX = 5)
- Per-item content cap: 200 chars (MEMORY_ITEM_CHAR_CAP = 200) — appended with "…" if truncated
- Item label: `[TIER|importance]` — 12 chars overhead per item
- Worst case injection: 5 × (200 + 12) + headers ~= ~1100 chars (~275 tokens)
- This is bounded and safe for all providers (Ollama, Gemini, OpenAI context windows)

## Ordering rules:
- `recall()` returns items sorted by importance descending
- STM items typically have higher recency weight (higher importance for recent turns)
- LTM items may have higher importance if explicitly marked

## Anti-false-memory:
- `router_decision.wants_memory` gates the entire recall() call
  → factual queries, code queries, etc. that the router classifies as non-memory skip injection
- `recall()` uses keyword/tag match — empty string query would match nothing
- If `recalled.is_empty()` → `memory_recall_block = ""` → not pushed to parts
- No synthetic memory; no hallucinated IDs; no injection if no match

## Label visibility:
- `## MEMORY_CONTEXT` / `## END_MEMORY_CONTEXT` headers are visible to the model
- The model can distinguish memory context from live input
- Source tier is labeled: [STM|...], [MTM|...], [LTM|...]
