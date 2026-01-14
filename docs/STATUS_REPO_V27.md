# STATUS_REPO_V27 — État du repo (preuve-first)

**Date:** 2026-01-13

Ce document est conçu pour être **vérifiable** : chaque constat pointe vers (a) un fichier avec lignes, ou (b) un log de commande capturé sous `docs/_evidence/v27/`.

## 0) Dossier de preuves

- Point d’entrée: `docs/_evidence/v27/` (voir aussi [docs/_evidence/v27/](docs/_evidence/v27/))
- TRUTH MAP (canon): `docs/systems/TRUTH_MAP_v27.md` (voir aussi [docs/systems/TRUTH_MAP_v27.md](docs/systems/TRUTH_MAP_v27.md))
- État Git capturé: `docs/_evidence/v27/A1_repo.txt`
- Versions tooling capturées: `docs/_evidence/v27/B1_pnpm_ls_vite_vitest.txt`
- Exécution tests (échantillon) capturée (extrait): `docs/_evidence/v27/B3_omega_provider_excerpt_1880-1990.txt`
- État Git (capture récente): `docs/_evidence/v27/A2_git_status_2026-01-13.txt`
- Diffstat (staged/unstaged): `docs/_evidence/v27/A3_git_diffstat_2026-01-13.txt`
- Diff du fix Vitest (setup): `docs/_evidence/v27/A4_diff_src_test_setup_ts_2026-01-13.txt`
- État Git (post-split index / unstage): `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`
- PR-1 (diff staged + status): `docs/_evidence/v27/A6_pr1_cached_diff_and_status_2026-01-13T144821Z.txt`
- PR-2 (commit doc versions): `docs/_evidence/v27/A7_pr2_docs_versions_commit_2026-01-13T184332Z.txt`
- PR-4 (Vite host local-only): `docs/_evidence/v27/A9_pr4_vite_host_localonly_2026-01-13T184642Z.txt`
- Exécution tests (run complet, succès — résumé compact): `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt`
- Checks ports/process (anti faux-positifs): `docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt`
- Git-ignore `.vscode/tasks.json` (tâches VS Code non versionnées): [docs/_evidence/v27/B9_vscode_tasks_ignored_2026-01-13.txt](docs/_evidence/v27/B9_vscode_tasks_ignored_2026-01-13.txt#L1-L36)
- Validation AUTO-HEAL (scripts + doc + structure, exécution complète OK): [docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt](docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt#L1-L35)
- Backend AUTO-* (map module + extraits + liste commandes): [docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt](docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt#L1-L120)
- Contrat IPC AUTO-* (docs ↔ commandes ↔ tests): [docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt](docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt#L1-L160)
- Contrat IPC AUTO-* (écart doc ↔ repo: `healthService.ts` absent): [docs/_evidence/v27/B14_ipc_contract_vs_repo_healthservice_gap_2026-01-13.txt](docs/_evidence/v27/B14_ipc_contract_vs_repo_healthservice_gap_2026-01-13.txt#L1-L60)
- Contrat IPC AUTO-* — reality check “caller” (doc ↔ repo): [docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt](docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt#L1-L120)
- Contrat IPC (doc ↔ repo) — scan matrix “Frontend Files” (existence/tracking): [docs/_evidence/v27/B15_ipc_contract_matrix_frontend_files_exist_2026-01-13.txt](docs/_evidence/v27/B15_ipc_contract_matrix_frontend_files_exist_2026-01-13.txt#L1-L120)

## 1) Snapshot repo (Git)

**État actuel (2026-01-13):** le repo est sur `MAIN`, **aligné avec `origin/MAIN` (0/0)**. Aucun changement **tracked** en working tree ; des preuves existent sous `docs/_evidence/v27/` (certaines versionnées, d’autres locales/non suivies, selon la politique `.gitignore`).

- Commande reproductible: `git status --porcelain=v1 -b`
  - Montre `## MAIN...origin/MAIN` + des entrées `?? docs/_evidence/v27/...`.
- Commande reproductible: `git rev-list --left-right --count origin/MAIN...HEAD`
  - Retour attendu: `0 0`.

**P0 (règle permanente pour audit/PRs sûres):** ne pas mélanger de sujets dans la même PR.

- Historique (preuve de “split”/unstage pendant l’audit): `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`

## 2) Règles de gouvernance (dev-only)

Le repo impose un **mode développement permanent** (interdiction de builds/bundles prod sans autorisation explicite).

- Source: [.github/instructions/titane.instructions.md](.github/instructions/titane.instructions.md#L15-L30) (interdictions explicites dont `pnpm run build` / `tauri build`).

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

- Source: [vite.config.ts](vite.config.ts#L119-L134)
  - `server.port = 5173`
  - `server.host = '127.0.0.1'`

**Note sécurité/local-first:** le serveur dev était exposé sur `0.0.0.0` (accès réseau possible si pare-feu permissif). Il est désormais limité à `127.0.0.1`.

- Preuve (commit): `docs/_evidence/v27/A9_pr4_vite_host_localonly_2026-01-13T184642Z.txt`

**Vérification runtime (ports/process):** les checks de ports/process ont été durcis pour éviter les faux positifs (ex: `vitest.explorer`) et confirment qu’aucun port dev n’est ouvert.

- Script versionné: [scripts/verify/check-dev-ports-processes.sh](scripts/verify/check-dev-ports-processes.sh#L1-L43)

- Preuve: [docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt](docs/_evidence/v27/B8_dev_process_check_filters_2026-01-13.txt#L1-L15)

### 4.2 Vitest (node/happy-dom)

- Source: [vitest.config.ts](vitest.config.ts#L75-L103)
  - `environment: 'happy-dom'`
  - `setupFiles`: `./src/setupTests.ts`, `./src/test/setup.ts`, `./src/test-utils/setup.ts`
  - `singleThread: true`, `isolate: true`, `clearMocks: true`, `restoreMocks: true`

## 5) Tests: état, wrapper, et incident hoisting

### 5.1 Wrapper de tests

- Source: [scripts/test-wrapper.sh](scripts/test-wrapper.sh#L1-L172)
  - Lance `vitest run` via `npx cross-env ... vitest run ... | tee ...`
  - Filtre `--run` des arguments (commentaire lignes 24-41).
  - Analyse le output pour détecter échec via patterns `Test Files ... failed` et `Tests ... failed`.
  - Supporte un mode bypass parsing (debug): `TEST_WRAPPER_RAW=1`.
  - Échec strict si 0 test détecté (anti faux-positif), opt-out: `TEST_WRAPPER_ALLOW_NO_TESTS=1`.

  Références internes (pour audit):
  - RAW: [scripts/test-wrapper.sh](scripts/test-wrapper.sh#L45-L54)
  - No-tests guard: [scripts/test-wrapper.sh](scripts/test-wrapper.sh#L106-L149)

- Preuve (run ciblé, wrapper OK): `docs/_evidence/v27/B6_test_wrapper_pr3_targeted_webVitals_2026-01-13.txt`
- Preuve (cas no-tests, échec attendu): `docs/_evidence/v27/B7_test_wrapper_pr3_no_tests_case_2026-01-13.txt`

### 5.2 Exemple d’exécution (omega-provider)

- Source: `docs/_evidence/v27/B3_omega_provider_excerpt_1880-1990.txt` lignes 1-109
  - Montre `3 failed` et `Vitest exit code: 1` dans la section de synthèse.

### 5.2bis Exécution (run complet) — succès

- Source: `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt` lignes 1-90
  - Montre `Total failures detected: 0`, `Vitest exit code: 0`, `✅ TITANE∞ Test Suite: SUCCESS`, `EXIT:0`.

### 5.3 Incident Vitest hoisting (P0 historique)

Un incident de hoisting/TDZ sur des mocks Tauri a été observé dans les logs précédents.

- Source (fix local dans setup global): [src/test/setup.ts](src/test/setup.ts#L700-L759)
  - Utilise `vi.hoisted(() => { ... })` et des `var` pour éviter les problèmes de TDZ avec `vi.mock()` hoisté.

Référence de lignes (setup actuel):

- Source: [src/test/setup.ts](src/test/setup.ts#L700-L759)

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
- Source (validation): [scripts/validate-auto-heal.sh](scripts/validate-auto-heal.sh#L8-L120).
  - Preuve: [docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt](docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt#L1-L35)
- Source (Tauri commands):
  - States AutoFix/AutoHeal/CrashGuard/Performance/Pipeline: [src-tauri/src/main.rs](src-tauri/src/main.rs#L506-L521)
  - Commandes AutoFix/AutoHeal (IPC): [src-tauri/src/main.rs](src-tauri/src/main.rs#L812-L857)

- Source (impl backend Rust):
  - Module exports: [src-tauri/src/singularity_fusion/mod.rs](src-tauri/src/singularity_fusion/mod.rs#L1-L33)
  - AutoFix impl: [src-tauri/src/singularity_fusion/auto_fix.rs](src-tauri/src/singularity_fusion/auto_fix.rs#L53-L216)
  - AutoHeal impl: [src-tauri/src/singularity_fusion/auto_heal.rs](src-tauri/src/singularity_fusion/auto_heal.rs#L33-L291)
  - Preuve (inventaire + extraits): [docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt](docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt#L1-L120)

- Source (contrat IPC doc ↔ tests):
  - Matrix: [docs/backend/IPC_CONTRACT.md](docs/backend/IPC_CONTRACT.md#L270-L291)
  - Détails: [docs/backend/IPC_CONTRACT.md](docs/backend/IPC_CONTRACT.md#L461-L489)
  - Backend map: [docs/backend/BACKEND_MAP.md](docs/backend/BACKEND_MAP.md#L295-L306)
  - SINGULARITY vΩ: [docs/SINGULARITY_FUSION_vΩ.md](docs/SINGULARITY_FUSION_vΩ.md#L641-L657)
  - Tests invoke(): [src/__tests__/singularity-fusion-integration.test.ts](src/__tests__/singularity-fusion-integration.test.ts#L225-L236)
  - Preuve consolidée: [docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt](docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt#L1-L160)

- Note “doc ↔ repo” (caller): `IPC_CONTRACT.md` référence `src/services/healthService.ts`, mais le fichier est absent; la commande reste exposée + testée via allowlists/mocks/tests.
  - Preuve: [docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt](docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt#L1-L120)

- Note “doc ↔ repo” (matrix IPC): la section “Command → Frontend Matrix” référence majoritairement des fichiers `src/...` absents (scan existence/tracking).
  - Preuve: [docs/_evidence/v27/B15_ipc_contract_matrix_frontend_files_exist_2026-01-13.txt](docs/_evidence/v27/B15_ipc_contract_matrix_frontend_files_exist_2026-01-13.txt#L1-L120)

Voir l’index consolidé: `docs/systems/AUTO_SYSTEMS_INDEX_v27.md`.

## 8) Plan PRs “petites et sûres” (proposition)

Sans modifier le code ici (dev-only), une séquence typique “safe PRs” pour v27 :

1. **PR-1 (tests infra, P0)**: isoler le fix hoisting Tauri/Vitest (un seul fichier: `src/test/setup.ts`).
  - Preuve isolation index: `docs/_evidence/v27/A5_git_status_after_unstage_2026-01-13T093108.txt`
  - Preuve diff fix: `docs/_evidence/v27/A4_diff_src_test_setup_ts_2026-01-13.txt`
  - Preuve tests OK (résumé compact): `docs/_evidence/v27/B5_pnpm_test_run_summary_2026-01-13T093401Z.txt`
2. **PR-2 (docs)**: mettre à jour la doc d’instructions (versions Vite/Vitest/TS) pour refléter `package.json`.
3. **PR-3 (tests)**: durcir le wrapper `scripts/test-wrapper.sh` contre les changements de format output Vitest (detection des fails) et/ou ajouter un mode “raw” recommandé.
4. **PR-4 (dev server)**: revoir `vite.config.ts` (`server.host`) si “local-only strict” est requis.

## 9) Convention d’usage — Healing (`unifiedHealingFacade` vs `autoHealEngine`)

Objectif: éviter la dérive (mix callsites/engines) et clarifier quand utiliser la façade unifiée.

### 9.1 Règle de base (nouveau code)

- **Call sites applicatifs** (UI, orchestrateur, monitoring, “actions” runtime): utiliser **`unifiedHealingFacade.heal()`**.
  - Source: `src/services/ai/unifiedHealingFacade.ts` lignes 1-120 (architecture/intent) et 120-220 (API `heal()` + protections rate-limit/circuit breaker).
  - Raison: la façade applique des garde-fous (rate limit, circuit breaker) et route vers **simple** (autoHealEngine) ou **advanced** (selfHealing) selon la sévérité.

- **Appels “fire-and-forget”**: utiliser `void unifiedHealingFacade.heal(...)`.
  - Source (pattern existant): `src/services/ai/orchestrator.ts` lignes 744-752.
  - Note: si un appelant a besoin de savoir si une tentative a échoué, il doit `await` le `UnifiedHealResult`.

### 9.2 Usage direct de `autoHealEngine` (exceptions acceptées)

- **Niveau moteur / tests de bas niveau / instrumentation**: `autoHealEngine` reste le “source-of-truth” pour la détection, les stats et l’attente synchronisée d’une action.
  - Source: `src/services/ai/autoHealEngine.ts` lignes 636-687 (API `heal()` et `awaitHealAction()`).

- **Providers** (OpenAI/Claude/Gemini/Copilot): l’usage de `autoHealEngine.detectError()` est acceptable si l’intention est **uniquement** de classifier/logguer/stats, sans orchestration de healing.
  - Raison: les providers relancent l’erreur (ils ne “recover” pas localement). Le healing “end-to-end” (avec protections rate-limit/circuit) est mieux déclenché au niveau orchestrateur/UI, là où une stratégie de fallback/récupération existe.
  - Sources (exemples):
    - `src/services/ai/providers/openai.ts` ligne 112
    - `src/services/ai/providers/claude.ts` ligne 115
    - `src/services/ai/providers/gemini.ts` ligne 187
    - `src/services/ai/providers/copilot.ts` ligne 183

**Quand migrer un provider vers la façade ?**

- Si on veut déclencher une tentative de récupération “end-to-end” (simple/advanced) avec protections, remplacer `autoHealEngine.detectError(...)` par `unifiedHealingFacade.heal({ source, error, type, metadata })`.
  - Source: `src/services/ai/unifiedHealingFacade.ts` lignes 134-220 (classifie via `autoHealEngine.detectError()` puis route).

### 9.3 Règle pour les tests

- Tests “système”/orchestrateur: préférer `unifiedHealingFacade` pour refléter le runtime.
- Tests “moteur”: utiliser `autoHealEngine.detectError()`/`awaitHealAction()` pour tester le comportement interne.
  - Source (exemple test utilisant `detectError`): `src/__tests__/ai-subsystem-validation-v20omega.test.ts` ligne 174.
