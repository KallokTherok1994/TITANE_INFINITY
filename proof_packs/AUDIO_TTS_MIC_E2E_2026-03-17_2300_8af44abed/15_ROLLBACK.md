# ROLLBACK
**Date:** 2026-03-17 23:00

## Rollback: voice binding fix (chat_engine/mod.rs)
```bash
git revert 6c9a21402 --no-edit
# or surgical:
git restore --source=8af44abed -- src-tauri/src/chat_engine/mod.rs
cargo build --release
```

## Rollback: hybridTTS fallback event
```bash
git restore --source=8af44abed -- src/services/tts/hybridTTS.ts
```

## Rollback: Stats nav cleanup (App.tsx + uiPages.po.js + engine-navigation.spec.ts)
```bash
git restore --source=8af44abed -- src/App.tsx e2e/desktop/page-objects/uiPages.po.js e2e/critical/engine-navigation.spec.ts
```

## Rollback: tts_generate_test_buffer (if Rust command causes issues)
```bash
git restore --source=df3147c64 -- src-tauri/src/audio/commands.rs src-tauri/src/main.rs src-tauri/tauri.conf.json
cargo build --release
```

## Rollback: Full session (revert to V10 state)
```bash
git reset --hard df3147c64
cargo build --release
```

## Binary Rollback (fast, no rebuild)
If the new binary causes runtime issues, AppImage fallback is available:
```
deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage
```
Set: `export TAURI_BINARY_PATH=deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage`
