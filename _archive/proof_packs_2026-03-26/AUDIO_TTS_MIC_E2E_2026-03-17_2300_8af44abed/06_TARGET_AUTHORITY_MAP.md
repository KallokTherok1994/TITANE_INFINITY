# TARGET AUTHORITY MAP

**HEAD:** 8af44abed | **Date:** 2026-03-17 23:00

## Desktop Test Path: WDIO + Tauri binary

| Property                         | Value                                                                            | Status                    |
| -------------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| Launcher                         | `scripts/e2e/run-desktop-suite.js`                                               | PROVEN                    |
| Target artifact (primary)        | `src-tauri/target/release/titane-infinity`                                       | EXISTS (STALE)            |
| Target artifact (fallback)       | `deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage`            | EXISTS                    |
| AppImage bundle                  | `src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.0.0_amd64.AppImage` | EXISTS                    |
| Binary build timestamp           | 2026-03-17 17:45:41                                                              | BEFORE HEAD               |
| HEAD commit timestamp            | 2026-03-17 18:49:13                                                              | AFTER binary              |
| Artifact freshness               | **STALE** — built at commit ~V10 (df3147c64), missing `tts_generate_test_buffer` | FAIL                      |
| Runtime marker                   | Tauri WebView (WebKitGTK)                                                        | PROVEN                    |
| Driver dependency (WebDriver)    | `/usr/bin/WebKitWebDriver`                                                       | PRESENT ✅                |
| Driver dependency (tauri-driver) | `~/.cargo/bin/tauri-driver`                                                      | PRESENT ✅                |
| Node version requirement         | `>=20.0.0`                                                                       | nvm v20.20.0 available ✅ |
| Auth gate                        | `runtime/ALLOW_E2E_TAURI_BUILD.ok` = `I_AUTHORIZE_E2E_TAURI_BUILD`               | PRESENT ✅                |
| Backend IPC reachability         | Via Tauri WebView window, tested in V10                                          | PROVEN (prior cert)       |
| E2E x3 reruns at HEAD            | NOT EXECUTED                                                                     | BLOCKED (binary stale)    |

## Stale Artifact Analysis

**What's missing in the current binary (built pre-8af44abed):**

- `tts_generate_test_buffer` command — added in commit 8af44abed

**What's present in the current binary:**

- All existing audio commands: `tts_speak`, `tts_stop`, `pause_speaking`, `resume_speaking`
- `get_audio_output_devices`, `get_audio_input_devices`, `set_audio_output_device`, `set_audio_input_device`
- `test_microphone`, `test_tts`, `get_audio_device_config`, `save_audio_device_config`
- `start_recording`, `stop_recording`, `cancel_recording`, `is_recording`
- All VAD commands, all voice\_\* commands
- All commands certified in V10

**Impact:**

- WDIO desktop tests (audio-tts-runtime-controls.wdio.test.js): **CAN RUN** — don't use `tts_generate_test_buffer`
- Playwright audio-truth.spec.ts with TITANE_E2E_FULL=1: **BLOCKED** — needs `tts_generate_test_buffer`
- Playwright audio-truth.spec.ts without TITANE_E2E_FULL=1: **PASSES** (mock mode)

## Desktop Test Path: Playwright (audio-truth.spec.ts)

| Property            | Value                                     | Status                  |
| ------------------- | ----------------------------------------- | ----------------------- |
| Launcher            | `playwright test e2e/audio-truth.spec.ts` | PROVEN (mock mode)      |
| Runtime             | Chromium/browser (not Tauri binary)       | BROWSER ONLY            |
| TITANE_E2E_FULL=0   | Mock mode — skips real IPC                | ALWAYS PASSES           |
| TITANE_E2E_FULL=1   | Requires `__TAURI__` in browser           | REQUIRES Tauri WebView  |
| Desktop cert status | NOT A DESKTOP CERT — browser context only | BLOCKED for Tauri truth |

## Fix Required

To unblock `tts_generate_test_buffer` in desktop:

```bash
cd src-tauri && cargo build --release
```

Estimated time: 2-5 min (incremental — only audio/commands.rs changed)

## Rollback

If build fails:

```bash
git restore -- src-tauri/src/audio/commands.rs
cargo build --release
```
