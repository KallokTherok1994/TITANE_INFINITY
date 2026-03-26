# PLAN DE ROLLBACK — SESSION EXHAUSTIVE

**Session:** GITHUB_AGENT_EXHAUSTIVE_REPO_TRUTH_2026-03-07_1502_d783dcd

---

## Rollback complet (revert commit)

```bash
git revert HEAD --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif

### .gitignore (ajout ligne deployment/latest/builds/target-run-*/)
```bash
sed -i '/^deployment\/latest\/builds\/target-run-\*\//d' .gitignore
```

### AutoHeal (retirer les 2 entrées AH-0082/0083)
```bash
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_backup.jsonl
mv /tmp/ah_backup.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Impact du rollback

- Les 410 build artifacts réapparaissent dans git tracking au prochain cargo check
- Les findings EXH-P2-001/002/003 redeviennent non-documentés
- Aucun autre workflow ou fonctionnalité n'est affecté
