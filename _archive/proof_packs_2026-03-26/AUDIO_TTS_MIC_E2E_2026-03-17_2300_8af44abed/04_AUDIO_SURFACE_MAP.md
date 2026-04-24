# AUDIO SURFACE MAP

**HEAD:** 8af44abed | **Date:** 2026-03-17 23:00

## Surface Inventory

| Surface                         | Path/Route                            | Type          | Criticality | Visible                | Reachable         | Tested                 | Desktop Tested                    | Runtime Proven       | Source of Truth                    | Stale-Target Risk | Stale-Artifact Risk           |
| ------------------------------- | ------------------------------------- | ------------- | ----------- | ---------------------- | ----------------- | ---------------------- | --------------------------------- | -------------------- | ---------------------------------- | ----------------- | ----------------------------- |
| Chat Read-Aloud button          | `/titane` (ConversationSection)       | UI action     | HIGH        | Yes                    | Yes               | Browser E2E (partial)  | WDIO (audio-tts-runtime-controls) | PARTIAL - V10 PASS   | audioService.speak() → tts_speak   | LOW               | MEDIUM (binary stale at HEAD) |
| TTS pause/resume controls       | `/titane` (ConversationSection)       | UI control    | HIGH        | Yes (during speaking)  | Yes               | WDIO audio-tts         | WDIO V10 PASS                     | PARTIAL - V10 PASS   | tts_pause / tts_resume Tauri cmd   | LOW               | MEDIUM                        |
| TTS stop button                 | `/titane` (ConversationSection)       | UI control    | HIGH        | Yes (during speaking)  | Yes               | WDIO audio-tts         | WDIO V10 PASS                     | PARTIAL - V10 PASS   | tts_stop Tauri cmd                 | LOW               | MEDIUM                        |
| TTS loading state               | `/titane` (ConversationSection)       | UI state      | MEDIUM      | Yes ("Préparation...") | Yes               | WDIO V10               | WDIO V10                          | PARTIAL - UI visible | Frontend state machine             | LOW               | LOW                           |
| Audio Center                    | `/admin` tab `tab-admin-audio`        | Feature page  | HIGH        | Yes                    | Yes               | WDIO V10               | WDIO V10 PASS                     | PARTIAL              | AudioCenterPage.tsx                | LOW               | MEDIUM                        |
| Speaker/Output Test             | Admin > Audio tab                     | UI action     | HIGH        | Yes                    | Yes               | WDIO V10               | WDIO V10 PASS                     | PARTIAL - shell cmd  | audio/commands.rs → paplay/pw-play | LOW               | MEDIUM                        |
| Microphone Test                 | Admin > Audio tab                     | UI action     | HIGH        | Yes                    | Yes               | WDIO V10               | WDIO V10 PASS                     | PARTIAL - shell cmd  | audio/commands.rs                  | LOW               | MEDIUM                        |
| Output Device Selector          | Admin > Audio tab / ConfigurationHub  | UI control    | MEDIUM      | Yes                    | Yes               | Browser E2E            | No                                | UI_ONLY              | mediaDevices.enumerateDevices      | LOW               | LOW                           |
| Input Device Selector           | Admin > Audio tab / ConfigurationHub  | UI control    | MEDIUM      | Yes                    | Yes               | Browser E2E            | No                                | UI_ONLY              | mediaDevices.enumerateDevices      | LOW               | LOW                           |
| Audio Config Save               | ConfigurationHub `/admin`             | UI action     | HIGH        | Yes                    | Yes               | Partial                | No                                | PARTIAL              | localStorage (STORAGE_KEY)         | LOW               | LOW                           |
| Audio Config Reload Persistence | ConfigurationHub `/admin`             | gate          | HIGH        | Yes                    | Yes               | Not tested             | No                                | UNKNOWN              | audioService.loadConfig()          | LOW               | LOW                           |
| Voice Preset Selector           | Audio Center                          | UI control    | HIGH        | Yes                    | Yes               | WDIO V10               | WDIO V10                          | PARTIAL              | titaneVoiceProfiles.ts             | LOW               | MEDIUM                        |
| Voice Profile Sync              | audioService.syncVoiceIdentityProfile | Internal      | HIGH        | No (internal)          | Yes (via service) | Unit only              | No                                | PARTIAL              | audioService + piper voice map     | LOW               | MEDIUM                        |
| TTS Test Buffer (E2E)           | `tts_generate_test_buffer` Tauri cmd  | Internal E2E  | MEDIUM      | No                     | Yes (Tauri)       | Playwright (mock mode) | NOT YET (binary stale)            | STATIC_ONLY at HEAD  | audio/commands.rs                  | LOW               | HIGH (binary stale)           |
| VAD State                       | `vad_get_state`                       | Backend state | MEDIUM      | No                     | Yes (Tauri)       | No                     | No                                | UNKNOWN              | audio/commands.rs vad.rs           | LOW               | MEDIUM                        |
| Boot-time audio init            | `audioService.init()`                 | Init          | HIGH        | No (internal)          | Yes               | Unit                   | No                                | PARTIAL              | audioService constructor           | LOW               | LOW                           |
| TTS Engine Detection            | `command_exists` in Rust              | Internal      | HIGH        | No                     | Yes (Rust)        | Static                 | No                                | STATIC_ONLY          | audio/commands.rs                  | LOW               | MEDIUM                        |
| Recording (start/stop/cancel)   | `start_recording`, `stop_recording`   | UI action     | MEDIUM      | Yes (button)           | Yes               | No desktop             | No                                | UNKNOWN              | audio/recorder.rs                  | LOW               | MEDIUM                        |
| Error/Degraded toast            | ConversationSection                   | UI state      | HIGH        | Yes                    | Yes               | Partial                | WDIO V10                          | PARTIAL              | Frontend error handler             | LOW               | LOW                           |

## Canonical Device Truth

**Answer:** HYBRID

- Frontend: `navigator.mediaDevices.enumerateDevices` for device list UI
- Rust backend: `wpctl status` (pipewire) or `pactl list` for device IDs used in TTS output
- Persistence: `localStorage` key `titane_audio_config` (frontend-only)
- No backend sync for device selection — frontend owns device list, passes ID to `tts_speak` payload

## Canonical TTS Truth

**Answer:** PARTIAL_CHAIN

- Primary: Rust `audio/commands.rs` `tts_speak` → piper binary (~/.local/bin/piper)
- Fallback 1: espeak-ng (/usr/bin/espeak-ng)
- Fallback 2: Web Speech API (frontend, browser only)
- Online (elevenlabs): BLOCKED on desktop (normalizeRuntimeCompatibleTTS coerces to piper)
- Mock mode: deterministic sine wave via `tts_generate_test_buffer`

## Canonical Mic Truth

**Answer:** HYBRID

- Browser: `navigator.mediaDevices.getUserMedia` for mic access UI
- Rust: `audio/capture.rs` / `audio/recorder.rs` for actual capture stream
- Test path: `test_microphone` Tauri command → shell-level test

## Voice Preset/Profile Sync Drift

**Answer:** PARTIAL_CHAIN — potential drift identified

- Frontend stores `voiceProfileId` in audioService.config
- `syncVoiceIdentityProfile()` maps profile → piper model
- Piper models present: `fr_FR-siwis-medium.onnx`, `fr_FR-upmc-medium.onnx`
- Amy model (`en_US-amy-medium.onnx`): MISSING → graceful fallback with log::warn
- Frontend UI may show "TITANE Official" but actual voice is siwis or upmc depending on model availability
- **DRIFT CLASSIFICATION: VOICE_IDENTITY_NOT_PROVEN** (perceptual diff unassessed)
