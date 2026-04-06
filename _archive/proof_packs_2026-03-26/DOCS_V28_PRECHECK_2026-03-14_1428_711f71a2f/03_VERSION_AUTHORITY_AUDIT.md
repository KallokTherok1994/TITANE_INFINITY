A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (audit minimal autorité version: `README.md`, `docs/README.md`, `docs/diagrams/README.md`, `package.json`, `CHANGELOG.md`, `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md`)
C) RISK: P0
D) PLAN: 1) classer sources 2) vérifier cohérence version 3) statuer V28.
E) PROOFS: obtenues = lectures ciblées + `_A2_docs_inventory.log`; attendues = statut V28 unique.
F) ROLLBACK: suppression du pack precheck.

# 03 VERSION AUTHORITY AUDIT

## Sources et classification

- `package.json` (`version: 27.2.0`) -> `PROVEN_BY_REPO`
- `CHANGELOG.md` (`[27.2.0]`) -> `PROVEN_BY_REPO`
- `README.md` (mix v27.2.0/v27.0.5 stable) -> `CONTRADICTORY`
- `docs/README.md` (v27.2.0 affiché) -> `PARTIAL`
- `docs/diagrams/README.md` (pas de claim version majeur) -> `PROVEN_BY_CANON_DOC`
- `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` (titre v28 mais artefacts 27.0.0) -> `CONTRADICTORY`

## Verdict version

- `V28_PROVEN`: non
- `V28_PARTIAL`: non retenu
- `V28_UNPROVEN`: oui
- `BLOCKED_VERSION_DRIFT`: actif (dérive constatée)
