# LOCAL_PERSISTENCE_RUNTIME_MAP

| Stage | Owner | Surface/Path | Runtime Proof Source | Status | Risk | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Chat turn write | Conversation engine | conversation_os_v1.db events | run2/run3 chat + memory UI evidence | PARTIAL | no snapshot emission for restore | unblock snapshot emission |
| Orchestrator write | Orchestrator | provider_decisions | prior runtime proof pack | PARTIAL | not revalidated after restore | re-run once snapshot works |
| Memory write/persist/derive | Memory engine | conversation_os_v1.db + memory UI | run2/run3 memory page evidence | PARTIAL | restore not exercised | re-run after snapshot emission |
| Module/engine sync | Module layer | canonical events | not directly observed | UNKNOWN | possible parallel truth | map per module |
| LTM persistence | LTM | unified_memory.db (derived) | spec + prior pack | DOC_ONLY | derived surface only | keep non-canon |
| Snapshot emission | Persistence engine | titan_events.db snapshots | run2/run3 IPC error | BROKEN | requires full backend | triage full-backend path |
| Restore | Persistence engine | titan_load_state/titan_recover_state | run2/run3 blocked by snapshot emission | BROKEN | no snapshot produced | unblock emission |
| No-loss verification | Proof harness | pre/post compare | blocked by restore | BLOCKED | no snapshot/restore | unblock emission |
