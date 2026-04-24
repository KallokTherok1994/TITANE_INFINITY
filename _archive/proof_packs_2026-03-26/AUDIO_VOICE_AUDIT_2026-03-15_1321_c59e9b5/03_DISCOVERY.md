# 03_DISCOVERY.md — Résultats de découverte

## A. Surfaces audio/voix localisées

### Backend (src-tauri/)

- `src-tauri/src/audio/` — module audio complet (8 fichiers: asr.rs, capture.rs, commands.rs, mod.rs, recorder.rs, recording_engine.rs, streaming_engine.rs, vad.rs, voice_fingerprint.rs, whisper_streaming.rs)
- `src-tauri/src/commands/whisper_commands.rs` — commandes Whisper streaming
- `src-tauri/src/overdrive/voice_engine.rs` — moteur vocal full-duplex (ASR+TTS)
- `src-tauri/Cargo.toml` — `cpal = optional, hound = "3.5"`, feature `audio-capture = ["cpal"]`
- `src-tauri/tauri.conf.json` — 30+ commandes audio/voice allowlistées

### Frontend (src/)

- `src/hooks/useAudioChat.tsx` — SpeechRecognition + AudioContext + speechSynthesis (Web API directe)
- `src/hooks/useVoice.ts` — DEPRECATED, Web Speech API
- `src/hooks/useVoiceEngine.ts` — via secureInvoke, Tauri-IPC
- `src/hooks/useVoiceMode.ts` — via secureInvoke, bug get_vad_state
- `src/hooks/useWhisperStream.ts` — tauriClient.startWhisperStreaming
- `src/services/tts/hybridTTS.ts` — Parler-TTS → Tauri → Web Speech API
- `src/core/pipelines/UnifiedCognitivePipeline.ts` — tts_speak avec mauvais type retour
- `src/core/realtime/RealTimeExecutionEngine.ts` — realtime_stream_tts (pas de handler)
- `src/types/ttsEngine.ts` — types TTS complets
- `src/types/voice.ts` — types voix

## B. Enregistrement Tauri (generate_handler!)

### Commandes audio enregistrées (confirmé main.rs):

- audio::commands::tts_speak ✅
- audio::commands::tts_stop ✅
- audio::commands::test_tts ✅
- audio::commands::test_microphone ✅
- audio::commands::get_audio_output_devices ✅
- audio::commands::get_audio_input_devices ✅
- audio::commands::set_audio_output_device ✅
- audio::commands::set_audio_input_device ✅
- audio::commands::vad_get_state / vad_process_frame / vad_configure / vad_reset / vad_test ✅
- audio::commands::audio_capture_start/stop/status/get_chunk/export_wav ✅
- audio::commands::audio_list_devices ✅
- audio::commands::speak (alias) ✅
- audio::commands::start_recording / stop_recording / cancel_recording ✅
- overdrive::voice_engine::voice_start_listening/stop/cancel/is/transcribe/... ✅
- commands_v21::whisper_commands::start_whisper_streaming/stop/send_audio_chunk ✅
- singularity_fusion::autoheal_clear_tts_queue / autoheal_init_tts ✅

### Commandes manquantes dans generate_handler! (AVANT FIX):

- audio::commands::transcribe_audio ❌ (handler existe, non enregistré)
- audio::commands::is_recording ❌ (handler existe, non enregistré)

## C. Frontend Invocations audio détectées

- `secureInvoke('tts_speak', ...)` — src/core/pipelines/UnifiedCognitivePipeline.ts
- `secureInvoke('start_recording', ...)` — src/modules/vocalDev/VocalDevConsoleEngine.ts
- `secureInvoke('test_microphone')` — src/modules/vocalDev/VocalDevConsoleEngine.ts
- `secureInvoke('transcribe_audio', ...)` — src/hooks/useVoiceMode.ts
- `secureInvoke('get_vad_state')` — src/hooks/useVoiceMode.ts (BUG: devrait être vad_get_state)
- `secureInvoke('realtime_stream_tts', ...)` — src/core/realtime/RealTimeExecutionEngine.ts (PAS de handler)
- `tauriClient.startWhisperStreaming(...)` — src/hooks/useWhisperStream.ts
- `tauriClient.stopWhisperStreaming()` — src/hooks/useWhisperStream.ts
- `tauriClient.sendAudioChunk(...)` — src/hooks/useWhisperStream.ts
- `safeInvoke('tts_speak', ...)` — src/hooks/useAudioChat.tsx (avec fallback Web Speech API)
- `secureInvoke('voice_start_listening'...)` — src/hooks/useVoiceEngine.ts

## D. Browser Audio APIs directes détectées (I2 violations potentielles)

- `src/hooks/useAudioChat.tsx` — SpeechRecognition, AudioContext, speechSynthesis
- `src/stores/useVisionStore.ts` — navigator.mediaDevices.getUserMedia (vision, hors scope audio)
- `src/core/realtime/RealTimeExecutionEngine.ts` — new AudioContext() (I2 violation)
- `src/hooks/useVoice.ts` — DEPRECATED, Web Speech API

## E. Bibliothèques audio backend

- `cpal = { version = "0.15", optional = true }` (feature audio-capture)
- `hound = "3.5"` (toujours présent)
- Aucun whisper-rs, vosk, ou moteur STT réel dans Cargo.toml

## F. Docs/API audio

- `docs/CHAT_IA_VOICE_MODE_GUIDE.md` — invoke('start_recording'), invoke('transcribe_audio'), invoke('stop_recording')
- `docs/06_api/TAURI_COMMANDS_REFERENCE.md` — commandes référencées

## G. Tests voice/audio

- `src-tauri/tests/commands_v21_smoke_tests.rs:106` — tests Whisper (test_whisper_start_stop, etc.)
- `src/tests/voice/voiceE2ETests.ts` — mocks secureInvoke pour voice
- `src/__tests__/e2e/VoiceWorkflow.e2e.test.tsx` — tests E2E avec mock getUserMedia

## H. Permissions/capabilities audio

- `src-tauri/tauri.conf.json` — 30+ commandes audio dans allowlist
- `#[cfg(feature = "audio-capture")]` — cpal gated, activé par défaut

## K. Backend réseau audio

- Aucun reqwest/ureq pour audio (TTS est local: piper/espeak)
- Parler-TTS via HTTP (VITE_PARLER_TTS_ENABLED opt-in seulement)
