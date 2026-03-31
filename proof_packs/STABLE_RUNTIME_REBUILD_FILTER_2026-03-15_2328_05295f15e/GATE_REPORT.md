# GATE_REPORT

Session: STABLE_RUNTIME_REBUILD_FILTER_2026-03-15_2328_05295f15e
Date: 2026-03-15T23:28:41Z

Checks:
- PASS: bash scripts/verify/validate-tauri-configs.sh
- PASS: bash -n runtime/stable/build.sh
- PASS: TITANE_BUILD_ASSUME_YES=1 bash runtime/stable/build.sh
- PASS: rg -n '^Name=TITANE∞ v28.0.0$|^Exec=.*/Titan-Stable_28.0.0_amd64.AppImage$' titane-infinity.desktop ~/.local/share/applications/titane-infinity.desktop
- PASS: shell task smoke-run AppImage (90s + log scan)
- PASS: bash scripts/autoheal/detect_recurrence.sh
- PASS: bash scripts/verify_instructions.sh

Key outputs:
- runtime/stable/build.sh logged: Selecting stable artifacts for version: 28.0.0
- Bundled: Titan-Stable_28.0.0_amd64.AppImage
- Bundled: Titan-Stable_28.0.0_amd64.deb
- runtime/stable final contents: Titan-Stable_28.0.0_amd64.AppImage, Titan-Stable_28.0.0_amd64.deb
- Smoke markers: Main window shown successfully, BOOT:ENTRY_MAIN_IMPORTED, BOOT:READY
- Smoke log: runtime/stable/logs/appimage-run-20260315-192600-90s.log
- verify_instructions: PASS=20 FAIL=0
