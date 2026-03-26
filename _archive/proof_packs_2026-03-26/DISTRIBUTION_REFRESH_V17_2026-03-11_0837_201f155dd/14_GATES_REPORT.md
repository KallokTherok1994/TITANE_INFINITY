# 14 Gates Report

| Gate | Status | Proof |
|------|--------|-------|
| G_DISTRIBUTION_STATE_TRUTH | PASS | `01_DISTRIBUTION_STATE_DISCOVERY.md` + `raw/01_state_discovery.log` |
| G_BUNDLE_TRUTH | PASS | `03_TAURI_BUNDLE_TRUTH.md` + `raw/03b_tauri_bundle_appimage.log` + `raw/03c_tauri_bundle_deb.log` |
| G_LATEST_REFRESH_TRUTH | PASS | `04_LATEST_REFRESH_TRUTH.md` + `raw/04_latest_refresh_and_manifest.log` |
| G_MANIFEST_CHECKSUM_TRUTH | PASS | `05_MANIFEST_AND_CHECKSUMS_TRUTH.md` + `sha256sum -c` PASS |
| G_INSTALL_TARGET_TRUTH | PASS | `06_INSTALL_AND_LAUNCH_TARGET_TRUTH.md` (AppImage + deb payload proof) |
| G_POST_PACKAGE_RUNTIME_TRUTH | PASS | `07_POST_PACKAGE_RUNTIME_UI_TRUTH.md` (run1/run2/run3/run_deb2) |
| G_EXPECTED_VS_OBSERVED_TRUTH | PASS | `08_EXPECTED_VS_OBSERVED_POST_PACKAGE.md` |
| G_AUTO_FIX_SAFETY | PASS | bounded distribution-only fix set, rollback defined |
| G_STABILITY_CONFIRMATION | PASS | `12_STABILITY_AND_RERUNS.md` |
| G_NO_FALSE_SEAL | PASS | verdict tied to concrete post-package proofs |
| G_AH_RECURRENCE_GUARD_PASS | PASS | `raw/14a_detect_recurrence.log` |
| G_VERIFY_INSTRUCTIONS | PASS | `raw/14b_verify_instructions.log` (`PASS=20 FAIL=0`) |

## Governance script results

- `bash scripts/autoheal/detect_recurrence.sh`: PASS (`entries=155`)
- `bash scripts/verify_instructions.sh`: PASS (`PASS=20 FAIL=0`)
