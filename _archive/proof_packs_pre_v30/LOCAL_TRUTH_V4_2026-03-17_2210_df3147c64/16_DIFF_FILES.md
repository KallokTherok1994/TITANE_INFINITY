# 16 — DIFF FILES

## Fichier modifié: scripts/autoheal/autoheal_rules.jsonl

**Type:** Correctif minimal — un seul champ JSON renommé + une entrée ajoutée

### Changement 1 — Ligne 406: id renommé

```diff
- {"id": "AH-2026-03-17-SEAL-MASTER", ... "symptom": "IPC surface incomplete: 135 frontend-invoked commands unregistered...", ...}
+ {"id": "AH-2026-03-17-IPC-INCOMPLETE-REPAIR", ... "symptom": "IPC surface incomplete: 135 frontend-invoked commands unregistered...", ...}
```

**Justification:** Doublon causalement prouvé. Deux sessions distinctes avaient utilisé le même id `AH-2026-03-17-SEAL-MASTER` pour deux enregistrements sémantiquement différents:
- Ligne 404 (gardée): closure report — "491 commands, 0 unregistered" → id = `AH-2026-03-17-SEAL-MASTER` (CONSERVE)
- Ligne 406 (renommée): problème initial — "135 commands unregistered" → nouveau id = `AH-2026-03-17-IPC-INCOMPLETE-REPAIR`

Seul le champ `id` est modifié. Tous les autres champs (symptom, root_cause, fix, scope, files_changed, rollback, commands, prevention_test) sont inchangés.

### Changement 2 — Ligne 409 ajoutée (fin de fichier)

```json
{"id": "AH-2026-03-17-GOVERNANCE-DUPLICATE-ID-FIX", "date": "2026-03-17", ...}
```

Entrée autoheal obligatoire (Rule 10) documentant ce fix.

## Aucun autre fichier modifié

- src/: INCHANGÉ
- src-tauri/: INCHANGÉ
- tests/: INCHANGÉ
- e2e/: INCHANGÉ
- docs/: INCHANGÉ
- registry/: INCHANGÉ
