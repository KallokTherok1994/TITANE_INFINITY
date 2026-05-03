# ROLLBACK — Continuation 2026-03-22

## Rollback Commands

```bash
# Restore g9-release-seal.sh (MANIFEST version key fix)
git restore -- scripts/gates/g9-release-seal.sh

# Restore stores/index.ts (missing exports)
git restore -- src/stores/index.ts

# Restore hooks/index.ts (useStoreSync export)
git restore -- src/hooks/index.ts

# Remove new files
rm src/hooks/useStoreSync.ts
rm scripts/sync-versions.mjs
rm proof_packs/CONTINUATION_2026-03-22/
```
