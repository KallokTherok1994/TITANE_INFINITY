# TRUTH_MAP v27 (preuve-first)

**Date:** 2026-01-13

Objectif: fournir une carte de vérité **sans hallucination**.
Chaque point ci-dessous doit être vérifiable via (a) un fichier, ou (b) une preuve capturée sous [docs/_evidence/v27/](docs/_evidence/v27/).

## A) État Git (snapshot)

- Repo sur MAIN et aligné avec origin/MAIN au moment des captures.
  - Preuves: [docs/_evidence/v27/A1_repo.txt](docs/_evidence/v27/A1_repo.txt), [docs/_evidence/v27/A2_git_status_2026-01-13.txt](docs/_evidence/v27/A2_git_status_2026-01-13.txt)

## B) Tooling & tests (réalité)

- Versions installées (Vite/Vitest) et extraction “factuelle”.
  - Preuve: [docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt](docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt)

- Suite de tests (exécution complète) : succès résumé.
  - Preuve: [docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt](docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt)

- Wrapper de test durci (RAW + garde no-tests), avec preuves associées.
  - Source: [scripts/test-wrapper.sh](scripts/test-wrapper.sh#L45-L54) (RAW), [scripts/test-wrapper.sh](scripts/test-wrapper.sh#L106-L149) (no-tests guard)
  - Preuves: [docs/_evidence/v27/B6_test_wrapper_pr3_targeted_webVitals_2026-01-13.txt](docs/_evidence/v27/B6_test_wrapper_pr3_targeted_webVitals_2026-01-13.txt), [docs/_evidence/v27/B7_test_wrapper_pr3_no_tests_case_2026-01-13.txt](docs/_evidence/v27/B7_test_wrapper_pr3_no_tests_case_2026-01-13.txt)

- Configuration Vitest (happy-dom + setupFiles).
  - Source: [vitest.config.ts](vitest.config.ts#L75-L103)

- Fix hoisting/TDZ des mocks Tauri (Vitest).
  - Source: [src/test/setup.ts](src/test/setup.ts#L700-L759)

## C) Sécurité dev (ports/process)

- Vite (dev server) est configuré en local-only.
  - Source: [vite.config.ts](vite.config.ts#L119-L134)

- Vérification “aucun port dev ouvert” + “aucun process dev” (anti faux-positifs vitest.explorer).
  - Script versionné: [scripts/verify/check-dev-ports-processes.sh](scripts/verify/check-dev-ports-processes.sh#L1-L43)
  - Preuve d’exécution: [docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt](docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt#L1-L15)

- Note: les tâches VS Code sous `.vscode/` peuvent être ignorées par git (policy repo). Le check canon doit donc rester le script versionné.
  - Preuve git-ignore: [docs/_evidence/v27/B9_vscode_tasks_ignored_2026-01-13.txt](docs/_evidence/v27/B9_vscode_tasks_ignored_2026-01-13.txt#L1-L36)
  - Source ignore: [.gitignore](.gitignore#L22-L27)

## D) Gouvernance (dev-only)

- Interdictions de build/bundle prod sans autorisation.
  - Source: [.github/instructions/titane.instructions.md](.github/instructions/titane.instructions.md#L15-L30)

## E) Document canon de statut

- Le document de référence v27 est [docs/STATUS_REPO_V27.md](docs/STATUS_REPO_V27.md).
  - Il pointe vers les preuves v27 et sert de résumé audit/état.

## F) AUTO-* reality check (validation + surfaces réelles)

- Validation “AUTO-HEAL systems” (scripts + doc + structure) : exécution complète OK.
  - Source: [scripts/validate-auto-heal.sh](scripts/validate-auto-heal.sh#L8-L120)
  - Preuve: [docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt](docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt#L1-L35)

- Surfaces Tauri/Rust “singularity_fusion::*” exposées via `generate_handler![...]`.
  - States AutoFix/AutoHeal/CrashGuard/Performance/Pipeline: [src-tauri/src/main.rs](src-tauri/src/main.rs#L506-L521)
  - Commandes AutoFix/AutoHeal (IPC): [src-tauri/src/main.rs](src-tauri/src/main.rs#L812-L857)
