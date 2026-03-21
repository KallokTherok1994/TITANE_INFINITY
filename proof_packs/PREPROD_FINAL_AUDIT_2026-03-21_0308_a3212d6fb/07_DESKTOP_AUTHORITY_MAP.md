# 07_DESKTOP_AUTHORITY_MAP

Canonical native desktop command:

- `TITANE_E2E_ARTIFACTS_DIR=<dir> WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js node scripts/e2e/run-desktop-suite.js`

Artifact selected in this audit:

- `src-tauri/target/release/titane-infinity`
- Class: `FRESH_RELEASE_BINARY`
- Selection reason: `RELEASE_PREFERRED_POLICY`

Desktop authority proof:

- run-1 PASS
- run-2 PASS
- run-3 PASS
- policy logged in diagnostics for each run

Browser authority kept separate:

- Playwright app-launch sample PASS
- Classified web-lane only, not desktop runtime authority.
