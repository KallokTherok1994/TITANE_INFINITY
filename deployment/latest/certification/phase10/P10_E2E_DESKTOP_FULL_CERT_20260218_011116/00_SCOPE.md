# P10 E2E DESKTOP CERTIFICATION - FULL SCOPE

**Mode**: CONSTITUTIONAL / PROOF-DRIVEN / STOP-THE-LINE
**Objective**: Execute P10 complete autonomous orchestration
**Local-first**: Tauri-only, 4-Ring, allowlist strict, reproducible build

## Phases Executed

A) CREATE P10 WORKDIR (proof pack structure)
B) PRECHECKS (git/tools/ports - hard stop if fail)
C) SANDBOX SETUP (runtime isolation HOME/XDG/TMPDIR)
D) INSTALL (frozen lockfile, no drift)
E) BUILD SAFE (NPM_CONFIG_IGNORE_SCRIPTS=1, no postbuild)
F) UNIT TESTS x3 (auto)
G) INTEGRATION TESTS x3 (auto)
H) DESKTOP E2E x3 (WebdriverIO, sandboxed, artifacts collected)
I) SCANS x3 (no dev server, no network)
J) NO REAL WRITES PROOF (sandbox confinement)
K) ARTIFACT INDEX + SEAL (SHA256SUMS, LOCK, VERDICT, ROLLBACK)
L) COMMIT + REGISTRY APPEND (if PASS/FAIL)
M) FINAL OUTPUT (required keys)

## Stop-the-line Conditions

1. git status non-clean (except P10 workdir)
2. port 4444 occupied before run
3. dev servers detected (5173/3000/8080/9000)
4. network outbound non-local detected
5. writes outside SANDBOX_DIR during E2E
6. tests skipped (x3 required)
7. harness crash non-triaged

## Critical Anti-Mutation

- NO postbuild execution (writes ~/.local/share)
- Build with NPM_CONFIG_IGNORE_SCRIPTS=1
- Runtime E2E isolation via SANDBOX env (HOME/XDG/TMPDIR)

