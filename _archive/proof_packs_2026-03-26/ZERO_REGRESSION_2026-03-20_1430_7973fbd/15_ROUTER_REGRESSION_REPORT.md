# 15 — ROUTER REGRESSION REPORT
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

## Status: PARTIAL — Based on LOCK1 fix history

## Known State

| Property | Fix Applied | Status |
|----------|-------------|--------|
| meta.provider_used in IPC response | LOCK1 | PARTIAL_CHAIN |
| UI badge = meta.provider_used | LOCK1 | PARTIAL_CHAIN |
| Fallback labeling honesty | — | WIRED_BUT_UNPROVEN |
| One Door network enforcement | gate g_network_one_door.sh | PROVEN_STATIC |
| Routing determinism | — | WIRED_BUT_UNPROVEN |

## No router regressions introduced this session (no src-tauri/ code touched).

## Actions Required
Run Lane B item B-005, B-006.
Fill ROUTER_TRUTH_SCORECARD.json.
