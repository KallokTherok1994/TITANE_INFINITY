# AUDIO RUNTIME MAP

**HEAD:** 8af44abed | **Date:** 2026-03-17 23:00

## TTS Speak Chain (9 hops)

```
UI Action (ConversationSection "read aloud" button)
  → [data-testid="message-tts-read"] click
  → useTTS.speak(text) [src/hooks/useTTS.ts]
  → audioService.speak(text) [src/features/audio-center/services/audioService.ts]
  → ensureRuntimeVoiceProfileHydrated() + syncVoiceIdentityProfile()
  → tauriClient.ttsSpeak({ text, settings }) [src/lib/tauriClient.ts]
  → invoke("tts_speak", { text, settings: TTSSettings }) [Tauri IPC]
  → Rust: audio::commands::tts_speak() [src-tauri/src/audio/commands.rs]
  → piper binary ($HOME/.local/bin/piper) or espeak-ng (/usr/bin/espeak-ng)
  → PCM output → play_audio_file() → pw-play / paplay / aplay
  → OS audio output (PipeWire → ALSA)
  → UI feedback: lifecycle.onStart/onComplete/onFallback
```

## TTS Stop Chain

```
UI "stop" button [data-testid="message-tts-stop"]
  → audioService.stop()
  → invoke("tts_stop") [Tauri IPC]
  → Rust: audio::commands::tts_stop()
  → kill signal to ACTIVE_TTS_PID
  → IS_TTS_PAUSED.store(false)
```

## TTS Pause/Resume Chain

```
UI pause/resume button
  → audioService.pause() / audioService.resume()
  → invoke("pause_speaking") / invoke("resume_speaking")
  → Rust: signal_active_tts("-STOP") / signal_active_tts("-CONT")
  → SIGSTOP/SIGCONT to TTS process
```

## Device List Chain (Output Devices)

```
Admin > Audio tab → AudioCenterPage mount
  → navigator.mediaDevices.enumerateDevices() [frontend-only]
  → filtered by kind='audiooutput'
  → Displayed in device dropdown
  → On select: audioService.updateTTSSettings({ outputDeviceId: id })
  → Stored in localStorage['titane_audio_config']
  → Passed to tts_speak on next call as TTSSettings.outputDeviceId
  → Rust: play_audio_file(path, Some(device_id)) → pw-play --target <id>
```

## Microphone Test Chain

```
UI mic test button → audioService.testMicrophone()
  → invoke("test_microphone")
  → Rust: audio::commands::test_microphone()
  → Uses parecord/arecord to capture a short buffer
  → Reports result (success/fail + latency)
  → UI displays AudioTestResult
```

## Speaker Test Chain

```
UI speaker test button → audioService.testSpeaker()
  → invoke("test_tts")
  → Rust: audio::commands::test_tts()
  → Generates test audio → play_audio_file()
  → Reports result
  → UI displays AudioTestResult
```

## E2E Test Buffer Chain (NEW at HEAD 8af44abed)

```
Playwright test (audio-truth.spec.ts)
  → page.evaluate: __TAURI__.core.invoke("tts_generate_test_buffer", {voice, duration_ms})
  → Tauri IPC [REQUIRES binary at HEAD 8af44abed — NOT in current binary]
  → Rust: audio::commands::tts_generate_test_buffer()
  → Deterministic sine wave generation (no hardware I/O)
  → Returns AudioTestBuffer { buffer: Vec<f32>, length, engine, voice, sampleRate, peak }
  → Playwright assertions on buffer content
```

## Settings Persistence Chain

```
AudioCenter / ConfigurationHub settings change
  → audioService.updateTTSSettings(settings)
  → normalizeRuntimeCompatibleTTS() [elevenlabs → piper on desktop]
  → localStorage.setItem('titane_audio_config', JSON.stringify(config))
  → On next app load: audioService.loadConfig() reads from localStorage
  → BACKEND SYNC: NONE — settings are frontend-only persistence
  → Risk: If localStorage cleared or browser profile reset, settings lost
```

## Voice Profile Sync Chain

```
audioService.syncVoiceIdentityProfile(voiceProfileId)
  → titaneVoiceProfiles.ts lookup
  → buildTtsSettingsFromTitaneProfile() → TTS settings with piper model path
  → invoke("set_titane_voice_profile", { profileId, settings })
  → Rust: stores active profile in app state
  → Next tts_speak uses stored profile settings
```
