# Memory Runtime Chain

| Stage | Canonical owner | Runtime surface | Status | Evidence |
| --- | --- | --- | --- | --- |
| WRITE | Frontend memory writers | chat UI memorize prompts | PROVEN | Memory page shows persisted entries for ORION/ALICE/AZUR tokens |
| PERSIST | Rust backend (memory_os/unified_memory_v2) | Tauri IPC + memory dashboard | PARTIAL | Entries visible on /memory; no restart boundary proven |
| RECALL | UnifiedMemory.search | Chat recall turn | PARTIAL | Recall turn executed; provider degraded in some turns |
| INJECT | chatMemorySingleDoor.formatContextEnvelopeForSystemPrompt | prompt injection | WIRED_BUT_UNPROVEN | No direct injection trace in logs |
| CONSUME | Active model | provider execution | BROKEN | Provider degraded/unavailable during memory proof turns |
| ANSWER | Output dependence | final recall response | UNPROVEN | Memory verdict not PASS_MEMORY_REAL |
