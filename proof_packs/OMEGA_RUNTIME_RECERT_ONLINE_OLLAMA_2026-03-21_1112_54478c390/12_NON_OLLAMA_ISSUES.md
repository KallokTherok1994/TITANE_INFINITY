# Non-Ollama Issues Identified

## Issue 1: services-ai TDZ ReferenceError (ui-connectivity-critical)
- **File**: tauri://localhost/assets/services-ai-C2K6-7v0.js (line 2, col 2817)
- **Error**: `ReferenceError: Cannot access uninitialized variable.`
- **Type**: JavaScript Temporal Dead Zone (TDZ) error in bundled AI services chunk
- **Impact**: Console errors logged by ui-connectivity-critical spec; DOES NOT prevent chat from working
- **Evidence of non-impact**: V25, V26, AR20, chat-ar20 TEST A/B/C all pass despite this error
- **Classification**: PRE_EXISTING, NOT_REGRESSION, NOT_OLLAMA_DEPENDENT
- **Action**: No immediate action required — does not block online chat path

## Issue 2: audio-tts-runtime-controls timing (audio-tts-runtime-controls.wdio.test.js)
- **Error**: `No audio test result text detected within timeout`
- **Type**: TTS/audio subsystem timing in E2E harness
- **Impact**: Audio-only feature, independent of online chat path
- **Classification**: PRE_EXISTING, NOT_OLLAMA_DEPENDENT, AUDIO_SUBSYSTEM
- **Action**: No action required for online chat recertification

## Issue 3: OFFLINE_SIM WebKit crash (ai-verification)
- **Error**: `session deleted because of page crash or hang` after `window.fetch = () => Promise.reject()`
- **Type**: Test harness limitation — injecting window.fetch rejection crashes WebKit in Tauri context
- **Impact**: Test cannot complete offline simulation phase; product does NOT crash offline (TEST B passes)
- **Classification**: TEST_HARNESS_LIMITATION, NOT_PRODUCT_DEFECT
- **Action**: Test needs refactoring to use env-based offline simulation instead of window.fetch injection
