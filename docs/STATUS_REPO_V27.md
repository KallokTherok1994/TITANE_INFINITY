# STATUS_REPO_V27 — État du repo (preuve-first)

**Date:** 2026-01-13

Ce document est conçu pour être **vérifiable** : chaque constat pointe vers (a) un fichier avec lignes, ou (b) un log de commande capturé sous `docs/_evidence/v27/`.

## 0) Dossier de preuves

- Point d’entrée: `docs/_evidence/v27/`
- État Git capturé: `docs/_evidence/v27/A1_repo.txt`
- Versions tooling capturées: `docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt`
- Exécution tests (échantillon) capturée: `docs/_evidence/v27/B3_test_omega_provider_run.txt`
- État Git (capture récente): `docs/_evidence/v27/A2_git_status_2026-01-13.txt`
- Diffstat (staged/unstaged): `docs/_evidence/v27/A3_git_diffstat_2026-01-13.txt`
- Diff du fix Vitest (setup): `docs/_evidence/v27/A4_diff_src_test_setup_ts_2026-01-13.txt`
- État Git (post-split index / unstage): `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`
- PR-1 (diff staged + status): `docs/_evidence/v27/A6_pr1_cached_diff_and_status_2026-01-13T144821Z.txt`
- PR-2 (commit doc versions): `docs/_evidence/v27/A7_pr2_docs_versions_commit_2026-01-13T184332Z.txt`
- Exécution tests (run complet, succès — résumé compact): `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt`

## 1) Snapshot repo (Git)

**État actuel (2026-01-13):** le repo est sur `MAIN`, **devant `origin/MAIN` de 2 commits**, avec de nombreux changements **unstaged** + des fichiers **non suivis**.

- Preuve (post-split index): `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`
  - Montre que **seul** `src/test/setup.ts` est staged (`M  src/test/setup.ts`), le reste étant en working tree (` M ...`) ou non suivi (`?? ...`).

**Note:** une capture plus ancienne mentionnait un cherry-pick en cours.

- Preuve (ancienne capture): `docs/_evidence/v27/A1_repo.txt`

**P0 (bloquant pour audit/PRs sûres):** ne pas mélanger de sujets dans la même PR. Le risque "gros batch staged" a été **réduit** en isolant un seul fichier staged (preuve: `A5_git_status_after_unstage_2026-01-13T093108.txt`).

## 2) Règles de gouvernance (dev-only)

Le repo impose un **mode développement permanent** (interdiction de builds/bundles prod sans autorisation explicite).

- Source: `.github/instructions/titane.instructions.md` lignes 1-31 (interdictions explicites dont `pnpm run build` / `tauri build`).

## 3) Versions & tooling (Vite/Vitest)

### 3.1 Versions réelles (installées)

