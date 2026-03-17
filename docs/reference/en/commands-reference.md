# TITANE∞ — Commands Reference

**Version:** 28.0.0  
**Status:** PROVEN (all commands verified in `package.json` or named script files)  
**Date:** 2026-03-17

> Every command listed here is derived from `package.json` scripts, named shell scripts, or verifiable tooling. No invented commands.

---

## Prerequisites

| Tool | Required version | Check command | Status |
|---|---|---|---|
| Node.js | ≥ 20.x | `node --version` | PROVEN (`.nvmrc` present) |
| pnpm | ≥ 9.x | `pnpm --version` | PROVEN (`.npmrc` enforces pnpm) |
| Rust | 2021 edition | `rustc --version` | PROVEN (`src-tauri/Cargo.toml`) |
| Cargo | latest stable | `cargo --version` | PROVEN |
| Tauri CLI | v2.x | `tauri --version` | PROVEN (`src-tauri/`) |
| Ollama | optional | `ollama --version` | OPTIONAL (local models) |

---

## 1. INSTALL

| Command | Purpose | Source | Risk |
|---|---|---|---|
| `pnpm install` | Install all frontend dependencies | `pnpm-lock.yaml` | SAFE |
| `cargo build` (in `src-tauri/`) | Build Rust backend | `src-tauri/Cargo.toml` | SAFE |

**Note:** `npm install` and `yarn install` are blocked — see `scripts/install/enforce-package-manager.cjs`.

---

## 2. DEVELOPMENT

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run dev` | Launch Tauri dev mode (frontend + backend) | `package.json` → `tauri dev` | dev | SAFE |
| `pnpm run dev:tauri` | Launch Tauri dev with monitor script | `package.json` → `scripts/launch/dev_tauri_monitor.mjs` | dev | SAFE |
| `pnpm run dev:tauri:raw` | Launch full local dev stack via shell | `package.json` → `scripts/launch/deploy_full_local_dev.sh` | dev | SAFE |
| `pnpm run dev:tauri:no-ollama` | Dev mode without Ollama | `package.json` | dev | SAFE |

---

## 3. BUILD

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run build` | Build frontend (Vite) | `package.json` → `vite build` | dev | SAFE |
| `pnpm run build:prod-safe` | Build frontend with strict script isolation | `package.json` | maintainer | SAFE |
| `pnpm run build:production` | Full production build (lint + format + ollama + vite) | `package.json` | maintainer | CAUTION — triggers full pipeline |
| `pnpm run build:tauri:e2e` | Build Tauri binary for E2E testing | `package.json` | dev/CI | CAUTION — requires authorization guard |

---

## 4. LINT & FORMAT

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run lint` | ESLint check on `src/**/*.{ts,tsx,js,jsx}` | `package.json` | dev | SAFE |
| `pnpm run lint:fix` | Auto-fix ESLint violations | `package.json` | dev | SAFE |
| `pnpm run format` | Prettier format all files | `package.json` | dev | SAFE |
| `pnpm run format:check` | Prettier check (CI-safe, no writes) | `package.json` | dev/CI | SAFE |
| `pnpm run check` | TypeScript type-check (`tsc --noEmit`) | `package.json` | dev | SAFE |

---

## 5. TEST

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run test` | Run unit tests (Vitest) | `package.json` | dev | SAFE |
| `pnpm run test:watch` | Run tests in watch mode | `package.json` | dev | SAFE |
| `pnpm run test:coverage` | Run tests with coverage report | `package.json` | dev | SAFE |
| `pnpm run test:rust` | Run Rust tests (`cargo test`) | `package.json` | dev | SAFE |
| `pnpm run test:e2e` | Run Playwright E2E tests | `package.json` | dev | CAUTION — needs running app |
| `pnpm run e2e:desktop` | Run WDIO desktop E2E suite | `package.json` | dev | CAUTION — needs Tauri build |
| `pnpm run test:all` | Run all test suites | `package.json` | CI/maintainer | CAUTION |
| `pnpm run test:architecture` | Run architecture compliance tests | `package.json` | dev | SAFE |

