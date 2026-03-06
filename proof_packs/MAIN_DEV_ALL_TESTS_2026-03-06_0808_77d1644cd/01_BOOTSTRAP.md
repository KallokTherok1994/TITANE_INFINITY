# Bootstrap

## git status --porcelain=v1
```
 M scripts/autoheal/autoheal_rules.jsonl
 M src/config/offline-first.ts
?? proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/
?? proof_packs/MAIN_DEV_ALL_TESTS_2026-03-06_0808_77d1644cd/
?? src/__tests__/architecture/no_offline_first_runtime_import.test.ts
```

## git rev-parse --short HEAD
```
77d1644cd
```

## git log -5 --oneline
```
77d1644cd (HEAD -> MAIN, origin/MAIN, origin/HEAD) chore(proof-packs): add FINAL_PROD_UNLOCK_2026-03-06_0213_b61b1a251
c4c8eff96 fix(ci-unified): stabilize rust toolchain and IPC contract guard
0c003e969 fix(ci-p3): stabilize pnpm bootstrap and sync registry artifacts
15982a7ad fix(ci-registry): sync registry artifacts for consciousness workflow changes
834b0b09b fix(ci-consciousness): handle numpy types in collective json export
```

## git branch --show-current
```
MAIN
```

## node -v
```
v24.0.0
```

## pnpm -v
```
10.30.2
```

## rustc -V
```
rustc 1.91.1 (ed61e7d7e 2025-11-07)
```

## cargo -V
```
cargo 1.91.1 (ea2d97820 2025-10-10)
```

## Stopline G_ON_MAIN
- Repository default branch is `MAIN` and current branch is `MAIN`.
- `G_ON_MAIN`: PASS.

