# Architecture des profils

## Profil par défaut

- `audit`
- posture: lecture, cartographie, classification, réflexion
- sandbox: `read-only`
- approval: `on-request`

## `patch`

- objectif: patch minimal, un verrou réel à la fois
- sandbox: `workspace-write`
- approval: `on-request`
- réseau: coupé par défaut

## `certify`

- objectif: relancer, vérifier, prouver, conclure
- sandbox: `workspace-write`
- approval: `on-request`
- raisonnement plus élevé

## `research`

- objectif: recherche externe explicitement justifiée
- sandbox: `workspace-write`
- approval: `on-request`
- réseau non activé par défaut dans la config
- usage attendu: activation explicite par session si nécessaire, pas par défaut

## Ask-first documenté

- `AGENTS.md` racine favorise Ask/plan avant les modifications larges
- la doctrine locale Codex rappelle la bascule vers patch seulement après fixation du scope
