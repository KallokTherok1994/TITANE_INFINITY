# DESKTOP AUTHORITY

## Target Runtime
- **Platform:** Linux (AppImage)
- **Webview:** WebKitGTK (Tauri 2.x)
- **Audio subsystem:** PipeWire → PulseAudio (paplay) → ALSA (aplay)
- **TTS primary:** piper binary at `~/.local/bin/piper`
- **TTS fallback:** espeak-ng at `/usr/bin/espeak-ng`

## Prior Certification
- **AUDIO_VOICE_PROFILE_SYNC_V10** (HEAD df3147c64): Desktop E2E PASS online+offline
  - `ttsStatusAfterRead: "Lecture en cours..."`
  - `pauseResumePath: "executed"`
  - `stopActionObserved: true`

## Current HEAD: 8af44abed
| Check | Status |
|-------|--------|
| Tauri binary built (from V10 cert) | ✅ PASS |
| Rust cargo check HEAD 8af44abed | ✅ PASS |
| TypeScript tsc --noEmit | ✅ PASS |
| Desktop E2E re-run at THIS HEAD | ❌ NOT EXECUTED |

## Authority Gap
The desktop binary was built and certified at HEAD df3147c64 (V10).
The current HEAD 8af44abed includes 3 commits after that:
1. `8af44abed` — Audio E2E Truth System (additive tests)
2. `8b78ce1e2` — docs (proof pack artifacts only)
3. `59123ab6a` — docs (governance wrappers only)

The voice patch was committed AT df3147c64 or earlier. No Rust source changes exist between df3147c64 and 8af44abed that affect TTS routing. The binary behavior is equivalent.

## Desktop Target Status
**PARTIAL** — Prior binary cert at V10 PASS; current HEAD not re-run through full desktop E2E. The TTS voice routing changes in hybridTTS.ts (TypeScript) and local_tts.rs (Rust) require a fresh desktop build + E2E run for FULL authority.
