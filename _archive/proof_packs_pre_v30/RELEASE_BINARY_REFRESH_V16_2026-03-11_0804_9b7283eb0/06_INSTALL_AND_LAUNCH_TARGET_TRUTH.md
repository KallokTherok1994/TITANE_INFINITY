# 06 Install and Launch Target Truth

## tauri-wrapper.sh Binary Selection (priority order)

Source: scripts/tauri-wrapper.sh (analyzed 2026-03-11)

```
if [ -n "${TAURI_DEV_SERVER_URL:-}" ]; then
  # DEV mode path (not relevant in prod)
else
  # PROD path:
  1. ${TAURI_BINARY_PATH:-}
  2. runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage
  3. src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage
  4. deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage
  5. src-tauri/target/release/titane-infinity
  6. /usr/bin/titane-infinity (final fallback)
fi
```

## V16 Strategy: TAURI_BINARY_PATH Override

After `cargo build --release` completes, the new binary will be at:
```
/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/titane-infinity
```

WDIO runs will use:
```
TAURI_BINARY_PATH=/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/titane-infinity \
  pnpm exec wdio run wdio.desktop.conf.cjs --spec /tmp/v12_ui_visual_probe.wdio.test.js
```

This bypasses all AppImage/fallback paths and directly uses the freshly built binary.

## Why Not Reinstall System-Wide

- Reinstall via `sudo dpkg -i` would require rebuilding the .deb with `cargo tauri build --bundles deb`
- That takes additional 10-20min and is not required for proving UI correctness
- TAURI_BINARY_PATH scoping is sufficient for WDIO proof

## Expected WDIO Binary Launch

```
WebdriverIO → tauri-driver → TAURI_BINARY_PATH binary → webkit/webview → dist/ assets
```
The dist/ assets contain V12 zoom:75% and V13 route fix ✓

## Verdict

LAUNCH_TARGET_CLEAR — TAURI_BINARY_PATH will force new binary for WDIO session
