# TITANE∞ AutoHeal (Doc-Governance)

## Objet

Ce dossier implémente le mécanisme anti-récurrence pour les fixes Copilot en mode gouverné.

## Règle constitutionnelle

À chaque fix, une entrée append-only doit être ajoutée à `scripts/autoheal/autoheal_rules.jsonl`.
Aucun fix n'est terminé tant que l'entrée AutoHeal + garde-fou de vérification n'existe pas.

## Fichiers

- `autoheal_rules.jsonl`: registre append-only des règles/fixes.
- `apply_autoheal.sh`: utilitaire d'ajout d'entrée et vérification minimale.
- `detect_recurrence.sh`: validateur du registre et garde anti-récurrence.
- `duplicate_id_allowlist.txt`: liste explicite (exceptionnelle) des IDs dupliqués historiques tolérés sans réécriture destructive.

## Limites

- Ce système ne modifie pas le runtime applicatif.
- Il opère sur gouvernance/doc/config et preuves associées.

## Vérification

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
