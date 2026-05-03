# PLAN DE ROLLBACK — PHASE STABILITÉ

**Session:** GITHUB_AGENT_STABILITY_PHASE_2026-03-07_1600_bdc555b

---

## Rollback complet

```bash
git revert HEAD --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif

### AutoHeal AH-0086/0087 (retirer les 2 dernières entrées)
```bash
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_back.jsonl
mv /tmp/ah_back.jsonl scripts/autoheal/autoheal_rules.jsonl
```

### Registry event stabilité
```bash
git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md
```

## Impact rollback

- AutoHeal: 102 → 100 entries
- Event registre FIX_APPLIED stabilité retiré
- Proof pack stabilité reste dans proof_packs/ (append-only)
