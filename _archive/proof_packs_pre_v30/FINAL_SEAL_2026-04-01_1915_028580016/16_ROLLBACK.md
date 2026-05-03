# 16 ROLLBACK

## Rollback scope

Only isolated worktree changes need rollback. No production deployment occurred.

## Rollback steps

1. Discard isolated worktree modifications if session is abandoned.
2. Keep proof pack if audit trail must be retained.
3. Do not cherry-pick or merge the Rust fixes until the remaining Rust test and version authority drift are resolved.
4. If the fixes must be removed selectively, revert these isolated files only:
   - `scripts/autoheal/autoheal_rules.jsonl`
   - `src-tauri/src/conversation_engine/commands.rs`
   - `src-tauri/src/conversation_engine/mod.rs`
   - `src-tauri/src/conversation_engine/omega_integration.rs`
   - `src-tauri/src/conversation_engine/pipeline.rs`
   - `src-tauri/src/conversation_engine/types.rs`

## Rollback verdict

Rollback is trivial because no release artifact was promoted and no remote branch was changed.
