# Stable Runtime Rebuild Filter - 2026-03-15

Date: 2026-03-15T23:28:41Z
Base commit: 05295f15e
Scope: runtime/stable/build.sh, runtime/stable/manifest.json, titane-infinity.desktop

Problem:
- The stable runtime lane was rebuilt to 28.0.0, but the copy phase in runtime/stable/build.sh globbed every .deb in src-tauri/target/release/bundle/deb.
- Because the bundle cache still contained Titan-Stable_27.2.0_amd64.deb, runtime/stable was repopulated with both 27.2.0 and 28.0.0 DEBs after a supposedly clean stable rebuild.

Root cause:
- runtime/stable/build.sh cleaned runtime/stable but did not constrain the source artifact selection to the active stable version.
- Historical bundle outputs remaining under src-tauri/target/release/bundle/deb were copied back into runtime/stable.

Applied fix:
- Parsed the active stable version from runtime/stable/tauri.conf.json.
- Filtered AppImage and DEB source globs to the active stable version first.
- Kept a broad fallback only when version-filtered matches are absent.
- Rebuilt the stable lane and revalidated the launcher on the rebuilt 28.0.0 artifact.

Executed proof:
- bash scripts/verify/validate-tauri-configs.sh
- TITANE_BUILD_ASSUME_YES=1 bash runtime/stable/build.sh
- TITANE_BUILD_ASSUME_YES=1 bash runtime/stable/build.sh after patch
- rg -n '^Name=TITANE∞ v28.0.0$|^Exec=.*/Titan-Stable_28.0.0_amd64.AppImage$' titane-infinity.desktop ~/.local/share/applications/titane-infinity.desktop
- task: shell: 🧪 Smoke-run AppImage (90s + log scan)
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh

Observed results:
- runtime/stable now contains only Titan-Stable_28.0.0_amd64.AppImage and Titan-Stable_28.0.0_amd64.deb.
- src-tauri/target/release/bundle/deb still contains historical 27.2.0 and current 28.0.0 outputs, but runtime/stable no longer reimports the stale 27.2.0 package.
- titane-infinity.desktop and the installed local desktop entry both point to Titan-Stable_28.0.0_amd64.AppImage and display TITANE∞ v28.0.0.
- Smoke run reached Main window shown successfully and UI_BOOT_MARKER label=main BOOT:READY.
- detect_recurrence passed.
- verify_instructions passed with FAIL=0.
