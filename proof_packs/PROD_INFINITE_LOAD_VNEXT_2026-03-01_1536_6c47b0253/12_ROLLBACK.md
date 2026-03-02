# ROLLBACK

## Targeted rollback (VNEXT only)

- `git restore -- src/main.tsx src/App.tsx src/lib/security.ts src-tauri/src/runtime_config.rs package.json`

## Remove VNEXT proof pack (if required)

- `git clean -fd proof_packs/PROD_INFINITE_LOAD_VNEXT_2026-03-01_1536_6c47b0253`
- `git restore -- .last_vnext_pack`

## Full workspace revert (last resort)

- `git reset --hard HEAD`

