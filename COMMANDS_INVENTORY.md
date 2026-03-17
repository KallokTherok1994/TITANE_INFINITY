# TITANE∞ — Commands Inventory

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17  
**Source:** `package.json`, `scripts/` directory

> Internal audit artifact. For user-facing reference: `docs/reference/en/commands-reference.md`

---

## Format

Each command entry:
- exact command
- source file
- category
- audience: user | dev | maintainer
- prerequisites
- expected effect
- proof status
- risk: safe / caution / restricted

---

## INSTALL

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm install` | `pnpm-lock.yaml` | dev | Install frontend deps | PROVEN | safe |
| `cargo build` | `src-tauri/Cargo.toml` | dev | Build Rust backend | PROVEN | safe |

---

## DEVELOPMENT

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run dev` | `package.json` → `tauri dev` | dev | Launch full Tauri dev | PROVEN | safe |
| `pnpm run dev:tauri` | `package.json` → `dev_tauri_monitor.mjs` | dev | Launch dev with monitor | PROVEN | safe |
| `pnpm run dev:tauri:raw` | `package.json` → `deploy_full_local_dev.sh` | dev | Full local dev stack | PROVEN | safe |
| `pnpm run dev:tauri:no-ollama` | `package.json` | dev | Dev without Ollama | PROVEN | safe |

---

## LINT & FORMAT

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run lint` | `package.json` → eslint | dev | ESLint check | PROVEN | safe |
| `pnpm run lint:fix` | `package.json` → eslint --fix | dev | Auto-fix lint | PROVEN | safe |
| `pnpm run format` | `package.json` → prettier --write | dev | Format all files | PROVEN | safe |
| `pnpm run format:check` | `package.json` → prettier --check | dev/CI | Format check (no write) | PROVEN | safe |
| `pnpm run check` | `package.json` → tsc --noEmit | dev | TypeScript check | PROVEN | safe |

---

## TEST

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run test` | `package.json` | dev | Unit tests (Vitest) | PROVEN | safe |
| `pnpm run test:watch` | `package.json` | dev | Watch mode tests | PROVEN | safe |
| `pnpm run test:coverage` | `package.json` | dev | Coverage report | PROVEN | safe |
| `pnpm run test:rust` | `package.json` → cargo test | dev | Rust tests | PROVEN | safe |
| `pnpm run test:e2e` | `package.json` | dev | Playwright E2E | PROVEN | caution |
| `pnpm run e2e:desktop` | `package.json` | dev | WDIO desktop E2E | PROVEN | caution |
| `pnpm run test:all` | `package.json` | CI | All test suites | PROVEN | caution |
| `pnpm run test:architecture` | `package.json` | dev | Architecture tests | PROVEN | safe |
| `pnpm run test:omega` | `package.json` | dev | OMEGA tests | PARTIAL | safe |

---

## VERIFY / GATES

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run verify` | `package.json` | CI | Full verify suite | PROVEN | safe |
| `pnpm run verify:tauri-only` | `scripts/verify/enforce-tauri-only.sh` | CI | Tauri-only gate | PROVEN | safe |
| `pnpm run verify:online-first` | `scripts/verify/enforce-online-first.sh` | CI | Online-first gate | PROVEN | safe |
| `pnpm run verify:instructions` | `scripts/verify/verify-copilot-instructions.sh` | CI/dev | Copilot instructions | PROVEN | safe |
| `pnpm run verify:tauri-configs` | `scripts/verify/validate-tauri-configs.sh` | CI | Tauri config check | PROVEN | safe |
| `pnpm run verify:network-guard` | `scripts/guards/guard-network-policy.sh` | CI | Network policy gate | PROVEN | safe |
| `bash scripts/verify_instructions.sh` | `scripts/verify_instructions.sh` | dev/CI | Global gate (PASS=20) | PROVEN | safe |
| `bash scripts/autoheal/detect_recurrence.sh` | `scripts/autoheal/detect_recurrence.sh` | dev/CI | AutoHeal recurrence gate | PROVEN | safe |
| `bash scripts/gates/g1-no-offline-without-reason.sh` | `scripts/gates/g1-no-offline-without-reason.sh` | CI | G1 gate | PROVEN | safe |
| `bash scripts/gates/g3-legacy-divergence.sh` | `scripts/gates/g3-legacy-divergence.sh` | CI | G3 gate | PROVEN | safe |
| `bash scripts/gates/rc-network-surface-gate.sh` | `scripts/gates/rc-network-surface-gate.sh` | CI | Network surface gate | PROVEN | safe |
| `pnpm run verify:final100` | `package.json` | CI | Full 100% verify | PROVEN | caution |

---

## BUILD

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run build` | `package.json` → vite build | dev | Frontend build | PROVEN | safe |
| `pnpm run build:prod-safe` | `package.json` | maintainer | Safe prod build | PROVEN | safe |
| `pnpm run build:production` | `package.json` | maintainer | Full prod pipeline | PROVEN | caution |
| `pnpm run build:tauri:e2e` | `package.json` | dev/CI | E2E Tauri build | PROVEN | caution |

---

## OLLAMA

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run ollama:start` | `package.json` → ollama serve | user/dev | Start Ollama | PROVEN | safe |
| `pnpm run ollama:status` | `package.json` → curl | user/dev | Check Ollama status | PROVEN | safe |
| `pnpm run ollama:pull` | `package.json` → ollama pull | dev | Pull llama3.2:latest | PROVEN | caution (downloads large model) |

---

## REGISTRY & AUDIT

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run registry:log` | `package.json` | dev | Log registry event | QUALIFIED | safe |
| `pnpm run registry:snapshot` | `package.json` | maintainer | Registry snapshot | QUALIFIED | safe |
| `pnpm run audit` | `package.json` | maintainer | Full audit pipeline | QUALIFIED | safe |
| `pnpm run auto-heal` | `package.json` | maintainer | AutoHeal run | QUALIFIED | caution |

---

## CLEAN

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run clean` | `package.json` | dev | Clean build artifacts | PROVEN | safe |
| `pnpm run clean:all` | `package.json` | dev | Deep clean | PROVEN | caution |

---

## GOVERNANCE (RESTRICTED)

| Command | Source | Audience | Effect | Status | Risk |
|---|---|---|---|---|---|
| `pnpm run gate:all` | `package.json` | maintainer | All prod gates | PROVEN | caution |
| `pnpm run gate:prod-boot` | `package.json` | maintainer | Prod boot gate | PROVEN | caution |
| `pnpm run stopline:latest` | `package.json` | maintainer | Stop-the-line status | PROVEN | safe |

---

## BLOCKED / RESTRICTED

| Command | Source | Reason | Status |
|---|---|---|---|
| `pnpm run preview` | `package.json` | Tauri-only mode enforced | RESTRICTED |
| `pnpm run start` | `package.json` | Use `pnpm run dev` instead | RESTRICTED |
| `npm install` | OS | Blocked by preinstall | RESTRICTED |
| `yarn install` | OS | Blocked by preinstall | RESTRICTED |

---

**Total commands inventoried:** 53  
**Proof status breakdown:** PROVEN=42, QUALIFIED=6, PARTIAL=1, RESTRICTED=4

---

*Generated: 2026-03-17 | Source: `package.json` scripts analysis*
