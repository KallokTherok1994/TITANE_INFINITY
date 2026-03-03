# 12_ROLLBACK

## Rollback non destructif

```bash
git restore -- src-tauri/src/chat_engine/mod.rs
git restore -- src-tauri/src/chat_engine/memory.rs
git restore -- src-tauri/src/engines/conversation_os/search.rs
git restore -- src-tauri/src/engines/conversation_os/router.rs
git restore -- src-tauri/src/engines/conversation_os/policy.rs
git restore -- proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa
```

## Rollback commit (si poussé)

```bash
git log --oneline -n 5
git revert <sha_commit_scellement_05>
```

