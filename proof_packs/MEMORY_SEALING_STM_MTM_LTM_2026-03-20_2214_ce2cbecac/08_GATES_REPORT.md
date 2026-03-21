# 08 — GATES REPORT

| Gate | Status | Evidence |
|------|--------|----------|
| G_MEMORY_AUTHORITY_UNIQUE | FAIL | 3 memory systems; core::UnifiedMemory is chat authority; others unused |
| G_STM_SAVE_TRUTH | PASS | store() pushes synchronously to VecDeque; no drop |
| G_STM_PERSIST_TRUTH | FAIL | STM is RAM-only; crash = loss (accepted design) |
| G_MTM_CONSOLIDATION_TRUTH | PARTIAL | Code path exists; tick() schedule unverified in orchestrator |
| G_LTM_PERSIST_TRUTH | PASS (post-fix) | fs::write() now called; cargo check EXIT 0 |
| G_LTM_RETRIEVE_TRUTH | PARTIAL | recall() searches ltm.index; LTM full content returns placeholder |
| G_MEMORY_RETRIEVAL_TRUTH | PARTIAL | Lexical match works for STM/MTM; LTM returns metadata only |
| G_MEMORY_INJECTION_TRUTH | FAIL | recall() never called before building chat prompt |
| G_CHAT_CONSUMPTION_TRUTH | FAIL | No memory in prompt = no consumption; MEMORY_CONSUMPTION_UNPROVEN |
| G_NO_FALSE_MEMORY | PASS | recall() returns empty set if no match; no hallucination |
| G_PROVIDER_INDEPENDENCE_TRUTH | PASS | LTM write/restore uses std::fs only |
| G_BACKUP_RESTORE_TRUTH | FAIL | TS backup = localStorage; LTM disk path not covered by TS backup |
| G_CROSS_SESSION_MEMORY_TRUTH | PARTIAL | LTM files persisted (fixed); STM/MTM lost on restart |
| G_SCHEMA_INTEGRITY_TRUTH | PASS | serde_json; corrupt entries skipped with eprintln; no crash |
| G_ROLLBACK_READY | PASS | git restore -- src-tauri/src/core/modules/unified_memory.rs |
