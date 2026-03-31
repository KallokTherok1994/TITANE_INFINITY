# 02 — MEMORY INJECTION CHAIN

## Live chat path (BEFORE this fix):

user message
→ TS frontend: invokes `conversation_generate` IPC
→ Rust: `conversation_generate()` in `src-tauri/src/conversation_engine/commands.rs`
  → RouterEngine.classify(message)          → wants_memory: bool
  → MemoryEngine.decide_memory_strategy()   → memory_plan
  → SQLite history load (PATCH-012)         → last 20 msgs from conversation_os.db
  → MultiLayerMemoryManager.get_immediate_context() → stm_context_block (recent turns)
  → build system_prompt from parts          → [base, stm_block, time/twins context]
  → ConversationRequest { custom_system_prompt: system_prompt, history: conversation_context }
  → engine.process_message(request)         → AI provider call
  → response returned
  → ❌ orchestrator.unified_memory.recall() NEVER called
  → ❌ memoryRecallIds = synthetic build_memory_used_ids() IDs (not real)

## Live chat path (AFTER this fix):

user message
→ TS frontend: invokes `conversation_generate` IPC
→ Rust: `conversation_generate()` in `src-tauri/src/conversation_engine/commands.rs`
  → RouterEngine.classify(message)          → wants_memory: bool
  → MemoryEngine.decide_memory_strategy()   → memory_plan
  → SQLite history load                     → last 20 msgs
  → ✅ orchestrator.unified_memory.write().recall(message, 5)  [if wants_memory]
      → STM VecDeque keyword match          → items with real content
      → MTM Vec keyword match               → items with real content
      → LTM index keyword match + fs::read  → items with FULL DISK CONTENT loaded
      → importance-ranked, truncated to 5
  → memory_recall_block = "## MEMORY_CONTEXT\n[STM|0.80] ...\n## END_MEMORY_CONTEXT"
  → memory_recall_ids = ["uuid1", "uuid2", ...]
  → MultiLayerMemoryManager.get_immediate_context() → stm_context_block
  → build system_prompt parts:
      [base, stm_block, ✅ memory_recall_block, time/twins context]
  → ConversationRequest { custom_system_prompt: compiled_system_prompt, history: ... }
  → engine.process_message(request)         → AI provider receives memory in context
  → response JSON includes:
      metadata.memoryRecallIds: ["uuid1", "uuid2"]
      metadata.memoryRecallCount: 2

## Insertion point in commands.rs:
After SQLite history load (~line 610), before stm_context_block computation (~line 616).
The recall() and block assembly are added as a named block that feeds into system_prompt.
