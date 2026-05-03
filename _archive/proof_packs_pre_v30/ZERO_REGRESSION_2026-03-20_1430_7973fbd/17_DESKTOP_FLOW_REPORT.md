# 17 — DESKTOP FLOW REPORT
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

## Status: BLOCKED_BY_ENV

Cannot execute desktop E2E tests due to Node v18.19.1 incompatibility.
Required: Node >=20.0.0 for WebdriverIO (wdio.desktop.conf.cjs).

## Known Desktop State (from LOCK session history)

| Flow | Fix | Status |
|------|-----|--------|
| App launch (AppImage/DEB) | v28.0.0 deployed | PARTIAL_CHAIN |
| Backend selftest | existing | WIRED_BUT_UNPROVEN |
| Health bootstrap from backend | LOCK3 | PARTIAL_CHAIN |
| Chat message round trip | LOCK1 | PARTIAL_CHAIN |
| IPC contract { ok, content, error } | always | PROVEN_STATIC |
| Ollama connectivity | existing | WIRED_BUT_UNPROVEN |

## No desktop regressions introduced this session (no src/ or src-tauri/ touched).

## Actions Required
```bash
nvm install 20 && nvm use 20
pnpm run test:e2e  # or wdio desktop conf
# Fill DESKTOP_CRITICAL_FLOW_SCORECARD.json
```
