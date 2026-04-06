# Phase E: P10.3 Desktop E2E x3 — Execution Plan

## Runs Configuration
- **Run 1**: Initial E2E suite execution
- **Run 2**: Determinism verification run
- **Run 3**: Determinism verification run (final)

## Expected Artifacts per Run
- `e2e_run_1_output.txt` — Full output log
- `e2e_run_1_timing.txt` — Execution timing
- `e2e_run_1_results.json` — Test results (WebdriverIO format)

## Validation Gates
- ✅ Guard pre-check pass (already verified in Phase B)
- ✅ E2E authorization check pass
- ✅ WebDriver setup pass
- 🔄 Test execution success (Run 1, 2, 3)
- 🔄 Determinism verification (Run 2 vs Run 3)
- 🔄 No silent failures or crashes
- 🔄 All tests pass

## Sandbox Isolation
- HOME: Temporary isolated directory per run
- XDG_*: Isolated runtime directories
- No persistent state between runs
- Clean profile per execution

## Timeline (Estimated)
- Run 1: ~180–300 seconds (full build + tests)
- Run 2: ~120–180 seconds (determinism check)
- Run 3: ~120–180 seconds (determinism check)
- Total: ~30–45 minutes including setup

---

**Ready to execute: pnpm run e2e:desktop (x3)**
