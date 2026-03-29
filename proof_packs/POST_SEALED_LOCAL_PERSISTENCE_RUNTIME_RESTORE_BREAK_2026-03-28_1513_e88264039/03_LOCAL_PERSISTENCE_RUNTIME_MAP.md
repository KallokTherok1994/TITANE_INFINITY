# LOCAL_PERSISTENCE_RUNTIME_MAP

| Stage | Canonical owner | Surface/path | Runtime proof source | Status | Risk | Action recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| A. CHAT TURN WRITE | ConversationEngine | conversation_os_v1.db::events | sqlite events table (count=4042, max_ts=1774724296161) + canary logs | PROVEN | run2 session crash reduces x3 stability | keep canary x3 stability; verify write after session failures |
| B. ORCHESTRATOR WRITE | ConversationEngine | conversation_os_v1.db::provider_decisions | sqlite provider_decisions (count=2021, max_ts=1774724296162) | PROVEN | no external sync | document sync gap |
| C. MEMORY WRITE / PERSIST / DERIVE | Memory services | conversation_os_v1.db + memory UI derived | WDIO memory UI evidence + snapshots table | PARTIAL | LTM derived path not canonical | keep LTM derived; add runtime proof when available |
| D. MODULE / ENGINE SYNC | Modules/engines | canonical events or provider_decisions | no direct runtime proof; no TURSO config | PARTIAL | potential parallel truth paths | require explicit runtime proof or config |
| E. LTM PERSISTENCE | Memory vault | unified_memory.db (derived) | unified_memory.db memories=0 | DOC_ONLY | LTM not proven | keep derived; no seal |
| F. SNAPSHOT CREATE | PersistenceEngine | conversation_os_v1.db::snapshots | sqlite snapshots table (count=2021, max_ts=1774724296200) | PROVEN | none | ok |
| G. RESTORE | PersistenceEngine | titan_recover_state (tauri command) | no harness to execute restore | BROKEN | restore/no-loss unproven | add bounded harness to call restore |
| H. NO-LOSS VERIFICATION | PersistenceEngine | snapshot+events replay | restore not executed | BROKEN | cannot prove no-loss | block until restore is runnable |
