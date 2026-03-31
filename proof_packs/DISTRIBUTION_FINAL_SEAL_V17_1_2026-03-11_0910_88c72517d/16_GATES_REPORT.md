# 16 Gates Report

| Gate | Status | Proof |
|---|---|---|
| G_DISTRIBUTION_STATE_TRUTH | PASS | `01_DISTRIBUTION_STATE_DISCOVERY.md` + `raw/01_state_discovery.log` |
| G_STAGE_MACHINE_CLASSIFIED | PASS | `02_DISTRIBUTION_STAGE_CLASSIFICATION.md` |
| G_BUNDLE_TRUTH | PASS | `04_TAURI_BUNDLE_TRUTH.md` |
| G_LATEST_TRUTH | PASS | `05_LATEST_REFRESH_TRUTH.md` |
| G_MANIFEST_CHECKSUM_TRUTH | PASS | `06_MANIFEST_AND_CHECKSUMS_TRUTH.md` |
| G_INSTALL_TARGET_TRUTH | PASS | `07_INSTALL_AND_LAUNCH_TARGET_TRUTH.md` |
| G_POST_PACKAGE_RUNTIME_TRUTH | PASS | `08_POST_PACKAGE_RUNTIME_UI_TRUTH.md` + `raw/12_wdio_ui_quality.log` |
| G_UI_QUALITY_Q1_Q4 | PASS | `09_FINAL_MEASURABLE_UI_QUALITY_AUDIT.md` + `raw/13_ui_quality_metrics.json` |
| G_EXPECTED_OBSERVED_MATCH | PASS | `10_EXPECTED_VS_OBSERVED_POST_PACKAGE.md` |
| G_STABILITY_RERUN | PASS | `14_STABILITY_AND_RERUNS.md` |
| G_AH_RECURRENCE_GUARD_PASS | PASS | `raw/16a_detect_recurrence.log` |
| G_VERIFY_INSTRUCTIONS | PASS | `raw/16b_verify_instructions.log` |

Governance scripts:

- `bash scripts/autoheal/detect_recurrence.sh` => PASS
- `bash scripts/verify_instructions.sh` => PASS (`SUMMARY: PASS=20 FAIL=0`)
