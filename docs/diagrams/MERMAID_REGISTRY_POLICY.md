# Mermaid Registry Policy

## Objectif

Garantir un registry hash append-only, deterministe, gouverne, et resistant aux conflits.

## Regles

- Source unique: `docs/diagrams/sources/*.mmd`.
- Hash calcule sur contenu normalise (CRLF->LF, trailing spaces supprimees).
- Append-only: toute modification ajoute une entree dans `history[]`.
- Aucune suppression d'entree autorisee.
- Aucun champ volatile au top-level (seulement `version` et `files`).
- `history[]` doit etre chronologique et ISO 8601.

## Procedure en cas de conflit

1. Fusionner les `history[]` sans supprimer d'entrees.
2. Conserver l'ordre chronologique.
3. Valider avec `bash scripts/verify/mermaid-hash-registry.sh --check`.
