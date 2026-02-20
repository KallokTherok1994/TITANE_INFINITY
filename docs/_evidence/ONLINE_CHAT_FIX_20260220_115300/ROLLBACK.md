Rollback

If changes are uncommitted
- git restore -- src-tauri/src/conversation_engine/mod.rs
- git restore -- src-tauri/src/conversation_engine/meta_accumulator.rs
- git restore -- src-tauri/src/conversation_engine/commands.rs
- git restore -- src/services/conversationEngine.ts
- git restore -- src/types/providerMeta.ts

If changes are committed
- git revert <commit_sha>

Post-rollback check
- Run runtime and verify offline text behavior matches baseline.
