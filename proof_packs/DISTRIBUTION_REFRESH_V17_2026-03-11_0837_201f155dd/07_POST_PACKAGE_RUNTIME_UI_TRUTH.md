# 07 Post-Package Runtime UI Truth

## WDIO on distributed AppImage (canonical)

Command shape:

- `TAURI_BINARY_PATH=deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage pnpm exec wdio run wdio.desktop.conf.cjs --spec /tmp/v12_ui_visual_probe.wdio.test.js`

Results:

- run1: exit=0, `1 passing (5.9s)`
- run2: exit=0, `1 passing (6.5s)`
- run3: exit=0, `1 passing (5.8s)`

## WDIO on deb payload binary (distributed deb)

Command shape:

- `TAURI_BINARY_PATH=/tmp/v17_deb_extract/usr/bin/titane-infinity pnpm exec wdio run ...`

Result:

- run_deb2: exit=0, `1 passing (5.4s)`

## Assertions validated by test spec

- app launches on canonical surface
- `chat-input` available
- interaction send works
- response surface available

## Raw evidence

- `raw/07_appimage_wdio_x3_summary.log`
- `artifacts/run1/wdio.log`
- `artifacts/run2/wdio.log`
- `artifacts/run3/wdio.log`
- `artifacts/run_deb2/wdio.log`
