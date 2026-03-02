# ROLLBACK

```bash
git restore -- src/main.tsx src/App.tsx src/lib/security.ts src-tauri/src/runtime_config.rs package.json
git clean -fd proof_packs/PROD_ISOLATION_2026-03-01_1557_6c47b0253
git restore -- .last_prod_isolation_pack
```

