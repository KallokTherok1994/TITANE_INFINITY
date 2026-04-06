# 07_AUTOFIX_AUTOHEAL_SYSTEM

- Date: 2026-03-04T17:17:11-05:00

## Artefacts créés

- scripts/autoheal/README.md
- scripts/autoheal/autoheal_rules.jsonl
- scripts/autoheal/apply_autoheal.sh
- scripts/autoheal/detect_recurrence.sh

## Exécution garde anti-récurrence

```bash
bash scripts/autoheal/detect_recurrence.sh
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1
```

## Contrat minimal JSONL

- id, date, scope, symptom, root_cause, fix, prevention_test, commands, files_changed, rollback

## Règle d'or

- Aucun fix n'est terminé sans entrée append-only et garde-fou exécuté.
