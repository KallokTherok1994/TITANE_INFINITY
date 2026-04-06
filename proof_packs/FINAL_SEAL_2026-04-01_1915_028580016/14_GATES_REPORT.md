# 14 GATES REPORT

## Criticality matrix

| Gate | Result | Notes |
| --- | --- | --- |
| Bootstrap truth | PASS | in isolated worktree only |
| Original workspace truth | FAIL | dirty + broken auxiliary remote |
| MAIN remote truth | PASS | `origin/MAIN = 028580016` |
| Tauri-only | PASS | verifier green |
| Instruction integrity | PASS | verifier green |
| Mermaid docs | PASS | verifier green |
| Registry integrity | PASS | verifier green |
| Architecture tests x3 | PASS | 3/3 |
| Safe build x3 | PASS | 3/3 |
| Safe build verify | PASS | warning on `LOCK.md` only |
| Rust native tests | FAIL | 4474 passed, 1 failed, 7 ignored |
| Desktop E2E authorization | FAIL | missing `runtime/ALLOW_E2E_TAURI_BUILD.ok` |
| Prod build | BLOCKED | no truthful BUILD_GO |
| Prod deploy | BLOCKED | no truthful DEPLOY_GO |

## Chain matrix

| Chain step | Result | Evidence |
| --- | --- | --- |
| Diagnose | PASS | bootstrap + drift discovery |
| Plan | PASS | isolated worktree chosen |
| Apply | PASS | 2 minimal Rust fixes |
| Verify | FAIL | one Rust test still failing |
| Report | PASS | proof pack completed with blocked verdict |

## Expected vs actual matrix

| Expectation | Expected | Actual | Status |
| --- | --- | --- | --- |
| Native tests | all green | 1 failing test remains | FAIL |
| Desktop E2E | executable x3 or honestly blocked | honestly blocked by repo gate | PASS |
| Version authority | single aligned release version | `28.88.0` / `28.44.0` / `28.0.0` / `28.5.0` drift | FAIL |
| Build-safe path | repeatable | PASS x3 | PASS |

## Build go matrix

| Requirement | Result |
| --- | --- |
| Clean authority tree | PASS |
| Architecture x3 | PASS |
| Safe build x3 | PASS |
| Native Rust tests | FAIL |
| Version authority alignment | FAIL |
| BUILD_GO | NO |

## Deploy go matrix

| Requirement | Result |
| --- | --- |
| BUILD_GO | FAIL |
| Desktop E2E authorization | FAIL |
| Runtime/deploy authority alignment | FAIL |
| DEPLOY_GO | NO |

## Drift matrix

| Surface | Value |
| --- | --- |
| App package version | `28.88.0` |
| App Tauri config | `28.88.0` |
| Stable runtime config | `28.0.0` |
| Deployment manifest | `28.44.0` |
| Version authority map | stale `28.5.0` era |

## Final lock matrix

| Lock | Status |
| --- | --- |
| Single execution authority | PASS |
| Stop-the-line on blocker | PASS |
| No prod token use | PASS |
| No prod mutation | PASS |
| Unique final verdict | PASS |