- Source (commande capturée): `docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt`
  - Vite: `vite 6.4.1`
  - Vitest: `vitest 4.0.17`
  - @vitest/*: `4.0.17`

### 3.2 Versions déclarées (package.json)

- Source: `package.json` (scripts) et `devDependencies`.
  - Script `test`: `package.json` ligne 27.
  - `typescript`: `package.json` ligne 172.
  - `vite`: `package.json` ligne 174.
  - `vitest`: `package.json` ligne 177.

### 3.3 Mismatch documentation interne

- Source: `.github/instructions/titane.instructions.md` lignes 1-80 (section “Stack Technique”) 
  - Stack déclarée: Vite `6.0.5` / Vitest `4.0.13` / TS `5.7.3`.
- Source: `package.json` lignes 27 et 172-177.

**Constat:** la doc d’instructions était en retard sur les versions réellement utilisées.

**Résolution (sur MAIN):** alignement des versions dans `.github/instructions/titane.instructions.md` via un commit doc-only.

- Preuve: `docs/_evidence/v27/A7_pr2_docs_versions_commit_2026-01-13T184332Z.txt`

## 4) Config Vite/Vitest (risques + constats)

### 4.1 Vite

- Source: `vite.config.ts` lignes 108-128
  - `server.port = 5173`
  - `server.host = '0.0.0.0'`

**Note sécurité/local-first:** exposer sur `0.0.0.0` ouvre l’accès réseau au serveur dev (si pare-feu permissif). Si l’objectif est strictement local, `127.0.0.1` est plus aligné.

### 4.2 Vitest (node/happy-dom)

- Source: `vitest.config.ts` lignes 71-102
  - `environment: 'happy-dom'`
  - `setupFiles`: `./src/setupTests.ts`, `./src/test/setup.ts`, `./src/test-utils/setup.ts`
  - `singleThread: true`, `isolate: true`, `clearMocks: true`, `restoreMocks: true`

## 5) Tests: état, wrapper, et incident hoisting

### 5.1 Wrapper de tests

- Source: `scripts/test-wrapper.sh` lignes 1-170
  - Lance `vitest run` via `npx cross-env ... vitest run ... | tee ...`
  - Filtre `--run` des arguments (commentaire lignes 24-41).
  - Analyse le output pour détecter échec via patterns `Test Files ... failed` et `Tests ... failed`.

### 5.2 Exemple d’exécution (omega-provider)

- Source: `docs/_evidence/v27/B3_test_omega_provider_run.txt` lignes 1880-1990
  - Montre `3 failed` et `Vitest exit code: 1` dans la section de synthèse.

### 5.2bis Exécution (run complet) — succès

- Source: `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt` lignes 1-90
  - Montre `Total failures detected: 0`, `Vitest exit code: 0`, `✅ TITANE∞ Test Suite: SUCCESS`, `EXIT:0`.

### 5.3 Incident Vitest hoisting (P0 historique)

Un incident de hoisting/TDZ sur des mocks Tauri a été observé dans les logs précédents.

- Source (fix local dans setup global): `src/test/setup.ts` lignes 700-760
  - Utilise `vi.hoisted(() => { ... })` et des `var` pour éviter les problèmes de TDZ avec `vi.mock()` hoisté.

Référence de lignes (setup actuel):

- Source: `src/test/setup.ts` lignes 690-737

Preuve du changement exact appliqué:

- `docs/_evidence/v27/A4_diff_src_test_setup_ts_2026-01-13.txt`

## 6) CI (workflows)

Le workflow principal CI est `TITANE∞ CI/CD Unified Pipeline v26.3.0`.

- Source: `.github/workflows/ci-unified.yml`
  - Frontend tests: lignes 80-106 (commande `pnpm run test -- --run`)
  - E2E Playwright: lignes 250-278 (commande `pnpm run test:e2e`)
  - Build verification: lignes 331-357 (commande `pnpm run build` + `pnpm exec tauri build --debug`)

**Point d’attention gouvernance:** les instructions locales interdisent de lancer `pnpm run build` / `tauri build` sans autorisation, mais la CI exécute bien un build de vérification (debug) (cf. `.github/workflows/ci-unified.yml` lignes 331-341).

## 7) AUTO-* reality check (index v27 requis)

Le repo contient des systèmes AutoFix/AutoHeal documentés et intégrés côté Tauri.

- Source (doc): `docs/AUTO_HEAL_SYSTEMS.md` (doc historique, statut “production en attente”).
- Source (validation): `scripts/validate-auto-heal.sh` lignes 1-120.
- Source (Tauri commands): `src-tauri/src/main.rs` lignes 510-860 (states `.manage(...)` + `generate_handler![...]` incluant `singularity_fusion::autoheal_*` et `singularity_fusion::autofix_*`).

Voir l’index consolidé: `docs/systems/AUTO_SYSTEMS_INDEX_v27.md`.

## 8) Plan PRs “petites et sûres” (proposition)

Sans modifier le code ici (dev-only), une séquence typique “safe PRs” pour v27 :

1. **PR-1 (tests infra, P0)**: isoler le fix hoisting Tauri/Vitest (un seul fichier: `src/test/setup.ts`).
  - Preuve isolation index: `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`
  - Preuve diff fix: `docs/_evidence/v27/A4_diff_src_test_setup_ts_2026-01-13.txt`
  - Preuve tests OK: `docs/_evidence/v27/B4_pnpm_test_run_2026-01-13T093401.txt`
2. **PR-2 (docs)**: mettre à jour la doc d’instructions (versions Vite/Vitest/TS) pour refléter `package.json`.
3. **PR-3 (tests)**: durcir le wrapper `scripts/test-wrapper.sh` contre les changements de format output Vitest (detection des fails) et/ou ajouter un mode “raw” recommandé.
4. **PR-4 (dev server)**: revoir `vite.config.ts` (`server.host`) si “local-only strict” est requis.
