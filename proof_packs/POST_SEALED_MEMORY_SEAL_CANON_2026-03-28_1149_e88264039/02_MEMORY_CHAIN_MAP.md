# Memory Chain Map

| Stage | Canonical owner | Surface/path | Status | Proof available | Risk | Action |
| --- | --- | --- | --- | --- | --- | --- |
| WRITE | Frontend writers | `chatMemoryCompactor`, `UnifiedMemory.add()` | WIRED_BUT_UNPROVEN | MEMORY_AUTHORITY_MAP (QUALIFIED) | MED | Run runtime proof |
| PERSIST | Rust backend | `memory_os`, `unified_memory_v2` | WIRED_BUT_UNPROVEN | MEMORY_AUTHORITY_MAP (QUALIFIED) | MED | Run runtime proof |
| RECALL | Frontend read | `UnifiedMemory.search()` | WIRED_BUT_UNPROVEN | MEMORY_AUTHORITY_MAP (QUALIFIED) | MED | Run runtime proof |
| INJECT | Context formatter | `chatMemorySingleDoor.formatContextEnvelopeForSystemPrompt()` | WIRED_BUT_UNPROVEN | MEMORY_AUTHORITY_MAP (QUALIFIED) | MED | Run runtime proof |
| CONSUME | Active model | LLM consumes injected prompt | UNKNOWN | None | HIGH | Behavioral proof required |
| ANSWER | Output change | Response uses improbable token | UNKNOWN | None | HIGH | Behavioral proof required |
