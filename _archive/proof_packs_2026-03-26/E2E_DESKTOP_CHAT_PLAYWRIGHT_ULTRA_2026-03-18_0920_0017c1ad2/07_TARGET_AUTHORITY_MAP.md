# TARGET_AUTHORITY_MAP

| Desktop path | Launcher | Target artifact | Runtime marker | Freshness | Proven |
|---|---|---|---|---|---|
| WDIO desktop smoke | scripts/e2e/run-desktop-suite.js -> wdio.desktop.conf.cjs -> scripts/e2e/tauri-wrapper.sh | src-tauri/target/release/titane-infinity | tauri-wrapper.log: Using binary + TAURI_DEV_SERVER_URL=<unset> | Current workspace binary | YES |

## Notes
- Dev-server confusion guard: wrapper logs TAURI_DEV_SERVER_URL=<unset>.
- IPC reachability implied by successful tauri-driver + wdio session startup.
- Critical chat runtime action on desktop not proven in this pass.
