A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (audit minimal: `README.md`, `docs/README.md`, `docs/diagrams/README.md`, `package.json`, `CHANGELOG.md`, `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md`)
C) RISK: P0
D) PLAN: 1) classer sources 2) comparer claims 3) statuer gate version.
E) PROOFS: obtenues = `_A3_version_authority.log`; attendues = statut V28 unique.
F) ROLLBACK: suppression du pack précheck.

# 03 VERSION AUTHORITY AUDIT

## Sources et statut

- `package.json` (`version: 27.2.0`) -> `PROVEN_BY_REPO`
- `CHANGELOG.md` (`[27.2.0]`) -> `PROVEN_BY_REPO`
- `README.md` (mix v27.2.0/v27.0.5 stable) -> `CONTRADICTORY`
- `docs/README.md` (v27.2.0 déclaré) -> `PARTIAL`
- `docs/diagrams/README.md` (pas de claim V28) -> `PROVEN_BY_CANON_DOC`
- `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` (titre v28, artefacts 27.0.0) -> `CONTRADICTORY`

## Gate version (exactement un)

- `BLOCKED_VERSION_DRIFT`

## Classification V28

- `V28_PROVEN`: non
- `V28_PARTIAL`: non retenu
- `V28_UNPROVEN`: oui
