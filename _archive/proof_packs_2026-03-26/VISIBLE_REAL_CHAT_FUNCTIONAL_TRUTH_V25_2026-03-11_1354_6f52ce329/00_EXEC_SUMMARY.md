# V25 Executive Summary

Mode: `VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH`

Authority:
- `/tmp/titane_v15_wt_20260311_080118`

Run retained:
- `run_chat_baseline`
- Log: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/raw/01_v25_run_chat_baseline.log`
- Metrics: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json`

Observed reality:
- UI visible and stable.
- Input/send usable and real send triggered.
- Processing signal visible via reasoning panel.
- Assistant response rendered.
- Response content is still degraded and simulated: `Mode OFFLINE_SIM actif. Reponse hors ligne deterministe.`

Unique verdict:
- `FAIL`

Reason:
- Chat cycle is functionally executable, but the runtime-visible answer remains offline simulated/degraded, so fullstack real-chat truth is not certified.

## Postbuild delta (artifact truth)

- Rebuild executed: `raw/02_tauri_build_appimage_v25.log` (`RC=0`).
- Postbuild run executed: `raw/03_v25_run_chat_postbuild.log` (`RC=0`).
- Runtime metadata exposure improved on rebuilt artifact:
	- `runtimeAttrs.providerMode=OFFLINE`
	- `runtimeAttrs.providerReason=FALLBACK_OFFLINE`
	- `runtimeAttrs.providerUsed=offline`
	- `runtimeAttrs.providerNetworkUsed=false`
- Reasoning topology increased from `1` to `5` nodes.
- Global verdict remains `FAIL` because degraded simulated offline response persists.
