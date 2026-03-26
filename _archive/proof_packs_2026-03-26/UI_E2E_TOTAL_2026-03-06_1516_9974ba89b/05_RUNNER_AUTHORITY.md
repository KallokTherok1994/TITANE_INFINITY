# RUNNER AUTHORITY

## Selected Authority

- `PASS`: WDIO desktop runner with tauri-driver and Tauri wrapper.
- Config evidence: `wdio.desktop.conf.cjs`
- Orchestration evidence: `scripts/e2e/run-desktop-suite.js`
- Wrapper evidence: `scripts/e2e/tauri-wrapper.sh`

## Why This Authority

- Desktop-native runtime (`browserName: wry`) is exercised.
- Real tauri-driver transport is exercised.
- Artifact outputs (wdio, tauri-driver, webkit, screenshots) are persisted per run directory.

## Rejected as Primary Authority for This Session

- Playwright browser/server path: present in repo but not used as desktop runtime proof authority in this session.

