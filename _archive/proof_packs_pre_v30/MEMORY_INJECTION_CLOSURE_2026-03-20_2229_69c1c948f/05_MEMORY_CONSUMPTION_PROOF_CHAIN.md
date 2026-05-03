# 05 — MEMORY CONSUMPTION PROOF CHAIN

## Trace for one memory item (post-fix, provable chain):

### Step 1 — STORED (conversation turn)
- User asks: "Mon projet s'appelle TITANE"
- chat_send_message() (or conversation_generate at post-turn) calls store_in_unified_memory()
- Combined: "User: Mon projet s'appelle TITANE\nAssistant (ollama): Compris! ..."
- Stored → STM VecDeque, id = "a1b2c3d4-..." importance = 0.7
- If STM overflow → promoted to MTM → if MTM overflow/age → promoted to LTM
- LTM: std::fs::write("~/.local/share/titane-infinity/ltm/a1b2c3d4-....mem", json)

### Step 2 — RETRIEVED (next session)
- User asks: "Quel est le nom de mon projet?"
- router_decision.wants_memory = true (memory keyword detected)
- orchestrator.unified_memory.write().recall("Quel est le nom de mon projet?", 5)
  → LTM index contains "a1b2c3d4-..." (restored from disk on init())
  → matches_query_metadata checks tags: ["ollama", "gemma2:2b", "tokens:45", "default_prompt"]
  → query "nom projet" matches tag or content? → depends on keyword match
  → If match: std::fs::read("ltm/a1b2c3d4-....mem") → serde_json::from_slice → MemoryItem
  → Full content: "User: Mon projet s'appelle TITANE\nAssistant..."
  → id added to memory_recall_ids

### Step 3 — INJECTED
- memory_recall_block = "## MEMORY_CONTEXT\n[LTM|0.70] User: Mon projet s'appelle TITANE…\n## END_MEMORY_CONTEXT"
- Added to system_prompt parts → parts.join("\n\n") → ConversationRequest.custom_system_prompt

### Step 4 — CONSUMED
- engine.process_message(request) → AI provider receives full system_prompt
- Model has access to MEMORY_CONTEXT section
- Answer: "Votre projet s'appelle TITANE" (uses injected context)

### Step 5 — PROOF IN RESPONSE
- Response JSON: metadata.memoryRecallIds: ["a1b2c3d4-..."]
- Response JSON: metadata.memoryRecallCount: 1
- Log: "[Ω:CMD] 🧠 Memory recall: 1 items injected | ids=[\"a1b2c3d4-...\"]"

## Honest limitation:
The memory match above depends on keyword overlap between the user query and stored content/tags.
Current retrieval is lexical only (no semantic/vector search).
If the user query uses different vocabulary than stored content, recall may return empty.
This is classified PARTIAL for retrieval quality — not a code defect in this session.

## What this proves:
- ✅ Memory item from STM/MTM/LTM CAN enter the compiled prompt
- ✅ Response metadata CAN expose which memory ids were used
- ✅ Model CAN receive the memory context
- ✅ No fake IDs, no placeholder content
- ⚠️ Whether the model actually USED the context depends on provider behavior — unverifiable at code level
  → Classified: MEMORY_INJECTION_CERTIFIED (chain is correct) not CONSUMPTION_CERTIFIED
