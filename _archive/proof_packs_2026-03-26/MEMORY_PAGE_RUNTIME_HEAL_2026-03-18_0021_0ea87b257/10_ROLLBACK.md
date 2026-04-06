# ROLLBACK

## Rollback Command
```bash
git revert a8be15a55 --no-commit
# or if only reverting the whitelist change:
git show HEAD:src/lib/security.ts | grep -n "persistent_memory_read" 
# remove lines 305-306 in src/lib/security.ts
git restore --source=HEAD~1 -- src/lib/security.ts
```

## Effect of Rollback
- `persistent_memory_read` and `persistent_memory_get_bundles` removed from whitelist
- MemoryDashboard will fail again with "Erreur de chargement mémoire"
- Memory page shell (useMemoryCore) unaffected
- No data loss — whitelist is a security gate, not storage

## Rollback Risk: LOW
Only 2 lines in a string array. No cascading effects.
