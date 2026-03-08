# PLAN DE ROLLBACK — FERMETURE FINALE

**Session:** GITHUB_AGENT_FINAL_CLOSURE_2026-03-07_1518_8004f8d

---

## Rollback complet (revert commit)

```bash
git revert HEAD --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif

### python-package-conda.yml (restaurer trigger on:[push])
```bash
git restore -- .github/workflows/python-package-conda.yml
```

### Registry (retirer event WORKFLOW_CHANGED python-conda)
```bash
git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md
```

### AutoHeal (retirer AH-0084/0085)
```bash
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_back.jsonl
mv /tmp/ah_back.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Impact rollback

- python-package-conda.yml redevient actif sur tout push → CI FAIL à nouveau
- Registry Guard FAIL à nouveau sur commits qui changent .github/workflows/
- AutoHeal: 98 → 100 entrées annulées
