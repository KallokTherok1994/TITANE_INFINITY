# 02 — Memory Policy Map

## Memory Decision Paths

### Path 1: No Memory Injection
- **Trigger**: Non-memory query (e.g., "What is TypeScript?")
- **Decision**: `router_decision.wants_memory = false`
- **Retrieval**: None
- **Injection**: None
- **Consumption**: None
- **Visible Label**: None
- **Proven**: YES ✅

### Path 2: STM Only
- **Trigger**: General conversation
- **Decision**: `router_decision.wants_memory = true`, `convos_memory_ltm_enabled = false`
- **Retrieval**: `mlm.get_immediate_context()` (STM)
- **Injection**: `stm_context_block` in system prompt
- **Consumption**: LLM uses STM context
- **Visible Label**: None (injected in prompt only)
- **Proven**: YES ✅

### Path 3: STM + Recent LTM
- **Trigger**: Memory recall query
- **Decision**: `router_decision.wants_memory = true`, `convos_memory_ltm_enabled = true`
- **Retrieval**: `unified_memory.recall()` (STM/MTM/LTM)
- **Injection**: `memory_recall_block` in system prompt
- **Consumption**: LLM uses memory context
- **Visible Label**: `memoryRecallIds` in metadata
- **Proven**: YES ✅

### Path 4: Canonical Memory Facts
- **Trigger**: Explicit memory recall query (contains "rappelle", "souviens", etc.)
- **Decision**: `is_memory_recall_query(message) = true`
- **Retrieval**: `extract_canonical_memory_facts(history)`
- **Injection**: `canonical_memory_fact_block` in system prompt
- **Consumption**: LLM uses canonical facts + INCONNU instruction
- **Visible Label**: None (injected in prompt only)
- **Proven**: YES ✅

## Memory Status Tracking
- **Frontend**: `persistentMemoryStatus` ('loaded', 'empty', 'unavailable', 'skipped')
- **Backend**: `memory_recall_ids` (array of IDs), `memory_sources_injected` (count)
- **Metadata**: `memory_effect` ('New', 'Recall', 'Connect', 'Evolve')
- **Proven**: YES ✅

## Summary
All memory paths are correctly implemented. Memory is injected only when relevant. Status is tracked but not visible in UI (design decision).