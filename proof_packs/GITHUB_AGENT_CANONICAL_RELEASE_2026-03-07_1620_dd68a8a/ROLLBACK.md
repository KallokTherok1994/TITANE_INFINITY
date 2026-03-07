# PLAN DE ROLLBACK — CANONICAL RELEASE

**Session:** GITHUB_AGENT_CANONICAL_RELEASE_2026-03-07_1620_dd68a8a

---

## Rollback complet

```bash
git revert HEAD --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif AH-0088

```bash
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_back.jsonl
mv /tmp/ah_back.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Rollback registry event canonique

```bash
git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md
```

## Impact rollback

- AutoHeal: 103 → 102 entries
- Event registre canonical retiré
- Proof packs restent (append-only)
