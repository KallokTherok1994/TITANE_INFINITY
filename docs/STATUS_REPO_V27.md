# STATUS_REPO_V27 — État du repo (preuve-first)

**Date:** 2026-01-13

Ce document est conçu pour être **vérifiable** : chaque constat pointe vers (a) un fichier avec lignes, ou (b) un log de commande capturé sous `docs/_evidence/v27/`.

## 0) Dossier de preuves

- Point d’entrée: `docs/_evidence/v27/`
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
  - `server.host = '127.0.0.1'`

**Note sécurité/local-first:** le serveur dev était exposé sur `0.0.0.0` (accès réseau possible si pare-feu permissif). Il est désormais limité à `127.0.0.1`.

- Preuve (commit): `docs/_evidence/v27/A9_pr4_vite_host_localonly_2026-01-13T184642Z.txt`

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

- Source: `docs/_evidence/v27/B3_omega_provider_excerpt_1880-1990.txt` lignes 1-109
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
