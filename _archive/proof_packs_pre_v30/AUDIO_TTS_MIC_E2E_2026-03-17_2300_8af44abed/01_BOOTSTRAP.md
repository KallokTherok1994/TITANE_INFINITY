# BOOTSTRAP
**HEAD at session start:** 8af44abed → **HEAD at session end:** 17838b9b1  
**New commits this session:**
- `6c9a21402` — fix(audio+nav): voice binding auto-TTS, TTS fallback events, Stats→DEV fusion nav cleanup
- Binary rebuilt → `src-tauri/target/release/titane-infinity` at 2026-03-17 19:23:11

## Environment
| Tool | Version | Status |
|------|---------|--------|
| node (system) | v18.19.1 | INCOMPATIBLE (needs >=20) |
| node (nvm v20) | v20.20.0 | ✅ USED |
| pnpm | 10.30.2 | ✅ |
| cargo | 1.94.0 | ✅ |
| rustc | 1.94.0 | ✅ |
| tauri-driver | ~/.cargo/bin/tauri-driver | ✅ |
| WebKitWebDriver | /usr/bin/WebKitWebDriver | ✅ |
| WebDriver auth | runtime/ALLOW_E2E_TAURI_BUILD.ok = I_AUTHORIZE_E2E_TAURI_BUILD | ✅ |
| piper | ~/.local/bin/piper | ✅ |
| piper model (fr_FR-siwis) | ~/.local/share/piper/... | ✅ |
| piper model (fr_FR-upmc) | ~/.local/share/piper/... | ✅ |
| espeak-ng | /usr/bin/espeak-ng | ✅ (fallback) |

## Git Status
- 2 modified files found: e2e/desktop/page-objects/uiPages.po.js, src/App.tsx
- 4 more unstaged changes from prior session discovered: hybridTTS.ts, chat_engine/mod.rs, engine-navigation.spec.ts, autoheal_rules.jsonl
- All committed in 6c9a21402

## Cargo Check (pre-build)
```
cargo check -p titane-infinity
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.49s
```

## cargo build --release
```
Compiling titane-infinity v28.0.0
Finished `release` profile [optimized] target(s) in 12m 36s
```
Binary: src-tauri/target/release/titane-infinity | Size: 41886704 bytes | Timestamp: 2026-03-17 19:23:11
