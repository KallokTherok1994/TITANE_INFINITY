# 02_SCOPE — Périmètre et Verrous
**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Rings en Usage Réel (dérivés de l'arborescence)

| Ring | Contenu | Contraintes |
|------|---------|-------------|
| R1 Types | `src/types/`, `src/constants/` | Zéro imports, zéro I/O |
| R2 Engines | `src/engines/` (20 moteurs TS) + `src-tauri/src/engines/` (9 Rust) | Imports R1 seulement, **zéro I/O** |
| R3 Services | `src/services/` (56 modules), `src/lib/`, `src/core/`, `src/os/bridge/`, `src-tauri/src/overdrive/` | I/O orchestré, imports R1+R2 |
| R4 UI+Runtime+CI | `src/components/`, `src/pages/`, `src/features/`, `src/apps/`, `src-tauri/src/commands/` (1283), `.github/workflows/` (44) | Tout ring |

---

## Surfaces I/O

| Surface | Type | Détails |
|---------|------|---------|
| Réseau backend | Network | `src-tauri/src/overdrive/chat_orchestrator.rs` → Ollama/Gemini/OpenAI via reqwest+timeout |
| Réseau Ring 2 | **VIOLATION** | `engines/unified_memory/summarizer.rs:315`, `embeddings.rs:216` → HttpClient direct |
| IPC | IPC | `@tauri-apps/api/core` → `invoke()` via `tauriClient.ts` |
| FS | FS | `registry/*.jsonl`, `reports/`, `proof_packs/`, `data/` |
| Process | Process | `scripts/*.sh` executables |
| Tests | FS mock | `tests/mocks/tauri.ts`, `tests/mocks/tauriCore.ts` |

---

## Tests Attendus

| Type | Runner | Commande | Configs |
|------|--------|----------|---------|
| Unit | Vitest | `pnpm test` | `vitest.config.ts` |
| Integration | Vitest | `pnpm test:coverage:integration` | `vitest.integration.config.ts` |
| Architecture | Vitest | `pnpm test:architecture` (via `test:all`) | engine-isolation.test.ts |
| Compliance | Vitest | `pnpm test:compliance` | — |
| E2E Playwright | Playwright | `pnpm test:e2e:playwright` | `playwright.config.ts` |
| E2E Desktop | WDIO | `pnpm e2e:desktop` | `wdio.desktop.conf.cjs` |
| E2E Vitest | Vitest | `TITANE_E2E_TAURI=1 pnpm test:e2e:vitest` | Runtime Tauri requis |
| Rust | Cargo | `cargo test --all` | `src-tauri/Cargo.toml` |
| Lint | ESLint | `pnpm lint` | `.eslintrc*` |
| Format | Prettier | `pnpm format:check` | `.prettierrc*` |
| TypeCheck | TSC | `pnpm check` | `tsconfig.json` |

---

## Règles Audit Dual-Lane

| Règle | Description |
|-------|-------------|
| No-refactor | Aucun refactoring gratuit |
| Corrections minimales | 1-3 actions max par FIX |
| 1 commit/FIX | Traçabilité atomique |
| lane-ui | UI/docs only (EXP) — interdit: src-tauri, allowlist, CI, gates |
| lane-proof | Code qualifiable (R1/R2/R3/src-tauri/CI) — seul lane QUALIFIED/STABLE |
| Audit-only ce run | Aucun code source modifié (env BLOCKED) |
