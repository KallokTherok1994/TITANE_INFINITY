# 04 Runtime Baseline Canonical

Command family:
- TAURI_BINARY_PATH=/usr/bin/titane-infinity ./node_modules/.bin/wdio run wdio.desktop.conf.cjs --spec /tmp/v9_ui_visual_probe.wdio.test.js

Baseline events:
- Initial attempts hit session timeout (UND_ERR_HEADERS_TIMEOUT on POST /session)
- SAFE_AUTO_RECOVERY applied: reset tauri-driver + titane-infinity processes
- Healthcheck run with canonical spec passed:
  - artifacts/healthcheck/wdio.log
  - 1 passing (7.4s)

Baseline run1 post-recovery:
- PASS in wry
- Session ID: 75d130b4-a7cc-4add-8981-e44103ab9e11
- 1 passing (6.3s)
- [V9_NO_IPC_FALLBACK] true
- Summary JSON: artifacts/run1/v9-ui-runtime-run1.json

LAYER: Runtime desktop boot and session
EXPECTED: session creation and one complete runtime interaction
OBSERVED: successful after safe environment recovery
MATCH: YES
PROOF: artifacts/run1/wdio.log + artifacts/healthcheck/wdio.log
ROOT_CAUSE_IMPACT: transient env only, not product UI logic
FIX_ELIGIBILITY: SAFE_AUTO_RECOVERY
NEXT_LAYER: Visual and interaction audit
