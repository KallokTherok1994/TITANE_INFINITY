# 06 Runtime UI Visual Baseline

Canonical V12 proof artifacts were collected with:

- Desktop runtime: WRY via `wdio.desktop.conf.cjs`
- Probe: `/tmp/v12_ui_visual_probe.wdio.test.js`
- Stable proof runs retained as canonical: `run2`, `run3`, `run4`

Observed baseline on retained runs:

- URL: `tauri://localhost/titane`
- Theme: `dark`
- App root mounted (`rootChildCount=3`)
- Shell visible (`nav-top-main` present)
- Input/send/response visible
- `app-ready=ready`, `ipc-ready=ready`
- Onboarding absent

Canonical retained artifacts:

- `artifacts/run2/v12-ui-runtime-run2.json`
- `artifacts/run2/screens/run2-initial-shell.png`
- `artifacts/run2/screens/run2-after-input.png`
- `artifacts/run2/screens/run2-after-response.png`
- `artifacts/run3/v12-ui-runtime-run3.json`
- `artifacts/run3/screens/run3-initial-shell.png`
- `artifacts/run3/screens/run3-after-input.png`
- `artifacts/run3/screens/run3-after-response.png`
- `artifacts/run4/v12-ui-runtime-run4.json`
- `artifacts/run4/screens/run4-initial-shell.png`
- `artifacts/run4/screens/run4-after-input.png`
- `artifacts/run4/screens/run4-after-response.png`

Non-canonical but retained for traceability:

- `run1` failed with a page crash/hang during early reload.
- `run5`/`run6`/`run7` were exploratory confirmations around a non-kept overflow alignment attempt.
