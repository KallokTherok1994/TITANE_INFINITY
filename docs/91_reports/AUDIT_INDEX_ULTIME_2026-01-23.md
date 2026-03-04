# 📊 TITANE∞ INDEX ULTIME — AUDIT REPO COMPLET

**Date:** 2026-01-23  
**Version:** v26.2.0  
**Branche:** MAIN  
**Auteur:** Audit automatisé local (aucun cloud)

---

## 📋 TABLE DES MATIÈRES

1. [A) INVENTORY TESTS](#a-inventory-tests)
2. [B) INVENTORY SCRIPTS](#b-inventory-scripts)
3. [C) INVENTORY WORKFLOWS](#c-inventory-workflows)
4. [D) ARCHITECTURE & CONTRATS](#d-architecture--contrats)
5. [E) PROPOSITION REGISTRE + GATE CI](#e-proposition-registre--gate-ci)
6. [F) RÉSUMÉ EXÉCUTIF](#f-résumé-exécutif)

---

## A) INVENTORY TESTS

### 1. Vitest — Unit/Integration/Architecture/Compliance/Omega

#### 1.1 Configuration principale

| Paramètre | Valeur |
|-----------|--------|
| **Config principale** | `vitest.config.ts` |
| **Environment** | `happy-dom` |
| **Pool** | `forks` |
| **maxWorkers** | `1` |
| **fileParallelism** | `false` |
| **testTimeout** | `45000ms` |
| **hookTimeout** | `20000ms` |
| **teardownTimeout** | `10000ms` |

#### 1.2 Suites de tests détaillées

##### Suite: Core (default)

```bash
pnpm test
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.config.ts` |
| **Chemins** | `src/**/*.{test,spec}.{ts,tsx}`, `tests/unit/**/*`, `tests/integration/**/*` |
| **Exclusions** | `node_modules`, `dist`, `src-tauri`, `src/tests/e2e/**`, `src/tests/browser/**`, `**/*.perf.test.{ts,tsx}` |
| **Variables env** | `NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs'` |
| **Setup files** | `./src/setupTests.ts`, `./src/test/setup.ts`, `./src/test-utils/setup.ts` |

##### Suite: Unit Coverage

```bash
pnpm test:coverage:unit
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.unit.config.ts` |
| **Chemins** | `src/**/*.{test,spec}.{ts,tsx}`, `tests/unit/**/*` |
| **Exclusions** | `tests/integration/**/*`, `tests/chat/**/*`, `tests/e2e/**/*` |
| **Coverage thresholds** | statements: 80%, branches: 80%, functions: 80%, lines: 80% |
| **Reporter** | `['text', 'json', 'html', 'json-summary']` |
| **Output** | `coverage/unit/` |

##### Suite: Integration Coverage

```bash
pnpm test:coverage:integration
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.integration.config.ts` |
| **Chemins** | `tests/integration/**/*`, `tests/chat/**/*` |
| **Exclusions** | `src/**/*` |
| **Coverage thresholds** | statements: 70%, branches: 70%, functions: 70%, lines: 70% |
| **testTimeout** | `60000ms` |
| **Output** | `coverage/integration/` |

##### Suite: Architecture

```bash
pnpm test:architecture
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.config.ts` |
| **Chemins** | `src/__tests__/architecture/**/*` |
| **Variables env** | `NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs'` |

##### Suite: Compliance

```bash
pnpm test:compliance
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.config.ts` |
| **Chemins** | `src/__tests__/compliance/**/*` |
| **Variables env** | `NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs'` |

##### Suite: Omega

```bash
pnpm test:omega
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.config.ts` |
| **Chemins** | `src/__tests__/*omega*.test.ts` |
| **Variables env** | `NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs'` |

##### Suite: All (combinée)

```bash
pnpm test:all
```

| Attribut | Valeur |
|----------|--------|
| **Combine** | `test` + `test:rust` + `test:architecture` + `test:compliance` |
| **Variables env** | `NODE_OPTIONS='--max-old-space-size=8192'` |

---

### 2. Vitest Browser (WebGL/Three.js)

#### 2.1 Configuration

```bash
pnpm test:browser
pnpm test:browser:ui    # Mode interactif
pnpm test:browser:watch # Watch mode
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.browser.config.ts` |
| **Browser provider** | `playwright` |
| **Browser name** | `chromium` |
| **Headless** | `true` |
| **testTimeout** | `60000ms` (1 minute pour WebGL) |
| **hookTimeout** | `30000ms` |
| **retry** | `1` (pour tests flaky) |
| **threads** | `false` |
| **singleThread** | `true` |

#### 2.2 Chemins de tests

```
src/tests/browser/**/*.test.ts
src/modules/avatar/floating/floating.perf.test.ts
```

#### 2.3 Fichiers de tests browser existants

| Fichier | Description |
|---------|-------------|
| `src/tests/browser/browser-smoke.test.ts` | Smoke test browser |

---

### 3. E2E Vitest (Backend Tauri requis)

#### 3.1 Configuration

```bash
pnpm test:e2e:vitest
```

| Attribut | Valeur |
|----------|--------|
| **Config** | `vitest.config.ts` |
| **Chemin** | `src/tests/e2e/titane_e2e.test.ts` |
| **Variable env REQUISE** | `RUN_E2E_TESTS=1` |
| **Prérequis** | Backend Tauri en cours d'exécution |

#### 3.2 Mécanisme de skip

```typescript
// src/tests/e2e/titane_e2e.test.ts (ligne 12)
const SKIP_E2E = !process.env.RUN_E2E_TESTS;
```

⚠️ **IMPORTANT:** Tests ignorés par défaut si `RUN_E2E_TESTS` n'est pas défini.

#### 3.3 Commande complète

```bash
cross-env RUN_E2E_TESTS=1 NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/tests/e2e/titane_e2e.test.ts
```

#### 3.4 Suite combinée 100% full

```bash
pnpm test:100:full
# Équivaut à: test + RUN_E2E_TESTS=1 test:e2e:vitest + test:browser
```

---

### 4. Playwright E2E

#### 4.1 Configuration

```bash
pnpm test:e2e:playwright  # ⚡ CANONIQUE (alias: test:e2e)
```

| Attribut | Valeur |
|----------|--------|
| **Script NPM canonique** | `test:e2e:playwright` (alias: `test:e2e`) |
| **Config** | `playwright.config.ts` |
| **testDir** | `./e2e` |
| **testMatch** | `**/*.spec.ts` |
| **baseURL** | `http://localhost:5173` |
| **timeout** | `30000ms` (30s/test) |
| **expect.timeout** | `5000ms` (5s pour assertions) |
| **retries** | `0` local, `2` en CI |
| **workers** | `undefined` local, `1` en CI |

#### 4.2 WebServer intégré

```javascript
webServer: {
  command: 'npx vite dev --host 127.0.0.1 --port 5173',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 120000 // 2min pour démarrer
}
```

#### 4.3 Projets (Browsers)

| Browser | Status | Raison si désactivé |
|---------|--------|---------------------|
| **chromium** | ✅ Actif | Desktop Chrome, viewport 1280x720 |
| **firefox** | ❌ Désactivé | Requiert libavif16 (non installable en container) |
| **webkit** | ❌ Désactivé | Requiert libavif16 (non installable en container) |

#### 4.4 Fichiers de tests E2E existants

| Fichier | Description |
|---------|-------------|
| `e2e/smoke.test.ts` | Smoke tests |
| `e2e/onboarding.test.ts` | Tests onboarding |
| `e2e/user-flows.test.ts` | User flows |
| `e2e/omega-pipeline-e2e.spec.ts` | Pipeline Omega |
| `e2e/feedback-loop.spec.ts` | Feedback loop |
| `e2e/beta-smoke.test.js` | Beta smoke (JS) |
| `e2e/critical/**` | Tests critiques |
| `e2e/features/**` | Tests features |

---

### 5. WebdriverIO (Mocha)

> ✅ **Officiellement inclus** via `pnpm test:e2e:wdio` (ajouté 2026-01-23)

#### 5.1 Configuration

```bash
pnpm test:e2e:wdio  # ⚡ CANONIQUE
```

| Attribut | Valeur |
|----------|--------|
| **Script NPM canonique** | `test:e2e:wdio` |
| **Config** | `wdio.conf.js` |
| **Framework** | `mocha` |
| **Specs** | `./e2e/**/*.test.js` |
| **Browser** | Chrome headless |
| **baseUrl** | `http://localhost:5173` |
| **waitforTimeout** | `10000ms` |
| **connectionRetryTimeout** | `120000ms` |
| **mochaOpts.timeout** | `60000ms` |

#### 5.2 Lifecycle hooks

- `onPrepare`: Lance Vite dev server automatiquement
- `onComplete`: Tue le process dev server

⚠️ **Note:** Pas de script npm dédié dans package.json

---

### 6. Rust (cargo test)

#### 6.1 Commandes

```bash
pnpm test:rust
# ou
pnpm test:tauri
```

#### 6.2 Configuration

| Attribut | Valeur |
|----------|--------|
| **Config** | `src-tauri/Cargo.toml` |
| **Chemin** | `src-tauri/src/**/*.rs` avec `#[test]` |
| **Prérequis** | `mkdir -p dist` (exigé par Tauri build) |

#### 6.3 Commande exécutée

```bash
mkdir -p dist && cd src-tauri && cargo test
```

#### 6.4 Lints de sécurité actifs (lib.rs)

```rust
#![warn(clippy::unwrap_used)]
#![warn(clippy::expect_used)]
```

---

### 7. Patterns Flaky/Timeout identifiés

#### 7.1 Timeouts par configuration

| Config | testTimeout | hookTimeout | teardownTimeout | Notes |
|--------|-------------|-------------|-----------------|-------|
| `vitest.config.ts` | 45000ms | 20000ms | 10000ms | Pool: forks, maxWorkers: 1 |
| `vitest.browser.config.ts` | 60000ms | 30000ms | — | retry: 1 pour flaky |
| `vitest.integration.config.ts` | 60000ms | — | — | — |
| `playwright.config.ts` | 30000ms | — | — | retries: 2 en CI |
| `wdio.conf.js` | 60000ms | — | — | mocha timeout |

#### 7.2 Stratégies anti-flaky

1. **Pool forks + maxWorkers: 1** — Évite les race conditions mémoire
2. **fileParallelism: false** — Exécution séquentielle des fichiers
3. **retry: 1** (browser tests) — Retry automatique
4. **retries: 2** (Playwright CI) — Retry en CI uniquement

---

### 8. Arborescence des tests

```
tests/
├── a11y/                           # Accessibilité
├── chat/                           # Tests chat
├── cognitive-engines-e2e.test.ts
├── contract/                       # Tests contractuels TS↔Tauri
├── e2e/                            # E2E (non-Playwright)
├── fixtures/                       # Fixtures partagées
├── glm46v-integration.test.ts
├── integration/                    # Tests d'intégration
│   ├── audit-system.test.ts
│   ├── control_panel_integration.test.ts
│   ├── deployment.test.ts
│   ├── devops-pipeline.test.ts
│   └── full-pipeline.test.ts
├── mocks/                          # Mocks partagés
├── performance/                    # Tests de performance
├── phase2/ → phase6/               # Tests par phase
├── polyfills/                      # Polyfills (resizable-arraybuffer.cjs)
├── release/                        # Tests release
├── security/                       # Tests sécurité
├── setup.ts                        # Setup global
├── unit/                           # Tests unitaires
│   ├── ControlPanel.test.tsx
│   ├── advancedBootMonitor.test.ts
│   ├── autonomy/
│   ├── cognitive/
│   ├── context/
│   ├── control_panel_commands.test.ts
│   ├── devops/
│   ├── fusion/
│   ├── realtime/
│   └── safeLazyImport.test.ts
└── verification/                   # Tests de vérification

src/__tests__/
├── a11y/
├── ai-subsystem-validation-v20omega.test.ts
├── api/
├── architecture/                   # Tests architecture (pnpm test:architecture)
├── boot-smoke.test.ts
├── chat-ia-*.test.ts              # Tests Chat IA
├── compliance/                     # Tests compliance (pnpm test:compliance)
├── core/
├── e2e-automated-validation.test.tsx
├── lib/
├── omega/                          # Tests omega
├── omega-*.test.ts
├── opus-engines.test.ts
├── services/
├── stores/
└── ui-first-10-responses.test.tsx

src/tests/
├── activeListeningIntegration.test.ts
├── browser/                        # Tests browser (pnpm test:browser)
│   └── browser-smoke.test.ts
├── chat-ia-interface.test.tsx
├── chat-ia-real.test.ts
├── consistency/
├── e2e/                            # E2E Vitest (RUN_E2E_TESTS=1)
│   └── titane_e2e.test.ts
├── memory/
├── presenceOS.test.ts
├── regression/
├── security.test.ts
├── tauri-invoke-fix-validator.ts
└── voice/

e2e/                                # Playwright E2E
├── .eslintrc.cjs
├── .eslintrc.json
├── beta-smoke.test.js
├── critical/
├── features/
├── feedback-loop.spec.ts
├── omega-pipeline-e2e.spec.ts
├── onboarding.test.ts
├── smoke.test.ts
└── user-flows.test.ts
```

---

## B) INVENTORY SCRIPTS

### 1. Scripts package.json — Tests

| Script | Commande | Description |
|--------|----------|-------------|
| `test` | `cross-env NODE_OPTIONS='...' vitest run` | Tests Vitest core |
| `test:watch` | `vitest --watch` | Watch mode |
| `test:coverage` | `vitest run --coverage && test:coverage:check` | Coverage + vérification |
| `test:coverage:unit` | `vitest run -c vitest.unit.config.ts --coverage` | Coverage unit (80%) |
| `test:coverage:integration` | `vitest run -c vitest.integration.config.ts --coverage` | Coverage integration (70%) |
| `test:coverage:check` | `bash scripts/verify/verify-coverage.sh` | Vérification seuils |
| `test:coverage:report` | `vitest run --coverage` | Rapport coverage |
| `test:e2e` | `playwright test` | Playwright E2E (alias) |
| `test:e2e:playwright` | `playwright test` | ⚡ **Playwright E2E (canonique)** |
| `test:e2e:wdio` | `wdio run wdio.conf.js` | ⚡ **WebdriverIO E2E (canonique)** |
| `test:e2e:vitest` | `RUN_E2E_TESTS=1 vitest run src/tests/e2e/titane_e2e.test.ts` | E2E Vitest |
| `test:all:full` | `test:all && test:e2e:playwright && test:e2e:wdio` | ⚡ **Tous tests + E2E complets** |
| `test:browser` | `vitest --config vitest.browser.config.ts --run` | Browser tests |
| `test:browser:ui` | `vitest --config vitest.browser.config.ts --ui` | Browser UI |
| `test:browser:watch` | `vitest --config vitest.browser.config.ts` | Browser watch |
| `test:100` | `test && test:browser` | Tests 100% |
| `test:100:full` | `test && RUN_E2E_TESTS=1 test:e2e:vitest && test:browser` | Tests 100% full |
| `test:rust` | `mkdir -p dist && cd src-tauri && cargo test` | Rust tests |
| `test:tauri` | `test:rust` | Alias |
| `test:architecture` | `vitest run src/__tests__/architecture` | Architecture |
| `test:compliance` | `vitest run src/__tests__/compliance` | Compliance |
| `test:omega` | `vitest run src/__tests__/*omega*.test.ts` | Omega |
| `test:all` | `test && test:rust && test:architecture && test:compliance` | All tests |

### 2. Scripts package.json — Verify

| Script | Commande | Description |
|--------|----------|-------------|
| `verify` | Combiné | lint + format:check + check + test:all + verify:* |
| `verify:tauri-only` | `bash scripts/verify/enforce-tauri-only.sh` | Gate Tauri-only |
| `verify:local-first` | `bash scripts/verify/enforce-local-first.sh` | Gate local-first |
| `verify:tauri-configs` | `bash scripts/verify/validate-tauri-configs.sh` | Validate configs |
| `verify:registry` | `node scripts/verify/registry-sync.js` | ⚡ **GATE_REGISTRY: vérifie sync registry** |

### 2b. Scripts package.json — Registry (ajouté 2026-01-23)

| Script | Commande | Description |
|--------|----------|-------------|
| `registry:log` | `node scripts/registry/log-event.js` | Append event au registry |
| `registry:snapshot` | `node scripts/registry/rebuild-snapshot.js` | Rebuild snapshot depuis events |

### 3. Scripts package.json — Audit

| Script | Commande | Description |
|--------|----------|-------------|
| `audit` | `pnpm audit && cd src-tauri && cargo audit` | Security audit |
| `audit:master` | `./scripts/audit/00-master-audit.sh` | Master audit |
| `audit:security` | `./scripts/audit/01-security-audit.sh` | Security audit |
| `audit:architecture` | `./scripts/audit/02-architecture-audit.sh` | Architecture audit |
| `audit:performance` | `./scripts/audit/03-performance-measure.sh` | Performance |
| `audit:coverage` | `./scripts/audit/04-test-coverage.sh` | Coverage audit |
| `audit:deployment` | `./scripts/audit/05-deployment-audit.sh` | Deployment |
| `audit:auto-fix` | `./scripts/audit/06-auto-fix.sh` | Auto-fix |
| `audit:quality-gates` | `./scripts/audit/07-quality-gates.sh` | Quality gates |

### 4. Scripts Verify (scripts/verify/)

| Script | Fonction | Détails |
|--------|----------|---------|
| `validate-tauri-configs.sh` | Cohérence configs | Vérifie tauri.base.json ↔ runtime/{dev,stable}/tauri.conf.json |
| `verify-aliases.sh` | Résolution aliases | Vérifie @themes/tokens résolvable |
| `verify-stable-surface-allowlist.sh` | Allowlist stable | Vérifie intégrité allowlist |
| `enforce-tauri-only.sh` | Gate Tauri-only | Bloque si HTTP server détecté |
| `enforce-local-first.sh` | Gate local-first | Bloque si cloud-first détecté |
| `verify-coverage.sh` | Coverage check | Vérifie seuils coverage |
| `verify-react-hooks.sh` | React hooks | Vérifie règles hooks |
| `verify-rust-hardening.sh` | Rust hardening | Vérifie durcissement Rust |
| `check-dev-ports-processes.sh` | Ports/processes | Vérifie ports dev ouverts |
| `guard-pnpm-only.sh` | pnpm guard | Bloque npm/yarn |
| `pre-deployment-check.sh` | Pre-deploy | Checks avant déploiement |
| `validate-architecture.sh` | Architecture | Validation architecture |
| `verify-bootfix.sh` | Bootfix | Vérifie fix boot |
| `verify-gitguardian-integration.sh` | GitGuardian | Intégration GitGuardian |
| `verify-preprod.sh` | Preprod | Checks preprod |
| `verify_cpu_load.sh` | CPU | Vérifie charge CPU |
| `verify_git_secure.sh` | Git secure | Sécurité git |
| `verify_global_system.sh` | System | Système global |
| `verify_import_hygiene.sh` | Imports | Hygiène imports |
| `verify_memory_integrity.sh` | Memory | Intégrité mémoire |
| `verify_typescript_strict.sh` | TS strict | Mode strict TypeScript |

### 5. Scripts Audit (scripts/audit/)

| Script | Lignes | Fonction |
|--------|--------|----------|
| `00-master-audit.sh` | — | Orchestrateur master |
| `01-security-audit.sh` | — | Audit sécurité |
| `02-architecture-audit.sh` | — | Audit architecture |
| `03-performance-measure.sh` | — | Mesures performance |
| `04-test-coverage.sh` | — | Audit coverage |
| `05-deployment-audit.sh` | — | Audit déploiement |
| `06-auto-fix.sh` | — | Auto-fix automatisé |
| `07-quality-gates.sh` | 346 | Validateur quality gates |
| `constitution-audit.sh` | 398 | **Audit constitutionnel PHASE_2+PHASE_3** |

#### 5.1 Détail constitution-audit.sh

**Audits PHASE_2:**
- P2.A1: Existence source canonique `tauriCommands.ts`
- P2.A2: Existence client unique `tauriClient.ts`
- P2.A3: Aucun `invoke()` direct hors wrappers autorisés (rg scan)
- P2.A4: Tests contractuels existants

**Audits PHASE_3:**
- P3.A1: Allowlist stable valide (JSON, 30-60 allowed)
- P3.A2: Build script hardening (PHASE_3 validations)
- P3.A3: CI workflow stable-build (allowlist validation, GATE_P3)

---

## C) INVENTORY WORKFLOWS

### 1. Liste complète des workflows (.github/workflows/)

| Workflow | Type | Description |
|----------|------|-------------|
| `ci.yml` | Tests | CI Tests basique |
| `ci-unified.yml` | Tests | **Pipeline CI/CD unifié v26.3.0** |
| `p0-1-secrets-guard.yml` | Gate | GATE_P0_1_SECRETS |
| `p0-2-surface-guard.yml` | Gate | GATE_P0_2_SURFACE |
| `p0-secret-scan.yml` | Security | Secret scan |
| `p2-contract-guard.yml` | Gate | GATE_P2_CONTRACT |
| `p3-build-guard.yml` | Gate | GATE_P3_BUILD |
| `p3-stable-build.yml` | Build | Stable build |
| `p4-constitution-audit.yml` | Gate | **GATE_P4_CONSTITUTION (7 laws)** |
| `p5-runtime-governance.yml` | Governance | Runtime governance |
| `p6-capability-qualification.yml` | Qualification | Capability qualification |
| `stable-build.yml` | Build | **Build stable + reproductibilité** |
| `constitution-audit.yml` | Audit | Constitution audit |
| `capability-qualification.yml` | Qualification | Capability qualification |
| `changelog.yml` | Release | Changelog generation |
| `codeql.yml` | Security | CodeQL analysis |
| `dependabot-auto-review.yml` | Deps | Dependabot auto-review |
| `docs-deploy.yml` | Docs | Documentation deployment |
| `gitguardian.yml` | Security | GitGuardian scan |
| `performance.yml` | Performance | Performance checks |
| `production-monitoring.yml` | Monitoring | Production monitoring |
| `release.yml` | Release | Release workflow |
| `release-unified.yml` | Release | Unified release |
| `release-deployment.yml` | Release | Release deployment |
| `release-certification-final.yml` | Release | Final certification |
| `rust-docker.yml` | Build | Rust Docker build |
| `secret-scan-gitleaks.yml` | Security | Gitleaks scan |

### 2. Workflows détaillés

#### 2.1 ci-unified.yml — Pipeline CI/CD Unifié

**Triggers:**
- push: MAIN, main, dev, stable-runtime
- pull_request: MAIN, main
- workflow_dispatch

**Concurrency:** Cancel in-progress sur même branche

**Jobs:**

| Job | Timeout | Dépendances | Fonction |
|-----|---------|-------------|----------|
| `lint-and-typecheck` | 15min | — | ESLint, TypeScript, Prettier |
| `test-frontend` | 20min | lint-and-typecheck | Vitest tests, coverage |
| `test-backend` | 30min | lint-and-typecheck | Rust tests |

**Coverage thresholds (CI):**
- Lines: 70% (warning)
- Branches: 60% (warning)

**Artifacts:** Codecov upload

#### 2.2 p0-1-secrets-guard.yml — GATE_P0_1_SECRETS

**Triggers:** push/PR → MAIN, dev, stable-runtime

**Jobs:**

| Job | Fonction |
|-----|----------|
| `secret-scan` | Exécute scripts/security/secret-scan.sh |
| `gate-check` | Validation finale GATE_P0_1_SECRETS |

**Checks:**
- Aucun fichier .env commité (sauf .example)
- docs/SECRETS.md existe
- Secret scanner passe

**Evidence:** `docs/_evidence/p0-secrets/ci-scan-*.txt`

#### 2.3 p2-contract-guard.yml — GATE_P2_CONTRACT

**Triggers:**
- push/PR: src/**/*.ts, src/**/*.tsx, allowlist.whitelist.stable.json
- schedule: quotidien 3h UTC
- workflow_dispatch

**Jobs:**

| Job | Fonction |
|-----|----------|
| `contract-guard` | Exécute scripts/security/contract-guard.sh |

**Vérifie:** Cohérence invoke() frontend ↔ allowlist backend

**Evidence:** `/tmp/contract-evidence/` → artifact 90 jours

#### 2.4 p3-build-guard.yml — GATE_P3_BUILD

**Triggers:**
- push/PR: runtime/stable/tauri.conf.json, package.json, Cargo.toml
- schedule: quotidien 4h UTC
- workflow_dispatch (full_build option)

**Jobs:**

| Job | Fonction |
|-----|----------|
| `build-validation` | Exécute scripts/build/build-validator.sh |

**Full build (optionnel):** Exécute scripts/build/build-guard.sh

**Artifacts:**
- Evidence: 90 jours
- AppImage: 30 jours (si full build)

#### 2.5 p4-constitution-audit.yml — GATE_P4_CONSTITUTION

**Triggers:** push/PR → MAIN

**Jobs (7 laws):**

| Job | Law | Vérifie |
|-----|-----|---------|
| `p4-l1-local-first-audit` | L1 LOCAL_FIRST | Tauri architecture |
| `p4-l2-dual-runtime-audit` | L2 DUAL_RUNTIME | runtime/dev + runtime/stable |
| `p4-l3-no-secrets-audit` | L3 NO_SECRETS | Aucun .env commité |
| `p4-l4-no-expansion-audit` | L4 NO_EXPANSION | Surface = 52 commands |
| `p4-l5-no-free-refactor-audit` | L5 NO_FREE_REFACTOR | tauriCommands.ts + tauriClient.ts |
| `p4-l6-proof-over-intuition-audit` | L6 PROOF_OVER_INTUITION | docs/_evidence/ existe |
| `p4-l7-safe-run-gate-audit` | L7 SAFE_RUN_GATE | 3+ gates actifs |
| `p4-constitutional-certification` | — | Certification 7/7 |
| `evidence-collection` | — | Collection preuves |

**Gate:** GATE_P4 = (constitutional_compliance == PASS && l1_l7_violations == 0)

#### 2.6 stable-build.yml — Build Stable + Reproductibilité

**Triggers:**
- workflow_dispatch (validate_reproducibility option)
- push tags: v*.*.*
- push branches: stable-runtime

**Jobs:**

| Step | Fonction |
|------|----------|
| Validate allowlist integrity | JSON valide, count commands |
| Build Stable Runtime (1st pass) | Build AppImage |
| Save build artifacts (1st pass) | backup build-pass1/ |
| GATE_P3: Reproducibility check | Double build, compare hashes |
| Upload build artifacts | AppImage, DEB, manifest |

**Gate:** GATE_P3 = (hash_build1 == hash_build2)

### 3. Tableau récapitulatif des Gates

| Gate | Workflow | Condition d'échec | Bloquant |
|------|----------|-------------------|----------|
| `GATE_P0_1_SECRETS` | p0-1-secrets-guard.yml | Secrets détectés, .env commités | ✅ |
| `GATE_P0_2_SURFACE` | p0-2-surface-guard.yml | Surface ≠ 52 commands | ✅ |
| `GATE_P2_CONTRACT` | p2-contract-guard.yml | Incohérence invoke() ↔ allowlist | ✅ |
| `GATE_P3_BUILD` | p3-build-guard.yml | Config build invalide | ✅ |
| `GATE_P3_REPRO` | stable-build.yml | Build non-reproductible | ✅ |
| `GATE_P4_CONSTITUTION` | p4-constitution-audit.yml | L1-L7 violations | ✅ |
| `GATE_REGISTRY` | registry-guard.yml | ⚡ **Registry outdated (ajouté 2026-01-23)** | ✅ |

---

## D) ARCHITECTURE & CONTRATS

### 1. Contrat TS ↔ Tauri

#### 1.1 Source canonique des commands

**Fichier:** `src/lib/tauriCommands.ts`

```typescript
export const TAURI_COMMANDS = {
  ADD_TIMELINE_EVENT: 'add_timeline_event',
  AGENDA_DELETE_EVENT: 'agenda_delete_event',
  // ... 250+ commands
} as const;

export type TauriCommand = (typeof TAURI_COMMANDS)[keyof typeof TAURI_COMMANDS];
export const ALL_TAURI_COMMANDS = Object.values(TAURI_COMMANDS);
export function isValidTauriCommand(cmd: string): cmd is TauriCommand;
```

**Invariant PHASE_2:**
- Aucune duplication ailleurs dans le codebase
- Aucune nouvelle command sans audit
- Chaque command doit avoir un wrapper typé

#### 1.2 Client unifié

**Fichier:** `src/api/tauriClient.ts`

```typescript
// Wrapper principal avec secureInvoke
export async function tauri<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  validator?: (val: unknown) => val is T
): Promise<T>;

// Avec retry + exponential backoff
export async function tauriWithRetry<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  maxRetries?: number,
  initialDelay?: number,
  validator?: (val: unknown) => val is T
): Promise<T>;

// Batch parallel
export async function tauriBatch<T>(
  commands: Array<{ cmd: string; payload?; validator? }>
): Promise<T[]>;

// Check disponibilité Tauri
export function isTauriAvailable(): boolean;
```

#### 1.3 Sécurité (secureInvoke)

**Fichier:** `src/lib/security.ts`

Protections:
- Command whitelist validation
- Anti-injection protection
- Anti-loop detection
- Automatic error handling

### 2. Allowlist Stable

**Fichier:** `src-tauri/allowlist.whitelist.stable.json`

#### 2.1 Structure

```json
{
  "$schema": "https://schema.tauri.app/config/2.0",
  "app": {
    "security": {
      "capabilities": [{
        "identifier": "stable-capability",
        "windows": ["main"],
        "permissions": [...],
        "allow": [...],
        "deny": [...]
      }]
    }
  }
}
```

#### 2.2 Commands autorisées (~50)

| Catégorie | Commands |
|-----------|----------|
| Runtime | `get_runtime_config` |
| Onboarding | `is_onboarding_complete`, `complete_onboarding`, `get_onboarding_preferences` |
| System | `get_helios_state`, `get_system_health`, `get_system_info` |
| Memory | `get_memory_state`, `memory_get_state`, `write_snapshot`, `read_snapshot`, `memory_ingest_file` |
| Timeline | `add_timeline_event`, `get_timeline` |
| Projects | `get_active_projects`, `get_recent_decisions`, `get_knowledge`, `get_active_rituals` |
| Chat | `save_chat_interaction`, `chat_generate`, `chat_stream_message` |
| Orchestration | `orchestration_get_cognitive_state`, `orchestration_get_unified_state` |
| Singularity | `singularity_get_*`, `singularity_set`, `singularity_sync`, `sync_singularity` |
| Experience | `experience_get_state`, `experience_update_state` |
| Files | `import_file`, `file_analyze`, `upload_and_process_file` |
| AI Config | `cp_get_ai_config`, `cp_set_ai_config` |
| GLM46V | `chat_generate_glm46v`, `check_glm46v_health`, `start_glm46v_server`, `stop_glm46v_server` |
| Avatar | `fullbody_init`, `fullbody_update_pose`, `fullbody_update_expression`, `fullbody_get_state`, `avatar_get_expression` |
| TTS | `tts_speak_parler`, `tts_stop`, `tts_is_speaking`, `tts_get_status` |

#### 2.3 Commands refusées (~15)

| Command | Raison |
|---------|--------|
| `core:webview:allow-internal-toggle-devtools` | Debug only |
| `qa_*` | QA only |
| `one_core_*` | Dev only |
| `get_logs`, `clear_logs`, `write_log`, `read_logs` | Logging |
| `validate_nexus`, `get_nexus_graph` | Debug |

### 3. Backend Rust

#### 3.1 Modules principaux (lib.rs)

| Module | Version | Description |
|--------|---------|-------------|
| `adaptive` | v21 | AdaptiveEngine |
| `avatar` | v23 | ImmersiveAvatarEngine |
| `backend_selftest` | v17.7 | Backend Global Self-Test |
| `cognitive` | v16 | Cognitive Layer |
| `core` | v16 | SingularityEngine |
| `engine` | v16 | Auto-Evolution |
| `kernel` | v20Ω.0 | Cognitive OS Kernel |
| `omega` | v20Ω | Omega Pipeline |
| `ipc` | v19.5.2 | IPC Cache Layer |
| `cache` | v19.5.2 | Intelligent Cache LRU |
| `ai` | v15 | AI Router |
| `ia` | v∞.19.3Ω | Unified IA Engine |

#### 3.2 Tauri commands count

```bash
grep -r "#\[tauri::command\]" src-tauri/src/ | wc -l
# Résultat: 1000+ occurrences
```

### 4. Invariants enforceables

| Invariant | Méthode | Script/Fichier |
|-----------|---------|----------------|
| Aucun invoke() direct hors wrappers | rg scan | constitution-audit.sh L100-120 |
| Source canonique unique | File check | constitution-audit.sh L86 |
| Allowlist JSON valide | jq validation | constitution-audit.sh L145 |
| Allowlist 30-60 commands | Count check | constitution-audit.sh L155 |
| Build reproductible | Double build + hash | stable-build.yml L120-160 |
| Surface 52 commands | grep count | p4-constitution-audit.yml L95 |
| No .env commités | git ls-files | p0-1-secrets-guard.yml |
| 7 laws compliance | Jobs individuels | p4-constitution-audit.yml |

---

## E) PROPOSITION REGISTRE + GATE CI

### 1. Emplacement proposé

```
/registry/
├── schemas/
│   ├── test-registry.schema.json
│   ├── workflow-registry.schema.json
│   ├── contract-registry.schema.json
│   └── phase-registry.schema.json
├── test-registry.json           # Index temps réel des suites
├── workflow-registry.json       # Index CI workflows + gates
├── contract-registry.json       # Index TS ↔ Tauri commands
└── phase-registry.json          # Index phases + conversations
```

### 2. Format test-registry.json

```json
{
  "$schema": "./schemas/test-registry.schema.json",
  "version": "1.0.0",
  "lastUpdate": "2026-01-23T00:00:00Z",
  "suites": [
    {
      "id": "vitest-core",
      "name": "Vitest Core",
      "type": "unit",
      "command": "pnpm test",
      "config": "vitest.config.ts",
      "paths": [
        "src/**/*.{test,spec}.{ts,tsx}",
        "tests/unit/**/*",
        "tests/integration/**/*"
      ],
      "exclude": [
        "src/tests/e2e/**",
        "src/tests/browser/**"
      ],
      "env": {
        "NODE_OPTIONS": "--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs"
      },
      "timeout": 45000,
      "pool": "forks",
      "maxWorkers": 1,
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-unit-coverage",
      "name": "Unit Coverage",
      "type": "coverage",
      "command": "pnpm test:coverage:unit",
      "config": "vitest.unit.config.ts",
      "paths": ["src/**/*.{test,spec}.{ts,tsx}", "tests/unit/**/*"],
      "thresholds": {
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
      },
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-integration-coverage",
      "name": "Integration Coverage",
      "type": "coverage",
      "command": "pnpm test:coverage:integration",
      "config": "vitest.integration.config.ts",
      "paths": ["tests/integration/**/*", "tests/chat/**/*"],
      "thresholds": {
        "statements": 70,
        "branches": 70,
        "functions": 70,
        "lines": 70
      },
      "timeout": 60000,
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-architecture",
      "name": "Architecture Tests",
      "type": "architecture",
      "command": "pnpm test:architecture",
      "config": "vitest.config.ts",
      "paths": ["src/__tests__/architecture/**/*"],
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-compliance",
      "name": "Compliance Tests",
      "type": "compliance",
      "command": "pnpm test:compliance",
      "config": "vitest.config.ts",
      "paths": ["src/__tests__/compliance/**/*"],
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-omega",
      "name": "Omega Tests",
      "type": "omega",
      "command": "pnpm test:omega",
      "config": "vitest.config.ts",
      "paths": ["src/__tests__/*omega*.test.ts"],
      "status": "active",
      "ci": false
    },
    {
      "id": "vitest-browser",
      "name": "Browser Tests (WebGL)",
      "type": "browser",
      "command": "pnpm test:browser",
      "config": "vitest.browser.config.ts",
      "paths": [
        "src/tests/browser/**/*.test.ts",
        "src/modules/avatar/floating/floating.perf.test.ts"
      ],
      "browser": {
        "provider": "playwright",
        "name": "chromium",
        "headless": true
      },
      "timeout": 60000,
      "retry": 1,
      "status": "active",
      "ci": true
    },
    {
      "id": "vitest-e2e",
      "name": "E2E Vitest (Tauri)",
      "type": "e2e",
      "command": "pnpm test:e2e:vitest",
      "config": "vitest.config.ts",
      "paths": ["src/tests/e2e/titane_e2e.test.ts"],
      "env": {
        "RUN_E2E_TESTS": "1"
      },
      "requires": ["tauri-backend"],
      "status": "conditional",
      "ci": false
    },
    {
      "id": "playwright-e2e",
      "name": "Playwright E2E",
      "type": "e2e",
      "command": "pnpm test:e2e",
      "config": "playwright.config.ts",
      "paths": ["e2e/**/*.spec.ts"],
      "browsers": ["chromium"],
      "baseUrl": "http://localhost:5173",
      "timeout": 30000,
      "retries": {
        "local": 0,
        "ci": 2
      },
      "status": "active",
      "ci": true
    },
    {
      "id": "rust-cargo-test",
      "name": "Rust Tests",
      "type": "rust",
      "command": "pnpm test:rust",
      "config": "src-tauri/Cargo.toml",
      "paths": ["src-tauri/src/**/*.rs"],
      "prerequisites": ["mkdir -p dist"],
      "status": "active",
      "ci": true
    }
  ],
  "gates": [
    {
      "id": "GATE_P0_1_SECRETS",
      "workflow": "p0-1-secrets-guard.yml",
      "blocking": true,
      "description": "Secret scan guard"
    },
    {
      "id": "GATE_P0_2_SURFACE",
      "workflow": "p0-2-surface-guard.yml",
      "blocking": true,
      "description": "Surface lock (52 commands)"
    },
    {
      "id": "GATE_P2_CONTRACT",
      "workflow": "p2-contract-guard.yml",
      "blocking": true,
      "description": "Contract TS↔Tauri coherence"
    },
    {
      "id": "GATE_P3_BUILD",
      "workflow": "p3-build-guard.yml",
      "blocking": true,
      "description": "Build config validation"
    },
    {
      "id": "GATE_P3_REPRO",
      "workflow": "stable-build.yml",
      "blocking": true,
      "description": "Reproducible build"
    },
    {
      "id": "GATE_P4_CONSTITUTION",
      "workflow": "p4-constitution-audit.yml",
      "blocking": true,
      "description": "Constitutional 7 laws compliance"
    }
  ],
  "combined": [
    {
      "id": "test-all",
      "name": "All Tests",
      "command": "pnpm test:all",
      "includes": ["vitest-core", "rust-cargo-test", "vitest-architecture", "vitest-compliance"]
    },
    {
      "id": "test-100",
      "name": "100% Tests",
      "command": "pnpm test:100",
      "includes": ["vitest-core", "vitest-browser"]
    },
    {
      "id": "test-100-full",
      "name": "100% Full Tests",
      "command": "pnpm test:100:full",
      "includes": ["vitest-core", "vitest-e2e", "vitest-browser"]
    }
  ]
}
```

### 3. Format workflow-registry.json

```json
{
  "$schema": "./schemas/workflow-registry.schema.json",
  "version": "1.0.0",
  "lastUpdate": "2026-01-23T00:00:00Z",
  "workflows": [
    {
      "id": "ci-unified",
      "file": ".github/workflows/ci-unified.yml",
      "name": "TITANE∞ CI/CD Unified Pipeline v26.3.0",
      "type": "ci",
      "triggers": {
        "push": ["MAIN", "main", "dev", "stable-runtime"],
        "pull_request": ["MAIN", "main"],
        "workflow_dispatch": true
      },
      "jobs": [
        {"name": "lint-and-typecheck", "timeout": 15, "required": true},
        {"name": "test-frontend", "timeout": 20, "required": true},
        {"name": "test-backend", "timeout": 30, "required": true}
      ],
      "artifacts": ["codecov"],
      "status": "active"
    },
    {
      "id": "p0-1-secrets",
      "file": ".github/workflows/p0-1-secrets-guard.yml",
      "name": "P0_1_SECRETS - Secret Scan Guard",
      "type": "gate",
      "gate": "GATE_P0_1_SECRETS",
      "triggers": {
        "push": ["MAIN", "dev", "stable-runtime"],
        "pull_request": ["MAIN"]
      },
      "jobs": [
        {"name": "secret-scan", "required": true},
        {"name": "gate-check", "required": true}
      ],
      "artifacts": ["evidence"],
      "status": "active"
    }
  ],
  "gates": {
    "GATE_P0_1_SECRETS": {
      "workflow": "p0-1-secrets-guard.yml",
      "condition": "No secrets detected && No .env committed",
      "blocking": true
    },
    "GATE_P0_2_SURFACE": {
      "workflow": "p0-2-surface-guard.yml",
      "condition": "Surface == 52 commands",
      "blocking": true
    },
    "GATE_P2_CONTRACT": {
      "workflow": "p2-contract-guard.yml",
      "condition": "invoke() coherent with allowlist",
      "blocking": true
    },
    "GATE_P3_BUILD": {
      "workflow": "p3-build-guard.yml",
      "condition": "Build config valid",
      "blocking": true
    },
    "GATE_P3_REPRO": {
      "workflow": "stable-build.yml",
      "condition": "hash(build1) == hash(build2)",
      "blocking": true
    },
    "GATE_P4_CONSTITUTION": {
      "workflow": "p4-constitution-audit.yml",
      "condition": "7/7 laws compliant",
      "blocking": true
    }
  }
}
```

### 4. Gate CI proposé: registry-guard.yml

```yaml
# .github/workflows/registry-guard.yml
name: '📋 Registry Guard'

on:
  push:
    branches: [MAIN, main]
    paths:
      - 'src/**/*.test.ts'
      - 'src/**/*.test.tsx'
      - 'tests/**/*.test.ts'
      - 'tests/**/*.test.tsx'
      - 'e2e/**/*.spec.ts'
      - 'vitest*.config.ts'
      - 'playwright.config.ts'
      - '.github/workflows/*.yml'
      - 'package.json'
  pull_request:
    branches: [MAIN, main]
    paths:
      - 'src/**/*.test.ts'
      - 'tests/**/*.test.ts'
      - 'e2e/**/*.spec.ts'
      - 'vitest*.config.ts'
      - 'playwright.config.ts'
      - '.github/workflows/*.yml'

jobs:
  registry-sync-check:
    name: '📋 Registry Sync Check'
    runs-on: ubuntu-latest
    
    steps:
      - name: '📥 Checkout'
        uses: actions/checkout@v4
      
      - name: '🔧 Setup Node.js'
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: '📦 Install pnpm'
        uses: pnpm/action-setup@v4
        with:
          version: latest
      
      - name: '🔍 Verify registry is up-to-date'
        run: |
          echo "📋 Checking registry synchronization..."
          
          # Check test-registry.json exists
          if [ ! -f "registry/test-registry.json" ]; then
            echo "❌ FAIL: registry/test-registry.json missing"
            echo "Run: pnpm registry:init"
            exit 1
          fi
          
          # Run registry sync script
          node scripts/verify/registry-sync.js
          
      - name: '🚨 GATE_REGISTRY Check'
        run: |
          if [ -f ".registry-outdated" ]; then
            echo "❌ GATE_REGISTRY: Test registry is OUTDATED"
            echo ""
            cat .registry-outdated
            echo ""
            echo "To fix: pnpm registry:update"
            exit 1
          fi
          echo "✅ GATE_REGISTRY: Registry in sync"

  evidence-collection:
    name: '📊 Registry Evidence'
    runs-on: ubuntu-latest
    needs: registry-sync-check
    if: always()
    
    steps:
      - name: '📊 Collect evidence'
        run: |
          mkdir -p /tmp/registry-evidence
          echo "GATE_REGISTRY Evidence - $(date -Iseconds)" > /tmp/registry-evidence/registry-guard-${{ github.run_id }}.txt
          echo "Status: ${{ needs.registry-sync-check.result }}" >> /tmp/registry-evidence/registry-guard-${{ github.run_id }}.txt
          echo "Commit: ${{ github.sha }}" >> /tmp/registry-evidence/registry-guard-${{ github.run_id }}.txt
      
      - name: '📦 Upload evidence'
        uses: actions/upload-artifact@v4
        with:
          name: registry-guard-evidence
          path: /tmp/registry-evidence/
          retention-days: 90
```

### 5. Script registry-sync.js proposé

```javascript
// scripts/verify/registry-sync.js
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const REGISTRY_PATH = 'registry/test-registry.json';
const OUTDATED_FLAG = '.registry-outdated';

async function main() {
  console.log('📋 Registry Sync Check\n');
  
  // Load registry
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`❌ Registry not found: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const issues = [];
  
  // Check each suite
  for (const suite of registry.suites) {
    console.log(`Checking suite: ${suite.name}`);
    
    // Glob test files
    const testFiles = [];
    for (const pattern of suite.paths) {
      const files = await glob(pattern, { ignore: suite.exclude || [] });
      testFiles.push(...files);
    }
    
    // Check config exists
    if (suite.config && !fs.existsSync(suite.config)) {
      issues.push(`Suite "${suite.name}": config "${suite.config}" not found`);
    }
    
    // Check at least one test file exists
    if (testFiles.length === 0) {
      issues.push(`Suite "${suite.name}": no test files match patterns ${suite.paths.join(', ')}`);
    }
  }
  
  // Check for unregistered test files
  const allTestFiles = await glob('**/*.{test,spec}.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'src-tauri/**']
  });
  
  const registeredPatterns = registry.suites.flatMap(s => s.paths);
  // (simplified check - real implementation would be more thorough)
  
  // Check workflows exist
  for (const gate of registry.gates) {
    const workflowPath = `.github/workflows/${gate.workflow}`;
    if (!fs.existsSync(workflowPath)) {
      issues.push(`Gate "${gate.id}": workflow "${gate.workflow}" not found`);
    }
  }
  
  // Report results
  if (issues.length > 0) {
    console.log('\n❌ Registry issues found:\n');
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    fs.writeFileSync(OUTDATED_FLAG, issues.join('\n'));
    process.exit(1);
  }
  
  // Clean flag if exists
  if (fs.existsSync(OUTDATED_FLAG)) {
    fs.unlinkSync(OUTDATED_FLAG);
  }
  
  console.log('\n✅ Registry is synchronized');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

### 6. Scripts npm proposés

```json
{
  "scripts": {
    "registry:init": "node scripts/registry/init-registry.js",
    "registry:update": "node scripts/registry/update-registry.js",
    "registry:check": "node scripts/verify/registry-sync.js",
    "registry:report": "node scripts/registry/generate-report.js"
  }
}
```

---

## F) RÉSUMÉ EXÉCUTIF

### Statistiques globales

| Catégorie | Count | Détails |
|-----------|-------|---------|
| **Suites Vitest** | 8 | core, unit, integration, architecture, compliance, omega, browser, e2e |
| **E2E Playwright** | 1 suite | ~8 spec files dans e2e/ — **`test:e2e:playwright` (canonique)** |
| **WebdriverIO** | 1 config | ⚡ **Officiellement inclus: `test:e2e:wdio`** |
| **Rust tests** | cargo test | src-tauri/src/**/*.rs |
| **Workflows CI** | 40+ | Dont 11 gates actifs |
| **Scripts audit** | 9 | scripts/audit/ |
| **Scripts verify** | 23 | scripts/verify/ (+ registry-sync.js) |
| **Scripts registry** | 2 | scripts/registry/ (log-event.js, rebuild-snapshot.js) |
| **Commands Tauri** | 250+ | tauriCommands.ts |
| **Allowlist stable** | ~50 allowed | ~15 denied |
| **Gates bloquants** | 7 | P0_1, P0_2, P2, P3_BUILD, P3_REPRO, P4, ⚡ **REGISTRY** |

### Commandes de test essentielles

```bash
# Tests rapides (CI)
pnpm test                    # Core Vitest
pnpm test:rust               # Rust cargo test

# Tests complets
pnpm test:all                # All (core + rust + architecture + compliance)
pnpm test:all:full           # ⚡ All + Playwright + WebdriverIO
pnpm test:100                # 100% (core + browser)
pnpm test:100:full           # Full (core + e2e + browser)

# Coverage
pnpm test:coverage           # Coverage + check
pnpm test:coverage:unit      # Unit (80% threshold)
pnpm test:coverage:integration # Integration (70% threshold)

# E2E (canoniques)
pnpm test:e2e:playwright     # ⚡ Playwright (alias: test:e2e)
pnpm test:e2e:wdio           # ⚡ WebdriverIO
RUN_E2E_TESTS=1 pnpm test:e2e:vitest  # Vitest E2E (Tauri requis)

# Registry (ajouté 2026-01-23)
pnpm registry:log -- --type=TEST_ADDED --desc="..."  # ⚡ Logger événement
pnpm registry:snapshot       # Rebuild snapshot
pnpm verify:registry         # Vérifier sync (CI gate)

# Audit
pnpm audit:master            # Master audit complet
pnpm audit:quality-gates     # Quality gates
```

### Gates CI critiques

| Gate | Condition | Impact |
|------|-----------|--------|
| **GATE_P0_1_SECRETS** | Aucun secret détecté | Bloque merge |
| **GATE_P4_CONSTITUTION** | 7/7 laws | Bloque merge |
| **GATE_P3_REPRO** | Build reproductible | Bloque release |
| **GATE_REGISTRY** | ⚡ Registry synchronisé | Bloque merge |

### ✅ Actions complétées (2026-01-23)

1. ✅ **Créé le registre** `runtime/registry/` avec events.jsonl + snapshot.json
2. ✅ **Implémenté** `.github/workflows/registry-guard.yml` 
3. ✅ **Ajouté scripts** `registry:log`, `registry:snapshot`, `verify:registry` dans package.json
4. ✅ **Ajouté scripts E2E** `test:e2e:playwright`, `test:e2e:wdio`, `test:all:full`
5. ✅ **Documenté** le registre dans `REGISTRY_ULTIME.md`

---

**Fin du rapport INDEX ULTIME — 2026-01-23 (corrigé)**
