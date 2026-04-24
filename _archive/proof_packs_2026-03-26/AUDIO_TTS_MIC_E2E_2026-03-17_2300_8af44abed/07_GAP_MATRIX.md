# GAP MATRIX

**HEAD:** 8af44abed | **Date:** 2026-03-17 23:00

## Classification Key

- PROVEN_RUNTIME: real IPC traversal confirmed, logs captured, x3 reruns pass
- PROVEN_VISIBLE_ONLY: UI shows state but no backend proof captured
- STATIC_ONLY: command/contract exists in files, no runtime execution proven
- UI_ONLY: frontend-only, no backend chain
- PARTIAL_CHAIN: some hops proven but not end-to-end
- STALE_TARGET_RISK: binary/artifact may not match HEAD
- STALE_ARTIFACT_RISK: artifact built before current commit
- BLOCKED_BY_ENV: env/tooling missing
- BLOCKED_BY_IPC: IPC call fails or command not registered
- BLOCKED_BY_OS_AUDIO: OS audio subsystem blocks command
- LEGACY_PATH: old code path, may not be used
- STUB_PATH: placeholder, returns mock
- UNKNOWN: not discoverable from static analysis

## Gap Classification Table

| Surface                               | Classification      | Proof Level    | Notes                                          |
| ------------------------------------- | ------------------- | -------------- | ---------------------------------------------- |
| TTS speak (piper path)                | PARTIAL_CHAIN       | L2 (prior V10) | V10 WDIO pass, not re-run at 8af44abed         |
| TTS speak (espeak fallback)           | PARTIAL_CHAIN       | L2 (prior V10) | Known fallback, tested in V10                  |
| TTS stop                              | PARTIAL_CHAIN       | L2 (prior V10) | SIGKILL to pid, V10 pass                       |
| TTS pause/resume                      | PARTIAL_CHAIN       | L2 (prior V10) | SIGSTOP/SIGCONT, V10 pass                      |
| TTS loading state                     | PROVEN_VISIBLE_ONLY | L3             | UI shows "Préparation..." — V10                |
| Output device enumeration             | UI_ONLY             | L1             | mediaDevices frontend-only                     |
| Output device selection               | UI_ONLY             | L1             | stored in localStorage                         |
| Output device persistence             | UNKNOWN             | L1             | reload-verify not tested                       |
| Input device enumeration              | UI_ONLY             | L1             | mediaDevices frontend-only                     |
| Speaker test (test_tts)               | PARTIAL_CHAIN       | L2 (prior V10) | V10 WDIO pass                                  |
| Microphone test                       | PARTIAL_CHAIN       | L2 (prior V10) | V10 WDIO pass                                  |
| Audio Center reachable                | PARTIAL_CHAIN       | L3 (prior V10) | tab-admin-audio, V10 WDIO                      |
| Audio Config save                     | UI_ONLY             | L1             | localStorage only, no backend sync             |
| Audio Config persistence              | UNKNOWN             | —              | reload-verify not tested                       |
| Voice preset selector                 | PARTIAL_CHAIN       | L2 (prior V10) | profile sync V10                               |
| Voice profile sync (frontend→backend) | PARTIAL_CHAIN       | L2 (prior V10) | syncVoiceIdentityProfile V10                   |
| Amy voice model                       | BLOCKED_BY_ENV      | L1             | model file missing, graceful fallback          |
| Siwis/upmc voice models               | PARTIAL_CHAIN       | L2 (prior V10) | files present, used in V10                     |
| Voice identity (perceptual)           | UNKNOWN             | —              | not assessable without human listening         |
| tts_generate_test_buffer (new)        | STALE_ARTIFACT_RISK | L1             | command in Rust at HEAD, NOT in current binary |
| VAD state/process                     | STATIC_ONLY         | L1             | implemented, not tested in E2E                 |
| Recording start/stop/cancel           | STATIC_ONLY         | L1             | commands registered, no E2E                    |
| Transcription (whisper)               | STATIC_ONLY         | L1             | command registered, no E2E coverage            |
| ElevenLabs TTS                        | LEGACY_PATH         | L1             | coerced to piper on desktop                    |
| Web Speech fallback                   | PARTIAL_CHAIN       | L2             | browser-only fallback                          |
| IPC contract { ok, content, error }   | STATIC_ONLY         | L1             | handler wrapper in place                       |
| Desktop E2E at HEAD 8af44abed         | STALE_ARTIFACT_RISK | —              | re-run NOT EXECUTED                            |

## Single Real Lock

**STALE_ARTIFACT_RISK**: The Tauri binary was built BEFORE commit 8af44abed.

- Missing: `tts_generate_test_buffer` (new command added in 8af44abed)
- Impact: All WDIO desktop tests for existing audio flows CAN run
- Impact: Playwright `audio-truth.spec.ts` with TITANE_E2E_FULL=1 CANNOT run (command not in binary)
- Fix: `cargo build --release` (incremental, ~2-5 min)
- After fix: run desktop E2E x3 to upgrade PARTIAL_CHAIN items to PROVEN_RUNTIME

## Secondary Gaps (not blockers for desktop E2E re-run)

1. Audio config persistence (reload test) — not covered
2. VAD E2E — not covered
3. Recording E2E — not covered
4. Voice identity perceptual proof — requires human + two piper models
