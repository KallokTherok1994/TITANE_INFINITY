# 🖥️ BOOTSTRAP ENVIRONMENT REPORT (TITANE∞ v27.4.0)

**Date**: 7 février 2026  
**Machine**: titane-Aspire-A317-51G  
**OS**: Ubuntu 24.04.3 LTS (Noble Numbat)

---

## ✅ System Specs

| Item | Value |
|------|-------|
| **CPU** | 8 cores (x86_64) |
| **RAM** | 35 GiB total (22 GiB available) |
| **Disk** | 439 GiB total / 350 GiB free (79% available) |
| **Kernel** | Linux 6.17.0-14-generic |

---

## ✅ Base Tools

| Tool | Version | Status |
|------|---------|--------|
| git | 2.43.0 | ✅ OK |
| bash | 5.2.21 | ✅ OK |
| curl | 8.5.0 | ✅ OK |
| jq | 1.7 | ✅ OK |
| python3 | 3.12.3 | ✅ OK |
| gcc | 13.3.0 | ✅ OK |
| build-essential | Installed | ✅ OK |

---

## ✅ Node.js & Package Manager

| Tool | Version | Status | Notes |
|------|---------|--------|-------|
| **Node.js** | 22.22.0 (LTS) | ✅ UPGRADED | Was v20.19.6; needed for react-chrono@3.3.3 |
| **npm** | 10.9.4 | ✅ OK | |
| **pnpm** | 10.28.2 | ✅ OK | Correct version per packageManager field |
| **Corepack** | 0.34.1 | ✅ OK | |

---

## ✅ Rust Toolchain

| Tool | Version | Status |
|------|---------|--------|
| **rustc** | 1.93.0 | ✅ OK |
| **cargo** | 1.93.0 | ✅ OK |
| **Target** | default | ✅ OK |

---

## ✅ Tauri v2 Dependencies (Linux / WebKit2GTK)

| Package | Version | Status |
|---------|---------|--------|
| libwebkit2gtk-4.1 | 2.50.4 | ✅ OK |
| libwebkit2gtk-4.1-dev | 2.50.4 | ✅ OK |
| libgtk-3 | 3.24.41 | ✅ OK |
| libgtk-3-dev | 3.24.41 | ✅ OK |
| libssl | 3.0.13 | ✅ OK |
| librsvg2 | 2.58.0 | ✅ OK |
| libayatana-appindicator3 | 0.5.93 | ✅ OK |
| libxdo | 3.20160805.1 | ✅ OK |

---

## ⚠️ E2E Testing Dependencies

| Package | Status | Notes |
|---------|--------|-------|
| **WebKitWebDriver** | ⏳ OPTIONAL | `webkit2gtk-driver` available in apt; install if E2E required |
| **Playwright** | ✅ OK | Installed via pnpm dependencies |

---

## ✅ Git Repository Status

| Item | Status |
|------|--------|
| **Branch** | MAIN |
| **HEAD** | b60ff9ca (📋 docs: Deployment artifacts completion report v27.4.1) |
| **Working Tree** | Clean (no uncommitted changes) |
| **Lock File** | Up-to-date |

---

## 📦 Node Dependencies

✅ `pnpm install` completed successfully:
- **Duration**: ~3s
- **Status**: Lockfile up-to-date
- **Warnings**: Some build scripts require approval (tauri, edgedriver, geckodriver) — non-blocking

---

## ⚠️ Verification Status: LINT FAILED

### Issue: ESLint Errors (React Rules)

The `pnpm run verify` command initiates these stages:
1. **lint** ❌ FAILED (ESLint errors found)
2. format:check ⏸️ NOT REACHED
3. check (TypeScript) ⏸️ NOT REACHED
4. test:all ⏸️ NOT REACHED
5. verify:tauri-only ⏸️ NOT REACHED
6. verify:local-first ⏸️ NOT REACHED
7. verify:tauri-configs ⏸️ NOT REACHED

### Errors Found (ESLint):

**Total Lint Errors**: ~9-10 files with React hook violations

- **react-hooks/rules-of-hooks**: setState before declaration
- **react-hooks/set-state-in-effect**: Synchronous setState in effects
- **react-hooks/purity**: Impure function calls (Date.now()) in render

**Affected Files**:
- src/components/notifications/ToastContainer.tsx
- src/components/panels/GovernancePanel.tsx
- src/components/performance/MetricsGraph.tsx
- src/components/performance/PerformanceDashboard.tsx
- src/components/performance/PerformanceIssues.tsx
- src/components/ui/LazyImage.tsx
- **(and possibly others)**

---

## 🔧 Next Steps

1. **Fix ESLint Errors**: Refactor React components to comply with hook rules
   - Move `dismissToast` declaration before usage
   - Fix setState in effects
   - Avoid impure functions in render paths

2. **Re-run Verification**: `pnpm run verify` should pass

3. **Launch Dev**: `pnpm run dev:tauri` (if all verifications pass)

4. **Run Full Test Suite**: `pnpm run test:all` + `pnpm run test:rust`

5. **Build Stable**: `pnpm run beta:build` or ./runtime/stable/build.sh

---

## ✅ System Ready for Development

**Despite lint errors**, the environment is **fully configured**:
- ✅ All runtime tools installed (Node 22, pnpm, Rust, Tauri deps)
- ✅ Repo cloned and dependencies resolved
- ✅ No system-level issues

**Blocker**: Code quality gates (ESLint) must be resolved before proceeding with full verify/test/build pipeline.

---

**ENV_REPORT Status**: INCOMPLETE (awaiting lint fixes)
