# TRUTH_MAP v27 (preuve-first)

**Date:** 2026-01-13

Objectif: fournir une carte de vérité **sans hallucination**.
Chaque point ci-dessous doit être vérifiable via (a) un fichier, ou (b) une preuve capturée sous `docs/_evidence/v27/`.

## A) État Git (snapshot)

- Repo sur `MAIN` et aligné avec `origin/MAIN` au moment des captures.
  - Preuves: `docs/_evidence/v27/A1_repo.txt`, `docs/_evidence/v27/A2_git_status_2026-01-13.txt`

## B) Tooling & tests (réalité)

- Versions installées (Vite/Vitest) et extraction “factuelle”.
  - Preuve: `docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt`

- Suite de tests (exécution complète) : succès résumé.
  - Preuve: `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt`

- Wrapper de test durci (RAW + garde no-tests), avec preuves associées.
  - Preuves: `docs/_evidence/v27/B6_test_wrapper_pr3_targeted_webVitals_2026-01-13.txt`, `docs/_evidence/v27/B7_test_wrapper_pr3_no_tests_case_2026-01-13.txt`

## C) Sécurité dev (ports/process)

- Vérification “aucun port dev ouvert” + “aucun process dev” (anti faux-positifs `vitest.explorer`).
  - Script versionné: `scripts/verify/check-dev-ports-processes.sh`
  - Preuve d’exécution: `docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt`

## D) Gouvernance (dev-only)

- Interdictions de build/bundle prod sans autorisation.
  - Source: `.github/instructions/titane.instructions.md`

## E) Document canon de statut

- Le document de référence v27 est `docs/STATUS_REPO_V27.md`.
  - Il pointe vers les preuves v27 et sert de résumé audit/état.
