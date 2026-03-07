# PLAN DE ROLLBACK

**Session:** GITHUB_AGENT_TOTAL_RECONCILIATION_2026-03-07_1416_b41305f

---

## Rollback complet (revert commit)

```bash
git revert b41305f --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif

### Corrections workflow (session b41305f)
```bash
git restore -- .github/workflows/rust.yml .github/workflows/python-package-conda.yml
```

### Registry (session b41305f)
```bash
git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md
```

### AutoHeal
```bash
# Supprimer les 4 dernières lignes (AH-2026-03-07-0078 à 0081)
head -n -4 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_backup.jsonl
mv /tmp/ah_backup.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Impact du rollback

- Les 3 breakages CI (rust.yml, Prettier, Registry Guard) réapparaissent
- Les proof packs créés dans cette session restent (append-only)
- Aucun autre workflow ou fonctionnalité n'est affecté
