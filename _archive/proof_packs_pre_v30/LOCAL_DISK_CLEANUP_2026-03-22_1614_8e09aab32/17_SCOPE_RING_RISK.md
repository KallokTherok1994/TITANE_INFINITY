# 17 — SCOPE, RING, RISQUE

## EXEC_MODE

PATH_SIMPLE — nettoyage local ciblé, règles locales uniquement, preuves ciblées.

## SCOPE_RING

- Ring 4 (harness/infra) uniquement
- Aucun Ring 1/2/3 (src/, src-tauri/src/) modifié

## RISK

**MINIMAL** — tous les items supprimés étaient:
1. Gitignorés (confirmed via .gitignore)
2. Reproductibles (caches de compilation)
3. Aucun artefact canonique ou proof authority touché

## Rollback disponible

Pour les caches: `cargo build` / `python3 -m venv` — reproduction automatique.
Pour la quarantaine: mv reverse disponible (REPO_CLONE_TEST_2026-03-22).

## Constitution respectée

✅ NEVER touch .git/ — respecté
✅ NEVER touch src/, src-tauri/src/ — respecté
✅ NEVER touch proof_packs/ existing — respecté
✅ NEVER touch deployment/latest/certification/ — respecté
✅ NEVER touch *.AppImage, *.deb, *.rpm, *.exe — respecté
✅ NEVER modify uncommitted product files — respecté
✅ Quarantine before deletion for non-trivial items — respecté (REPO_CLONE_TEST)
