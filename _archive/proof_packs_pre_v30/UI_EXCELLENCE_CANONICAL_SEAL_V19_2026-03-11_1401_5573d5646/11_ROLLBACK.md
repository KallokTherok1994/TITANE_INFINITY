# 11 — ROLLBACK

**Timestamp:** 2026-03-11T14:11:00Z

## Plan de rollback V18

### Cas déclencheur

Régression observée sur le keyboard focus après déploiement du commit `ce6357c31`.

### Procédure

```bash
# Annuler le commit V18 sur MAIN (revert propre)
git revert ce6357c31 --no-edit
git push origin HEAD:MAIN

# Ou revenir au commit parent
git push origin 5573d5646:MAIN --force-with-lease
```

### Impact du rollback

| Fichier | Impact |
|---|---|
| `src/pages/TitanePage-local.css` | Suppression règle `:focus-visible` — retour état V17 |
| `registry/ui-events.jsonl` | Entrée V18 persistante (append-only) — pas de suppression requise |
| `scripts/autoheal/autoheal_rules.jsonl` | Entrée V18 persistante (append-only) — pas de suppression requise |
| `proof_packs/UI_EXCELLENCE_V18_*` | Pack conservé en historique git |

### Risque rollback

**FAIBLE** — le fix est 4 lignes CSS purement additives, aucun impact fonctionnel ou de layout.

### Validation post-rollback

```bash
git show HEAD:src/pages/TitanePage-local.css | grep 'focus-visible'
# Doit retourner : (vide)
```

## Décision de rollback

**Aucun rollback requis** — pas de régression observée, frictions post-fix : `[]`.
