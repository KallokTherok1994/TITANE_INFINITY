# ROLLBACK — Phase 12

```bash
git restore -- \
  src/pages/CloudCenter/VaultStatus.tsx \
  src/pages/CloudCenter/SyncLogs.tsx \
  src/pages/DevPage.tsx \
  scripts/autoheal/autoheal_rules.jsonl
```

Rollback impact : supprime les états erreur UI et le badge dégradé orchestration.
Aucune architecture touchée — rollback sûr fichier par fichier.
