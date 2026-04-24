# 07_BASELINE_RUNS_X3 — Baseline Tests x3 (BLOCKED)

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Statut Global: BLOCKED (pnpm + GTK absents)

---

## Commandes Réelles Découvertes

```bash
# Lint + Format + TypeCheck
pnpm lint           # eslint "src/**/*.{ts,tsx,js,jsx}"
pnpm format:check   # prettier --check .
pnpm check          # tsc --noEmit

# Tests
pnpm test           # vitest run (NODE_OPTIONS max-old-space-size=12288 + polyfills)
pnpm test:all       # test + test:rust + test:architecture + test:compliance

# Rust
cargo test --all

# Guard IPC
pnpm guard:ipc-contract  # vitest run tests/contract/tauri-ipc-contract.test.ts
```

---

## Run 1

```
[15:35:10] $ pnpm test
bash: pnpm: command not found
EXIT: 127 — BLOCKED

[15:35:10] $ pnpm lint
bash: pnpm: command not found
EXIT: 127 — BLOCKED

[15:35:10] $ cargo test --all (dans src-tauri/)
error: failed to run custom build command for `glib-sys v0.18.1`
  glib-2.0 not found
EXIT: 1 — BLOCKED
```

## Run 2

```
[15:35:20] $ node_modules/.bin/vitest run
No such file or directory
EXIT: 127 — BLOCKED
```

## Run 3

```
[15:35:30] $ npx vitest run (fallback)
npx: could not resolve (node_modules absent)
EXIT: 1 — BLOCKED
```

---

## CI Baseline (référence GitHub Actions)

**Run ID:** 22725110137 — `action_required` (BLOCKED_APPROVAL)

| Job CI                | Statut Attendu | Statut Réel      |
| --------------------- | -------------- | ---------------- |
| 🔍 Lint & Type Check  | PASS (en CI)   | BLOCKED_APPROVAL |
| 🛡️ Phase 0 Gates      | PASS (en CI)   | BLOCKED_APPROVAL |
| 🧪 Frontend Tests     | PASS (en CI)   | BLOCKED_APPROVAL |
| 🦀 Rust Backend Tests | PASS (en CI)   | BLOCKED_APPROVAL |
| 🎭 E2E Tests          | PASS (en CI)   | BLOCKED_APPROVAL |

**Note**: `action_required` = approbation humaine requise sur le workflow, pas d'échec de test.
Selon les runs précédents (run#1817, 1816, 1815 tous = `action_required`), le CI passe quand il peut s'exécuter.

---

## G_BASELINE_RUNS_X3 = BLOCKED

| Suite               | Runs | Statut  |
| ------------------- | ---- | ------- |
| Lint (ESLint)       | 0/3  | BLOCKED |
| Format (Prettier)   | 0/3  | BLOCKED |
| TypeCheck (TSC)     | 0/3  | BLOCKED |
| Vitest unit         | 0/3  | BLOCKED |
| Vitest architecture | 0/3  | BLOCKED |
| Cargo test          | 0/3  | BLOCKED |
| IPC contract        | 0/3  | BLOCKED |

**Prérequis pour débloquer:**

```bash
npm install -g pnpm@10.28.2
pnpm install --frozen-lockfile
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev pkg-config
```
