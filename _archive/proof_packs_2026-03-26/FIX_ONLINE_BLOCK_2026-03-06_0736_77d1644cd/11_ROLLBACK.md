# Rollback

## Option 1 - Restore working tree changes
```bash
git restore -- src/config/offline-first.ts src/__tests__/architecture/no_offline_first_runtime_import.test.ts scripts/autoheal/autoheal_rules.jsonl
git clean -fd proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd
```

## Option 2 - Revert commit (if already committed)
```bash
git revert <commit_hash>
```

## Legacy fallback note
- If temporary compatibility with legacy offline-first behavior is required, revert only `src/config/offline-first.ts` while keeping the architecture guard test active.

