# TITANE — Transform

## Statut
- Pill **Transform** visible.

## Rôle produit (cible)
Atelier de transformations : convertir des idées/contenus en artefacts.
Exemples :
- note → plan → checklist → doc,
- conversation → synthèse → décision → tâches,
- texte → publication → script → assets.

## UI attendue
- Input (texte/fichiers) + sélecteur de “transformer”.
- Prévisualisation + diff.
- Export (Markdown/PDF/Notion/JSON) + journalisation.

## Risques
- Pipelines asynchrones sans barre de progression.
- Erreurs silencieuses sur export.

## Tests
- Transform avec provider off (fallback local).
- Transform de gros fichiers.

## Risques
- Transformations destructives sans confirmation.
- Erreurs silencieuses : must “Always Respond” + état visible.

## Tests
- Transform sans provider IA (fallback).
- Transform avec fichiers volumineux.
