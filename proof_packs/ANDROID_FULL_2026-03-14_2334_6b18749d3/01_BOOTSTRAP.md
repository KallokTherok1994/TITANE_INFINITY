# 01_BOOTSTRAP.md

## Git State
- SHA: 6b18749d3
- Branch: MAIN
- Status: 1 uncommitted change (tailwind gradient fix from previous session)

## Git log (last 20)
See commands: `git --no-pager log -20 --oneline`

## Tauri Version
- Tauri core: 2.0
- tauri-build: 2.0
- tauri-plugin-dialog: 2.6
- tauri-plugin-clipboard-manager: 2.0

## Android Init Status
- ABSENT: No `src-tauri/android/` directory
- ABSENT: No `src-tauri/ios/` directory
- PARTIAL: `src-tauri/gen/` exists but contains only `schemas/` (no Android project files)
- `tauri android init` HAS NOT been run

## Rust Dependencies (mobile-relevant)
- reqwest 0.11 (older — Android build requires special handling)
- rusqlite 0.37 bundled (SQLite — compatible with Android via bundled feature)
- cpal 0.15 optional (audio — desktop-only, marked optional)
- ort 2.0-rc optional (ONNX — desktop-only, optional)

## Package.json Scripts
- No `tauri:android` or `android:*` scripts present
- Build scripts are desktop-only: `build:production`, `build:tauri:e2e`

## Storage Paths Audit
- CORRECT: `app.path().app_data_dir()` used in main.rs, agenda/storage.rs, design_center/theme_manager.rs, identity/identity_matrix.rs
- STOPLINE #4: `src-tauri/src/commands/devops.rs:12` — hardcoded `/home/titane/Documents/TITANE_INFINITY`
- STOPLINE #4: `src-tauri/src/security/pre_boot_validation.rs` — `dirs::home_dir().map(|h| h.join("Documents/TITANE_INFINITY"))`
- CONCERN: `src-tauri/src/main.rs` — `dirs::home_dir().join(".titane").join("logs")` as log dir fallback

## UI Network Audit
- `src/core/http/httpClient.ts`: Claims TAURI-ONLY mode, has mock fallback for Vitest
- Direct fetch references present in various files (mostly via httpClient wrapper)
- Network governed through backend Rust reqwest

## IPC Commands
- ~30+ commands exposed via invoke()
- Contrat { ok, content, error } used (needs full verification)

## Ollama Integration
- Backend: `src-tauri/src/ollama.rs` — Rust-side Ollama client
- Frontend: `src/modules/talkToTitane/TalkToTitaneEngine.ts` — IPC call
- Endpoint: `http://127.0.0.1:11434` (desktop-local by default)
- Android concern: localhost Ollama NOT available on Android device

## Plugins Mobile Compatibility
- `tauri-plugin-dialog` v2.6: Android supported in Tauri v2
- `tauri-plugin-clipboard-manager` v2.0: Android supported in Tauri v2
- cpal: optional feature, no mobile cfg guard found — needs guard
