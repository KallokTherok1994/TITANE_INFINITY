# TITANE — Vision

## Statut
- **Vision** apparaît dans l’en‑tête TITANE (pill).
- Pas de capture dédiée : contenu interne **à confirmer**.

## Rôle produit (cible)
Espace où l’utilisateur maintient la **direction** de TITANE/Humain Total :
- objectifs (court / moyen / long terme),
- priorités et arbitrages,
- principes et contraintes,
- roadmap (produit/tech/business),
- décisions structurantes (avec date + rationale).

## UI attendue (proposition)
- Barre “Scope” (Personnel / Humain Total / TITANE / Business).
- Section “North Star” (1 phrase).
- Cartes “Objectifs” (OKR/Outcome) + statut.
- “Décisions” (append-only) + lien vers INDEX ULTIME vΩ.
- “Roadmap” (Now/Next/Later) + export.

## Données minimales
- `VisionItem { id, type, title, description?, status, priority, owner?, due?, links[], tags[], createdAt, updatedAt }`

## Risques / blocages potentiels
- Vision non chargée => écrans `UNKNOWN` / `NaN` / erreurs “undefined”.
- Couplage trop fort avec moteurs non initialisés (Singularity/OMEGA) => page vide.

## Tests recommandés
- Render sans moteurs (fallback local) : la page doit s’afficher.
- CRUD local-first + persistance.
- Import/export JSON.
- décisions structurantes (avec date + rationale).

## UI attendue
- Tableau / cartes : **Axes**, **Objectifs**, **Priorités**, **Décisions**.
- Actions : créer/éditer/archiver, lier à conversations, exporter (markdown/json).
- Indicateurs : “cohérence”, “dérive”, “dernier update”.

## Risques & blocs potentiels
- Vision non chargée → le chat répond “générique”.
- Incohérences de schéma (null/undefined) → crash similaire aux erreurs observées côté STATS.

## Tests minimum
- CRUD complet + persistence locale.
- Influence visible : un toggle “Injecter Vision dans le chat” + preuve (badge/trace).
- Incohérences de schéma (null/undefined) → crash similaire à ceux observés dans STATS.

## Tests recommandés
- Chargement à froid : Vision vide vs Vision peuplée.
- Migration de schéma (version + fallback).
- Lien Chat↔Vision : toggle “inclure Vision dans contexte”.
