# LOCAL_PERSISTENCE_RUNTIME_MAP

| Stage | Owner | Surface/Path | Status | Proof source | Risk/Notes |
| --- | --- | --- | --- | --- | --- |
| Chat turn write | Conversation Engine | conversation_os_v1.db (events) | PROVEN | prior runtime proof pack | Canonical chat store proven earlier |
| Orchestrator write | Orchestrator | provider_decisions table | PARTIAL | prior pack + docs | Not revalidated in this cycle |
| Memory persist/derive | Memory engine | conversation_os_v1.db + derived UI | PARTIAL | prior pack | LTM derived only |
| Module/engine sync | Modules/engines | canonical events or writes | UNKNOWN | none | External sync config missing |
| LTM persistence | LTM | unified_memory.db (derived) | DOC_ONLY | docs | Non-canonical |
| Snapshot create | Persistence engine | titan_events.db snapshots | BROKEN | restore harness runs | No snapshots exist in engine |
| Restore path | Persistence engine | titan_load_state / titan_recover_state | BROKEN | restore harness runs | load_state returns None |
| No-loss verification | Persistence engine | snapshot + replay | BLOCKED | restore harness runs | depends on snapshot/restore |
| Cleanup classification | Repo hygiene | root-level zero-byte files | PROVEN | ls -lb + rm -f | accidental artifacts removed |
