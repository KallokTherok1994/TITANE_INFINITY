# 01_BOOTSTRAP — G_BOOT_TRUTH
**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z  
**SHA:** 0f7d943  
**Branch:** copilot/audit-modules-and-generate-plan

---

## Commands Executed & Output

```
$ pwd
/home/runner/work/TITANE_INFINITY/TITANE_INFINITY

$ uname -a
Linux ... (GitHub Actions runner, x86_64 Linux)

$ node -v
v24.14.0

$ pnpm -v
bash: pnpm: command not found   ← BLOCKED_PARTIAL (pnpm not installed in runner)

$ rustc -V
rustc 1.93.1 (01f6ddf75 2026-02-11)

$ cargo -V
cargo 1.93.1 (083ac5135 2025-12-15)

$ git status
On branch copilot/audit-modules-and-generate-plan

$ git rev-parse --short HEAD
0f7d943

$ git branch --show-current
copilot/audit-modules-and-generate-plan

$ git log -20 --oneline
0f7d943 (HEAD -> copilot/audit-modules-and-generate-plan, origin/copilot/audit-modules-and-generate-plan) Initial plan
f920f86 (grafted) feat(e2e): add clickElementSafely helper to ui-driver

$ du -sh .
1.2G .

$ du -h --max-depth=2 . | sort -h | tail -n 25
3.9M  ./proof_packs
4.1M  ./scripts
4.1M  ./src/services
4.2M  ./reports/seal
4.4M  ./docs/backup_20251218_122526
4.4M  ./docs/backup_20251218_122540
4.4M  ./docs/backup_20251218_123316
5.8M  ./docs/reports
8.5M  ./docs/_evidence
9.5M  ./deployment/v26.4.0
9.5M  ./docs/archive
13M   ./src-tauri/src
14M   ./src-tauri
15M   ./reports
21M   ./runtime
21M   ./runtime/stable
22M   ./deployment/v27.0.0-PRODUCTION
23M   ./docs/99_ARCHIVE
23M   ./src
27M   ./docs/__AUDITS__
77M   ./docs/01_misc
174M  ./.tools
174M  ./.tools/node
179M  ./docs
190M  ./.git/lfs
213M  ./.git/objects
240M  ./deployment/latest
272M  ./deployment
405M  ./.git
1.2G  .
```

## Node Modules Status

```
$ ls node_modules/.bin/ 2>/dev/null || echo "no node_modules"
no node_modules
```

**CONSEQUENCE:** All npm scripts (vitest, eslint, prettier, cross-env) are BLOCKED. Tests, lint, format checks cannot run without `pnpm install`.

## Key Observations

| Tool    | Version        | Status      |
|---------|----------------|-------------|
| node    | v24.14.0       | ✅ FOUND    |
| pnpm    | N/A            | ❌ NOT FOUND|
| rustc   | 1.93.1         | ✅ FOUND    |
| cargo   | 1.93.1         | ✅ FOUND    |

## Top Directory Structure

```
Root: 44 directories + files at depth 1
Key dirs:
  src/          (23MB) — Frontend TypeScript + React
  src-tauri/    (14MB) — Tauri/Rust backend
  scripts/      (4.1MB) — Build/verify/CI scripts
  docs/         (179MB) — Documentation (large, LFS)
  deployment/   (272MB) — Deployment artifacts (large, LFS)
  .git/         (405MB) — Git objects (LFS)
  reports/      (15MB) — Proof reports
  proof_packs/  (3.9MB) — Existing proof packs
  registry/     — Event/UI registries
  e2e/          — E2E tests
  tests/        — Unit/integration tests
```

## Cargo Check Result

```
$ cd src-tauri && cargo check --message-format=short
ERROR: failed to run custom build command for `glib-sys v0.18.1`
  The system library `glib-2.0` required by crate `glib-sys` was not found.
  The system library `gobject-2.0` required by crate `gobject-sys` was not found.
```

**STATUS:** BLOCKED_BUILD — GTK/GLib system libraries not present in runner. Tauri requires GTK for Linux compilation.

## Summary

- **Git**: 2 commits only (shallow clone). Branch: `copilot/audit-modules-and-generate-plan`.
- **pnpm**: NOT available → all TS tooling BLOCKED.
- **Rust/Cargo**: Available but build requires GTK libs → BLOCKED.
- **Repo size**: 1.2GB total (heavy LFS usage in docs/deployment).
