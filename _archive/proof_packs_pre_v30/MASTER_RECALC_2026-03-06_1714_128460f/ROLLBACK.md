# ROLLBACK
## MASTER_RECALC_2026-03-06_1714_128460f

---

## Rollback de cette session

**Fichier modifié:** `scripts/autoheal/autoheal_rules.jsonl`

```bash
# Rollback complet de la session
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Vérification post-rollback
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

**Note:** Le rollback restaurera les IDs dupliqués — ce qui causera à nouveau FAIL.
Le fix (renommage 0049→0053, 0050→0054 + entrée AH-0055) est la correction appropriée.

---

## Rollback preuve pack (DOCS_REGISTRY — append-only)

Le proof pack `MASTER_RECALC_2026-03-06_1714_128460f/` est en append-only.
Ne pas supprimer ce pack. Il constitue un artefact de gouvernance.

---

## Impact du rollback

```
Impact code source (src/, src-tauri/):  AUCUN
Impact tests:                           AUCUN
Impact gouvernance AutoHeal:            Retour à l'état FAIL (duplicates)
```
