# 17 — ROLLBACK PLAN

## Rollback de ce fix

```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

**Effet:** Restaure le fichier à l'état HEAD (df3147c64), soit l'état pre-fix avec le doublon. Le gate G_AH_RECURRENCE_GUARD_PASS échouera à nouveau.

## Rollback de sécurité (si conflict de merge future)

Si un merge futur réintroduit le doublon:
1. Identifier les lignes dupliquées: `grep -n "AH-2026-03-17-SEAL-MASTER" scripts/autoheal/autoheal_rules.jsonl`
2. Renommer la seconde occurrence avec un id unique
3. Ajouter une entrée autoheal pour ce second fix
4. Vérifier: `bash scripts/autoheal/detect_recurrence.sh`

## N/A: pas de rollback src/src-tauri nécessaire

Aucune modification du code source. Aucun rollback nécessaire pour les surfaces code.
