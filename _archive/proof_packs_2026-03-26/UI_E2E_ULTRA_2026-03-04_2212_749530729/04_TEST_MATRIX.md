# Test Matrix

- Timestamp: 2026-03-04T22:16:59-05:00
- Pack: `proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729`
- Authority: WDIO desktop (`wdio.desktop.conf.cjs`) via wrapper `scripts/e2e/tauri-wrapper.sh`

## Preflight

| Step | Command | Expected |
|---|---|---|
| WebKit driver ensure | `pnpm run e2e:desktop:ensure` | WebKitWebDriver available |
| Harness config | `wdio.desktop.conf.cjs` + `scripts/e2e/run-desktop-suite.js` | tauri-driver + wrapper chain active |

## Run Grid (X3)

### Smoke (x3)

| Run | Spec | Command |
|---|---|---|
| smoke-1 | `e2e/desktop/ui-ultra-smoke.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/smoke/run1" WDIO_SPEC="./e2e/desktop/ui-ultra-smoke.e2e.js" pnpm run e2e:desktop:run` |
| smoke-2 | `e2e/desktop/ui-ultra-smoke.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/smoke/run2" WDIO_SPEC="./e2e/desktop/ui-ultra-smoke.e2e.js" pnpm run e2e:desktop:run` |
| smoke-3 | `e2e/desktop/ui-ultra-smoke.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/smoke/run3" WDIO_SPEC="./e2e/desktop/ui-ultra-smoke.e2e.js" pnpm run e2e:desktop:run` |

### Full (x3)

| Run | Spec | Command |
|---|---|---|
| full-1 | `e2e/desktop/ui-ultra-full.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/full/run1" WDIO_SPEC="./e2e/desktop/ui-ultra-full.e2e.js" pnpm run e2e:desktop:run` |
| full-2 | `e2e/desktop/ui-ultra-full.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/full/run2" WDIO_SPEC="./e2e/desktop/ui-ultra-full.e2e.js" pnpm run e2e:desktop:run` |
| full-3 | `e2e/desktop/ui-ultra-full.e2e.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/full/run3" WDIO_SPEC="./e2e/desktop/ui-ultra-full.e2e.js" pnpm run e2e:desktop:run` |

### AR20 Runtime Validation (complement)

| Run | Spec | Command |
|---|---|---|
| ar20-1 | `e2e/desktop/chat-ar20.wdio.test.js` | `TITANE_E2E_ARTIFACTS_DIR="proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/runs/ar20/run1" WDIO_SPEC="./e2e/desktop/chat-ar20.wdio.test.js" pnpm run e2e:desktop:run` |

## Mandatory Artifacts After Runs

- Per-run logs: `diagnostics.log`, `wdio.log`, `tauri_driver.log`, `tauri-wrapper.log`
- For failing tests: screenshots in run artifacts folder
- Aggregated execution summary in `05_E2E_RUNS_X3.log`
- Artifact registry in `06_ARTIFACTS_INDEX.md`

## Gate Target

- `PASS`: smoke x3 and full x3 all green, wrapper markers visible, no-silence checks validated.
- `BLOCKED_E2E_RUNTIME`: environment prerequisites missing (driver/runtime), with exact failing command and next-action.
- `FAIL`: deterministic test failure with reproducible evidence.
