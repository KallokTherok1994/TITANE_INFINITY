# 04_TEST_MATRIX
- Timestamp UTC: 2026-03-04T23:30:00Z

## Runner authority
- **Authority**: WDIO Desktop (`wdio.desktop.conf.cjs`)
- **Wrapper gouverné**: `scripts/e2e/tauri-wrapper.sh`
- **Command runner**: `node scripts/e2e/run-desktop-suite.js`

## TIER A — SMOKE_UI (required, x3)
Spec: `e2e/desktop/ui-ultra-smoke.e2e.js`

1. Launch app + verify `app-ready` and `ipc-ready`
2. Navigate top-level pages once (`titane/time/stats/admin/dev/fusion/optimization`)
3. Chat IA OFFLINE5: input + send + no-silence assertion
4. Admin: open audio tab + toggle at least one option

## TIER B — FULL_UI_COVERAGE (required, x3)
Spec: `e2e/desktop/ui-ultra-full.e2e.js`

1. Cover mapped pages (root visible)
2. Click all mapped tabs by page object
3. Fill visible inputs + clear
4. Toggle visible checkboxes on/off
5. Chat full scenarios:
	 - AR20 prompt
	 - navigation + state visibility
	 - stability (3 messages)
	 - error-path (provider preference switch + fallback/error visible)
6. Mode builder open/close when present

## Artifacts policy
- On failure: screenshot (`reports/e2e-desktop/failure-*.png`)
- Runtime traces/logs: `reports/e2e-desktop/*.log` (wdio + tauri-driver diagnostics)

## Commands for x3
```bash
# Smoke x3
bash scripts/qa/run_x3.sh "$PACK_DIR" 05_E2E_RUNS_X3.log smoke_ui \
	"TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-ultra/memory TITANE_LOG_DIR=/tmp/titane-ultra/logs WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js node scripts/e2e/run-desktop-suite.js"

# Full x3
bash scripts/qa/run_x3.sh "$PACK_DIR" 05_E2E_RUNS_X3.log full_ui \
	"TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-ultra/memory TITANE_LOG_DIR=/tmp/titane-ultra/logs WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js node scripts/e2e/run-desktop-suite.js"
```
