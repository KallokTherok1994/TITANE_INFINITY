A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (derives versionnelles docs)
C) RISK: P0
D) PLAN: 1) comparer claims version 2) identifier contradictions 3) classer V28 status 4) definir action.
E) PROOFS: obtenues = `_phase_version_key_mentions.log`, lectures directes.
F) ROLLBACK: suppression du proof pack uniquement.

# 11 VERSION DRIFT REPORT

Observations clefs:

- Source autoritaire repo: `27.2.0` (`package.json`, `CHANGELOG.md`) -> `PROVEN_BY_REPO`
- `README.md` melange plusieurs verites actives (`v27.2.0`, `v27.0.5 stable`) -> `CONTRADICTORY`
- `docs/README.md` affiche `v27.2.0` mais conserve du contenu heterogene legacy -> `PARTIAL`
- `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` annonce v28 mais contient artefacts `27.0.0` -> `CONTRADICTORY`

Classification V28:
- `V28_PROVEN`: non
- `V28_PARTIAL`: non fiable
- `V28_UNPROVEN`: oui
- `BLOCKED_VERSION_DRIFT`: actif

Statut:
- derive versionnelle documentaire reelle, a corriger apres gate git safe.
