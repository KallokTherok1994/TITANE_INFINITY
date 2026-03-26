# 03_E2E_RUNNER_DISCOVERY.md — STABLE_LANE_2026-03-15_1456

## Authority Runner

**WebdriverIO + tauri-driver + WebKitWebDriver**

| Component | Path | Status |
|-----------|------|--------|
| wdio config | `wdio.desktop.conf.cjs` | EXISTS ✓ |
| runner script | `scripts/e2e/run-desktop-suite.js` | EXISTS ✓ |
| tauri-driver | `/home/titane-os/.cargo/bin/tauri-driver` | INSTALLED ✓ |
| WebKitWebDriver | `/usr/bin/WebKitWebDriver` | INSTALLED ✓ |
| DISPLAY | `:1` | ACTIVE ✓ |
| Auth file | `runtime/ALLOW_E2E_TAURI_BUILD.ok` | EXISTS (I_AUTHORIZE_E2E_TAURI_BUILD) ✓ |
| Binary | `src-tauri/target/debug/titane-infinity` | EXISTS 178MB ✓ |

## Launch Command

```bash
export TAURI_BINARY_PATH=src-tauri/target/debug/titane-infinity
export WDIO_SPEC=e2e/desktop/diagnostic-tauri-api.wdio.test.js
node scripts/e2e/run-desktop-suite.js
```

## tauri-driver Args

```
tauri-driver --port 4444 --native-port 4445 --native-host 127.0.0.1 --native-driver /usr/bin/WebKitWebDriver
```

## Classification: AUTHORITY_CONFIRMED

Runner works with debug binary. Session confirmed (wry 0.54.2 linux).
