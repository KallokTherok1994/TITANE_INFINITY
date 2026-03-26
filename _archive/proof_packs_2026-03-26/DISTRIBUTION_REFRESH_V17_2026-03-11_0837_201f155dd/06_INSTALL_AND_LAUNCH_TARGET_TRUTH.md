# 06 Install and Launch Target Truth

## deb install attempt

- Command: `sudo -n dpkg -i deployment/latest/TITANE-Infinity_27.2.0_amd64.deb`
- Result: BLOCKED (sudo password required)
- Evidence: `raw/06_install_deb.log`

## Launch target proof from distributed artifacts

### AppImage real artifact

- Target: `deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage`
- WDIO runs used `TAURI_BINARY_PATH` set to this file
- Result: PASS (x3)

### deb real artifact payload

- Extracted via: `dpkg-deb -x deployment/latest/TITANE-Infinity_27.2.0_amd64.deb /tmp/v17_deb_extract`
- Binary tested: `/tmp/v17_deb_extract/usr/bin/titane-infinity`
- SHA matches `deployment/latest/titane-infinity`:
  - both `99a342d67de079e8b768428c04aeda5d1fc164ed1366cf68cd8baf5d7611381c`
- WDIO run on extracted deb binary: PASS

## Old installed system binary status

- `/usr/bin/titane-infinity` remains stale in this environment:
  - SHA256 `da985ffeec4e1c510a54a7b71f999f881950badde235363ed5bd0d8f616fb067`
- Not used for V17 post-package runtime proof.

## Raw evidence

- `raw/06_install_deb.log`
- `raw/06b_deb_extract_truth.log`
- `artifacts/run_deb2/wdio.log`
