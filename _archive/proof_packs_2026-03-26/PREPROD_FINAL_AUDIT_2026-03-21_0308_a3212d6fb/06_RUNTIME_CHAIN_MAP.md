# 06_RUNTIME_CHAIN_MAP

Critical chains audited:

1. Native TOTAL_DEV certification
- UI: App route + TopNav item
- E2E driver: e2e/desktop/total-dev.wdio.test.js
- Runner: scripts/e2e/run-desktop-suite.js
- WDIO config: wdio.desktop.conf.cjs
- Wrapper: scripts/e2e/tauri-wrapper.sh
- Backend: Tauri release binary
- Feedback: lock badge/panel/assertions in WDIO
- Status: PROVEN_RUNTIME

2. Native binary freshness gate
- Input truth: dist assets + tauri conf + cargo + package + workspace changes
- Policy: scripts/e2e/native-binary-policy.cjs
- Validator: scripts/verify/verify-native-binary-freshness.sh
- Block behavior: run-desktop-suite exit 32 when stale/build-required
- Status: PROVEN_RUNTIME

3. Browser critical lane sample
- Runner: Playwright webserver lane
- Spec: e2e/critical/app-launch.spec.ts
- Status: PROVEN_VISIBLE_ONLY (web lane only)

Bypass/silent fallback check:
- No silent stale artifact fallback detected in native chain after hardening.
- Desktop and browser lanes explicitly separated.
