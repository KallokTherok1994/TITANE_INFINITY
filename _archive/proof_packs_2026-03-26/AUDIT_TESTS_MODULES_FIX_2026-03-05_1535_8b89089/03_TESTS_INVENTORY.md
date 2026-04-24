# 03_TESTS_INVENTORY — Inventaire Complet des Tests

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Statistiques

| Catégorie                             | Fichiers |
| ------------------------------------- | -------- |
| TS Unit (`src/__tests__/`)            | 136      |
| TS Services/Components (dispersés)    | ~65      |
| E2E Playwright (`tests/e2e/`, `e2e/`) | ~20      |
| Rust (`src-tauri/tests/`)             | 20       |
| **TOTAL**                             | **261**  |

---

## Commandes de Test Réelles (package.json)

```bash
# Tests principaux
pnpm test                       # Vitest run (global)
pnpm test:all                   # test + test:rust + test:architecture + test:compliance
pnpm test:all:full              # test:all + e2e:playwright
pnpm test:coverage              # test + coverage check
pnpm test:coverage:unit         # Unit coverage
pnpm test:coverage:integration  # Integration coverage
pnpm test:architecture          # Inclus dans test:all
pnpm test:compliance            # Inclus dans test:all
pnpm test:rust                  # cargo test --workspace --manifest-path src-tauri/Cargo.toml
pnpm test:e2e                   # playwright test e2e
pnpm test:e2e:playwright        # playwright test e2e
pnpm test:e2e:vitest            # TITANE_E2E_TAURI=1 (runtime requis)
pnpm test:browser               # vitest --config vitest.browser.config.ts
pnpm guard:ipc-contract         # vitest run tests/contract/tauri-ipc-contract.test.ts
pnpm e2e:desktop                # guard:ollama-proxy + WDIO desktop

# Lint/Format/Check
pnpm lint                       # eslint "src/**/*.{ts,tsx,js,jsx}"
pnpm lint:fix                   # eslint --fix
pnpm format:check               # prettier --check .
pnpm format                     # prettier --write .
pnpm check                      # tsc --noEmit

# Verify (chaîne complète)
pnpm verify                     # lint + format:check + check + test:all + verify:tauri-only + ...
pnpm verify:final100            # check + lint + format:check + verify:tauri-only
```

---

## Emplacements Tests

| Dossier                       | Contenu                                            | Nb fichiers |
| ----------------------------- | -------------------------------------------------- | ----------- |
| `src/__tests__/`              | Architecture, AI, chat, boot, compliance, security | 136         |
| `src/__tests__/architecture/` | engine-isolation.test.ts                           | 1           |
| `src/__tests__/compliance/`   | Compliance tests                                   | ~5          |
| `src/components/__tests__/`   | UI components                                      | ~10         |
| `src/services/*/___tests__/`  | Service unit tests                                 | ~15         |
| `tests/`                      | Organised test suites                              | ~45         |
| `tests/unit/`                 | Unit tests (cognitive, devops, fusion...)          | 12          |
| `tests/contract/`             | IPC contract tests                                 | 2           |
| `tests/integration/`          | Integration pipeline tests                         | 5           |
| `tests/e2e/`                  | Playwright E2E specs                               | 8           |
| `tests/security/`             | Security tests                                     | 1           |
| `tests/phase2/` à `phase6/`   | Phase gate tests                                   | 5           |
| `tests/performance/`          | Benchmark tests                                    | 1           |
| `tests/chat/`                 | Chat unit tests                                    | 1           |
| `e2e/`                        | Desktop E2E (WDIO + Playwright)                    | ~10         |
| `src-tauri/tests/`            | Rust integration tests                             | 20          |

---

## Runners E2E Identifiés

| Runner                  | Config                                    | Déclencheur                |
| ----------------------- | ----------------------------------------- | -------------------------- |
| **Playwright**          | `playwright.config.ts`                    | `pnpm test:e2e:playwright` |
| **WDIO + tauri-driver** | `wdio.desktop.conf.cjs`                   | `pnpm e2e:desktop`         |
| **Vitest (mode Tauri)** | `vitest.config.ts` + `TITANE_E2E_TAURI=1` | `pnpm test:e2e:vitest`     |

---

## Tests Clés (Impact Élevé)

| Fichier                                               | Rôle                                                          | Module   |
| ----------------------------------------------------- | ------------------------------------------------------------- | -------- |
| `src/__tests__/architecture/engine-isolation.test.ts` | Vérifie que Ring 2 engines n'importent pas services/lib/tauri | Ring 2   |
| `tests/contract/tauri-ipc-contract.test.ts`           | Vérifie coverage invoke↔#[tauri::command]                     | IPC      |
| `tests/contract/tauri.contract.test.ts`               | Contrat IPC étendu                                            | IPC      |
| `tests/security/advanced-security.test.ts`            | Tests sécurité avancés                                        | Security |
| `src/lib/security/__tests__/policyFirewallV2.test.ts` | PolicyFirewall V2                                             | Security |
| `tests/phase3/gate-p3.test.ts` à `phase6/`            | Gate tests (P3→P6)                                            | CI Gates |
| `tests/integration/full-pipeline.test.ts`             | Pipeline complet                                              | Services |
| `src/__tests__/c1-contracts.test.ts`                  | Contrats C1                                                   | IPC      |

---

## Status Exécution Tests

| Commande            | Statut Local        | Raison                  |
| ------------------- | ------------------- | ----------------------- |
| `pnpm test`         | 🔴 BLOCKED          | node_modules absent     |
| `pnpm test:all`     | 🔴 BLOCKED          | node_modules absent     |
| `cargo test --all`  | 🔴 BLOCKED          | GTK/glib absent         |
| `pnpm lint`         | 🔴 BLOCKED          | node_modules absent     |
| `pnpm format:check` | 🔴 BLOCKED          | node_modules absent     |
| `pnpm check`        | 🔴 BLOCKED          | node_modules absent     |
| CI (ci-unified.yml) | 🟡 BLOCKED_APPROVAL | Human approval required |
