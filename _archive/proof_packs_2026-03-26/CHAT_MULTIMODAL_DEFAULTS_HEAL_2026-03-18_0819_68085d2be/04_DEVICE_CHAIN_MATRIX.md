# 04 — DEVICE CHAIN MATRIX

## 1. Microphone / Dictation

| Stage         | Component                                         | Status     | Notes                                       |
| ------------- | ------------------------------------------------- | ---------- | ------------------------------------------- |
| UI control    | ChatToolbar dictation button                      | WIRED      | Handler exists                              |
| Hook          | voiceEngine (useVoiceEngine)                      | WIRED      | startDictation()                            |
| Service       | voice/unifiedVocalEngine.ts                       | WIRED      | VAD + transcription                         |
| IPC check     | APISupport.hasMicrophone()                        | FIXED      | Was: labels-only false-neg. Now: kind-check |
| Tauri command | voice_start_listening, voice_calibrate_microphone | REGISTERED | audio_tts.json                              |
| OS device     | K66 USB Audio (card 1), ALC897 (card 0)           | PRESENT    | arecord -l confirmed                        |
| UI feedback   | Toast on error, honest blocked state              | HONEST     | existing toasts preserved                   |
| **Truth**     | **DEGRADED_HONEST → PARTIAL_CHAIN after fix**     |            |                                             |

## 2. Audio Conversation Mode

| Stage      | Component                       | Status  |
| ---------- | ------------------------------- | ------- |
| UI control | handleAudioConversationToggle   | WIRED   |
| Hook       | isAudioConversationActive state | WIRED   |
| Service    | usePreferences (persist)        | WIRED   |
| IPC        | APISupport.hasMicrophone()      | FIXED   |
| Backend    | TTS + voice chain               | PARTIAL |
| OS         | Mic hardware present            | PRESENT |
| **Truth**  | **PARTIAL_CHAIN**               |         |

## 3. Camera Live

| Stage         | Component                            | Status | Notes              |
| ------------- | ------------------------------------ | ------ | ------------------ |
| UI control    | handleCameraLiveToggle → VisionStore | WIRED  |                    |
| Tauri command | camera_start                         | STUB   | stub_cmd! line 597 |
| OS device     | /dev/video\*                         | ABSENT | No camera hardware |
| **Truth**     | **BLOCKED_BY_OS**                    |        | Honest error shown |

## 4. Screenshot Capture

| Stage      | Component                              | Status  | Notes                             |
| ---------- | -------------------------------------- | ------- | --------------------------------- |
| UI control | handleScreenCapture                    | WIRED   |                                   |
| API        | navigator.mediaDevices.getDisplayMedia | WEBVIEW | CSP: media-src blob: — partial    |
| OS         | Screen exists                          | PRESENT |                                   |
| **Truth**  | **PARTIAL_CHAIN**                      |         | WebKitGTK desktop may need portal |

## 5. Audio Playback (TTS)

| Stage        | Component                       | Status     |
| ------------ | ------------------------------- | ---------- |
| TTS commands | tts_speak, stop_speaking        | REGISTERED |
| Audio output | K66 + ALC897 playback           | PRESENT    |
| **Truth**    | **PROVEN_RUNTIME** (prior cert) |
