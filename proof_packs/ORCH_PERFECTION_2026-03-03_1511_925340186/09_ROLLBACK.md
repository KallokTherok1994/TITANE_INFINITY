# 09_ROLLBACK

## Rollback non destructif (exact)

```bash
git restore -- src-tauri/src/memory/storage.rs src-tauri/src/chat_engine/memory.rs
git restore -- proof_packs/ORCH_PERFECTION_2026-03-03_1511_925340186
```

## Rollback ciblé commit (si déjà poussé)

```bash
git log --oneline -n 5
git revert <sha_commit_orch_perfection>
```

## Vérification post-rollback

```bash
git status --porcelain
pnpm test:architecture
cd src-tauri && cargo test --lib
```

