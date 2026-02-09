# RELEASE_CHECKLIST (doc-only)

Date (UTC): 2026-02-08

## Checklist (10–20 items)
1. Confirmer DELTA_GATE_SUMMARY.md présent et cohérent.
2. Confirmer DELTA_REPORT.md présent.
3. Confirmer DELTA_ISSUES.md présent.
4. Confirmer VERDICT.md = PASS.
5. Confirmer DOC_DELTA_CLOSURE_PROOF.md présent.
6. Vérifier freeze actif (UI_FREEZE_GATES.md).
7. Vérifier que les outputs delta sont listés dans 09_MANIFEST.json.
8. Exécuter lint si script présent: pnpm run lint.
9. Exécuter typecheck si script présent: pnpm run typecheck.
10. Exécuter tests si scripts présents: pnpm test / pnpm run test / pnpm run test:e2e.
11. Vérifier allowlist/tauri constraints (doc-only si déjà gelé).
12. Confirmer absence de modifications src/ dans ce pack.
