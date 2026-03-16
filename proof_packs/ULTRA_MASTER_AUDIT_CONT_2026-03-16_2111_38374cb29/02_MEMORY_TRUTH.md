# Memory Truth Audit — 2026-03-16

## OMEGA Pipeline Context Injection:
- omega_integration.rs::build_omega_input() → context: vec![] (HARDCODED EMPTY)
- commands.rs::MemoryEngine::decide_memory_strategy() → computes memory_plan
- memory_plan fields (fetch_stm, fetch_ltm, stm_limit) appear ONLY in trace JSON
- NONE of these fields trigger actual memory retrieval in the pipeline

## Impact:
- Each AI request is stateless from the AI's perspective
- Conversation "memory" is stored in SQLite (persist_conversation_os_artifacts) but NOT read back
- load_conversation_history() IPC exists but is not called before conversation_generate
- Multi-turn memory = KNOWN_PARTIAL (architecture exists, wiring missing)

## LTM Status:
- CONVOS_MEMORY_LTM=false (default) → correct, LTM not active
- If set to true: memory_plan.fetch_ltm can be true, but still not executed in pipeline
- LTM off = correct behavior; LTM on = flag set but no actual retrieval

## STM:
- Same situation: fetch_stm=true by default in memory_plan but never consumed

## Classification: PARTIAL_STUB (architecture + storage complete; retrieval not wired)
