# 07 — CAPABILITIES AND IPC TRUTH

## Tauri Capabilities (src-tauri/capabilities/)

- audio_tts.json: `get_audio_input_devices`, `test_microphone`, `voice_calibrate_microphone` → REGISTERED
- chat_ai.json: chat commands → REGISTERED
- No microphone/camera OS-level permission declared (Tauri v2 uses webview-level permission for getUserMedia)

## Tauri main.rs Command Registration

- `audio::commands::get_audio_input_devices` → line 1969 — REGISTERED
- `audio::commands::test_microphone` → line 1966 — REGISTERED
- `overdrive::voice_engine::voice_calibrate_microphone` → line 1678 — REGISTERED
- `stub_cmd!(camera_start)` → line 597 — STUB (no implementation)

## CSP

```
media-src 'self' asset: blob: mediastream:
```

Allows blob: and mediastream: — getUserMedia output can be used.
getDisplayMedia for screen capture: allowed if WebKitGTK portal is available.

## IPC Contract

All commands follow `{ ok, content, error }` contract (lib/ipcContract.ts verified).

## FRONTEND → TAURI PATH FOR MICROPHONE

1. ChatToolbar → handleDictationToggle
2. APISupport.hasMicrophone() → navigator.mediaDevices.enumerateDevices() [FIXED]
3. voiceEngine.startDictation() → useVoiceEngine hook
4. → invoke('voice_start_listening') or getUserMedia depending on path
5. → audio::commands or overdrive::voice_engine (registered)
6. → OS K66/ALC897 hardware

Chain: PARTIAL_CHAIN (frontend wired, Tauri commands registered, OS hardware present)