---

## 6. VERIFY / GATES

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run verify` | Full verify (lint + format + check + tests) | `package.json` | CI | SAFE |
| `pnpm run verify:tauri-only` | Enforce Tauri-only runtime policy | `scripts/verify/enforce-tauri-only.sh` | CI | SAFE |
| `pnpm run verify:online-first` | Enforce online-first doctrine | `scripts/verify/enforce-online-first.sh` | CI | SAFE |
| `pnpm run verify:instructions` | Run Copilot instructions verifier | `scripts/verify/verify-copilot-instructions.sh` | CI/dev | SAFE |
| `pnpm run verify:tauri-configs` | Validate Tauri config consistency | `scripts/verify/validate-tauri-configs.sh` | CI | SAFE |
| `pnpm run verify:network-guard` | Guard network policy compliance | `scripts/guards/guard-network-policy.sh` | CI | SAFE |
| `bash scripts/verify_instructions.sh` | Run full instruction gate (PASS=20 expected) | `scripts/verify_instructions.sh` | dev/CI | SAFE |
| `bash scripts/autoheal/detect_recurrence.sh` | Check for autoheal rule recurrences | `scripts/autoheal/detect_recurrence.sh` | dev/CI | SAFE |

---

## 7. OLLAMA (LOCAL AI)

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run ollama:start` | Start Ollama server | `package.json` → `ollama serve` | user/dev | SAFE |
| `pnpm run ollama:status` | Check Ollama status | `package.json` → `curl http://127.0.0.1:11434/api/tags` | user/dev | SAFE |
| `pnpm run ollama:pull` | Pull llama3.2:latest model | `package.json` | dev | CAUTION — downloads large model |

---

## 8. REGISTRY & AUDIT

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run registry:log` | Log registry event | `package.json` | dev | SAFE |
| `pnpm run registry:snapshot` | Create registry snapshot | `package.json` | maintainer | SAFE |
| `pnpm run audit` | Run full audit pipeline | `package.json` | maintainer | SAFE |
| `pnpm run auto-heal` | Run auto-heal scripts | `package.json` | maintainer | CAUTION |

---

## 9. CLEAN

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run clean` | Clean build artifacts | `package.json` | dev | SAFE |
| `pnpm run clean:all` | Deep clean (includes caches) | `package.json` | dev | CAUTION — removes all build outputs |

---

## 10. GOVERNANCE (RESTRICTED)

| Command | Purpose | Source | Audience | Risk |
|---|---|---|---|---|
| `pnpm run gate:all` | Run all production gates | `package.json` | maintainer | CAUTION |
| `pnpm run gate:prod-boot` | Run prod boot gate | `package.json` | maintainer | CAUTION |
| `pnpm run stopline:latest` | Check stop-the-line status | `package.json` | maintainer | SAFE |
| `bash scripts/gates/g1-no-offline-without-reason.sh` | G1 gate: no offline without reason | `scripts/gates/` | CI | SAFE |
| `bash scripts/gates/g3-legacy-divergence.sh` | G3 gate: legacy divergence check | `scripts/gates/` | CI | SAFE |

---

## 11. ROLLBACK

Rollback is always performed via targeted `git restore`:

```bash
# Rollback docs changes only
git restore -- docs/

# Rollback a specific file
git restore -- path/to/file.ts

# Check what would change
git diff --name-only
```

---

## 12. NOT AVAILABLE / BLOCKED

| Command | Reason | Status |
|---|---|---|
| `pnpm run preview` | Blocked — Tauri-only mode enforced | RESTRICTED |
| `pnpm run start` | Blocked — use `pnpm run dev` instead | RESTRICTED |
| `npm install` / `yarn install` | Blocked by preinstall check | RESTRICTED |

---

*Source: `package.json`, `scripts/` directory | Generated: 2026-03-17*
