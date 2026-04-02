# 04 Exact Diff Audit

Target 1: `runtime/stable/manifest.json`

- Diff class: metadata timestamp refresh only.
- Changed fields:
	- `last_validation`
	- `p3_3_forbidden_scan.last_run`
- No semantic downgrade detected.
- Certification remains `FORBIDDEN_SCAN_PASSED`.

Evidence:

- `raw/20_diff_runtime_stable_manifest.patch`
- `raw/26_manifest_semantic_check.txt`

Target 2: `titane-infinity.desktop`

- Diff class: launcher path/version/icon alignment update.
- Changed values:
	- app name `v27.0.5` -> `v27.2.0`
	- main `Exec` path -> `Titan-Stable_27.2.0_amd64.AppImage`
	- dev action `Exec` path -> `Titan-Stable_27.2.0_amd64.AppImage --dev`
	- icon -> absolute existing icon path.

Evidence:

- `raw/21_diff_titane_infinity_desktop.patch`
- `raw/25_path_coherence.env`
- `raw/27_desktop_vs_template.txt`

