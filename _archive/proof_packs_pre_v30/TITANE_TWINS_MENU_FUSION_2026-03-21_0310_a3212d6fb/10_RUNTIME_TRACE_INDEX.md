# 10_RUNTIME_TRACE_INDEX

## Available Runtime Traces

| Source | Status | Notes |
|--------|--------|-------|
| vitest run twins tests | PASS 27/27 | Chat context chain proven |
| tsc --noEmit | EXIT 0 | TypeScript clean |
| verify_instructions.sh | PASS=20 FAIL=0 | All governance gates pass |
| detect_recurrence.sh | PASS entries=488 | No recurrence detected |

## Missing Runtime Traces (BLOCKED_BY_ENV)
- Live Tauri runtime trace: unavailable (no binary)
- WebdriverIO desktop suite: unavailable
- Playwright browser suite: unavailable (node version)
- Screenshots: unavailable

Classification: UNIT_PROVEN / DESKTOP_UNPROVEN
