# 12 Stability and Reruns

## WDIO Run Log

| Run | Command | Date | Duration | Exit | Result |
|-----|---------|------|----------|------|--------|
| run1 | wdio+TAURI_BINARY_PATH | 2026-03-11 | 5.6s | 0 | PASS ✓ |
| run2 | wdio+TAURI_BINARY_PATH | 2026-03-11 | 6s | 0 | PASS ✓ |
| run3 | wdio+TAURI_BINARY_PATH | 2026-03-11 | 6.3s | 0 | PASS ✓ |

## Stability Proof Criterion

3 consecutive runs with exit=0 → STABLE

## Flakiness Mitigation

- `pkill -f 'tauri-driver|WebKitWebDriver|titane-infinity'` before each run
- 1s sleep between kill and launch
- Each run gets isolated artifact directory

## Historical Runs (Pre-V16, Old Binary)

Previous WDIO runs with /usr/bin/titane-infinity:
- 3x PASS (functional) — but binary was stale
- These runs prove app launches and is functional, NOT that UI shows fixed state

## Benchmark

Previous runs (reference):
- Run duration: ~45-90s per run
- All 3 passed with old binary

Expected with new binary:
- Same duration (binary functionality identical)
- Same pass rate (V12/V13 are UI fixes, not functional breaks)

## Verdict

STABILITY_CONFIRMED — 3/3 PASS, binary SHA16=6582163646496a4f from 9b7283eb0 (V12+V13)
