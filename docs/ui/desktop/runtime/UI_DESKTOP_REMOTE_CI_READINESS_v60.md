# UI Desktop Remote CI Readiness — v60

**Date**: 2026-05-10

## Status: READY FOR LOCAL CI

The v60 strict proof gate is ready for local governed runs. Remote CI integration requires one additional step.

---

## Local CI Integration (Complete)

| Step | Status |
|---|---|
| `pnpm run verify:backend-proof-depth` | ✅ available |
| `pnpm run verify:backend-proof-depth:strict` | ✅ available (new in v60) |
| v60 spec pattern: `ui-desktop-strict-backend-proof-*.wdio.test.js` | ✅ 5 files ready |
| Artifact: `v60-strict-backend-proof.jsonl` (53 records) | ✅ generated |
| Helper: full v60 schema auto-injection | ✅ patched |

---

## Remote CI Requirements

To run in GitHub Actions / remote CI:

```yaml
jobs:
  backend-proof-depth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Install deps
        run: pnpm install
      - name: Run Tauri binary (background)
        run: |
          TAURI_BINARY=src-tauri/target/release/titane-infinity
          # Requires: xvfb-run for headless
          xvfb-run --auto-servernum $TAURI_BINARY &
          sleep 5
      - name: Run v60 strict E2E suite
        env:
          TITANE_ENFORCE_BINARY_FRESHNESS: 0
          TITANE_E2E_FULL: 1
          TITANE_PROOF_ARTIFACT: artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl
          WDIO_SPEC: e2e/desktop/ui-desktop-strict-backend-proof-*.wdio.test.js
        run: node scripts/e2e/run-desktop-suite.js
      - name: Verify strict (FAIL:0 required)
        env:
          TITANE_PROOF_ARTIFACT: artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl
        run: pnpm run verify:backend-proof-depth:strict
```

**Blockers for remote CI**:
- Requires Tauri binary pre-built (add `cargo build --release` step)
- Requires `xvfb-run` for headless display
- Requires WebKitWebDriver + tauri-driver installed in runner

**Estimated effort**: ~2h to configure full GitHub Actions pipeline with Tauri binary caching.
