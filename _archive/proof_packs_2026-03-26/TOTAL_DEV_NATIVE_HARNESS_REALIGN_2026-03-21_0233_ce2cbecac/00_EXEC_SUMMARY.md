TOTAL_DEV Native Harness Realign

Status: DONE

Objective:
- Re-evaluate the previous native blocker against official Tauri/WebDriver/WebdriverIO guidance.
- Isolate one primary lock.
- Certify the native TOTAL_DEV path with real desktop runs.

Primary lock isolated:
- The native WDIO chain was launching a stale local release binary.
- Source and built frontend assets already contained TOTAL_DEV, but the embedded release executable used by the harness was older and rendered an outdated top navigation without nav-total-dev.

Resolution:
- Updated wdio.desktop.conf.cjs to select the freshest local Tauri binary.
- Rebuilt the release executable with current assets.
- Re-ran the canonical TOTAL_DEV native suite successfully three times.

Key evidence:
- reports/e2e-desktop/total-dev-realign/run-1
- reports/e2e-desktop/total-dev-realign/run-2
- reports/e2e-desktop/total-dev-realign/run-3
- reports/e2e-desktop/total-dev-realign/run-4
- reports/e2e-desktop/total-dev-realign/run-5
