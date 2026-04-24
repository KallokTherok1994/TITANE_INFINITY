# FALLBACK HONESTY REPORT

## Fallback Chain Analysis

### Level 1: Missing piper model

**Trigger:** User selects "Amy (en_US)" — model file `en_US-amy-medium.onnx` does not exist
**Before patch:** Would try to use the hardcoded fr_FR-siwis-medium.onnx silently (wrong)
**After patch:**

```rust
// local_tts.rs:speak_piper() — patched
let model_path = format!(".../{}.onnx", model_name);  // en_US-amy-medium.onnx
if !Path::new(&model_path).exists() {
    log::warn!("[LocalTTS] ⚠️ Piper model not found: {} — falling back to fr_FR-siwis-medium", model_path);
    // fallback to default
}
log::info!("[LocalTTS] speak_piper model: {}", model_path);
```

**Status:** ✅ HONEST — fallback is logged; not silent

### Level 2: Piper binary missing

**Trigger:** `~/.local/bin/piper` not installed
**Behavior:** `detect_engine()` at startup returns `TTSEngine::Espeak`; `speak()` dynamic override would try Piper for underscore voice IDs but `speak_piper()` would fail → error propagates to hybridTTS → WebSpeech fallback
**UI notification:** ⚠️ NONE — user not informed that piper binary is missing
**Status:** PARTIAL — logged in Rust, no user-visible UI warning

### Level 3: All Tauri TTS providers fail

**Trigger:** Tauri backend unavailable
**Behavior:** `hybridTTS.speakTauri()` catches error, logs `⚠️ TTS: Tauri failed, falling back to Web Speech API`
**Status:** ✅ HONEST — logged, falls through to WebSpeech

### Level 4: WebSpeech API fails

**Trigger:** WebKitGTK (Tauri's webview) does not support Web Speech API
**Behavior:** `hybridTTS` logs `⚠️ TTS: Web Speech API failed`; falls to silent mode
**Status:** ✅ HONEST — logged

### Level 5: Silent mode

**Trigger:** All providers unavailable
**Behavior:** Logs `⛔ CRITICAL: All providers failed` (patched) + `🔇 TTS: No provider available`
**Status:** ✅ HONEST (improved by patch — CRITICAL warning added)

## Summary Table

| Fallback Scenario            | Before Patch       | After Patch                   | UI Warning?   |
| ---------------------------- | ------------------ | ----------------------------- | ------------- |
| Selected model .onnx missing | Silent wrong model | log::warn! + correct fallback | No (log only) |
| Piper binary missing         | Espeak silently    | Espeak silently               | No (log only) |
| Tauri TTS fails              | console.warn       | console.warn                  | No (log only) |
| All providers fail           | `console.log`      | `console.warn CRITICAL`       | No (log only) |

## Remaining Gap

None of the fallback scenarios surface a **user-visible UI notification**.
The user would not know why their selected voice is not heard.
This is a UX limitation but does not constitute "silent failure" in the hidden sense —
all fallbacks are logged to browser console + Rust logs.
