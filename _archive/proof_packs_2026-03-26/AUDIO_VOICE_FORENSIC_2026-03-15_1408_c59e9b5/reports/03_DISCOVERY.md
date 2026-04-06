# 03 — DISCOVERY (Analyse Statique + Commandes Bash)

## A. Fichiers Rust audio (40+ fichiers)
Modules identifiés dans src-tauri/src/ :
- **audio/** : mod.rs, commands.rs (63KB), capture.rs, recorder.rs, recording_engine.rs, asr.rs, vad.rs, voice_fingerprint.rs, streaming_engine.rs, whisper_streaming.rs
- **tts/** : online_tts.rs, local_tts.rs (+ mod.rs)
- **wakeword/** : engine.rs, listener.rs, mod.rs
- **overdrive/voice_engine.rs** : VoiceEngineState, 17 commandes voice_*
- **commands/whisper_commands.rs** : start_whisper_streaming, stop_whisper_streaming, send_audio_chunk
- Autres : chat_engine/speech.rs, avatar/*, emotion/*, singularity/*

## B. Commandes Tauri Audio Enregistrées dans generate_handler![]

### audio::commands (21 + 4 après fix)
Pré-fix : tts_speak, tts_stop, test_tts, test_microphone, get_audio_output_devices, get_audio_input_devices, set_audio_output_device, set_audio_input_device, vad_get_state, vad_process_frame, vad_configure, vad_reset, vad_test, audio_capture_start/stop/status/get_chunk/export_wav, audio_list_devices, speak, start_recording, stop_recording, cancel_recording, transcribe_audio (c59e9b5), is_recording (c59e9b5)

**Post-fix (AUDIO_VOICE_FORENSIC 2026-03-15)** : + stop_speaking, + is_speaking

### overdrive::voice_engine (17 commandes)
Toutes enregistrées : voice_start_listening, voice_stop_listening, voice_cancel_recording, voice_is_recording, voice_transcribe_audio, voice_get_status, voice_get_config, voice_update_config, voice_play_audio, voice_stop_speaking, voice_test_pipeline, voice_calibrate_microphone, voice_detect_wake_word, voice_get_available_models, voice_enable_duplex, voice_disable_duplex, voice_check_interruption

### commands_v21::whisper_commands (3 commandes)
start_whisper_streaming, stop_whisper_streaming, send_audio_chunk — toutes enregistrées

## C. Frontend Invoke Audio
- `speak` : src/services/tauri/commands.ts, chatEngine.commands.ts, tauriBridge.ts, tauriCommands.ts
- `stop_speaking` : attendu (non confirmé via grep frontend) — allowlisté + maintenant enregistré
- `is_recording` : src/services/audio/audioSelfHeal.ts
- `get_recording_status` : src/services/audio/audioSelfHeal.ts (NON enregistré — quarantaine)

## D. API Audio Navigateur (D8 — Double Pipeline)
Usage dans src/ :
- `AudioContext` : holophonicEngine.ts, RealTimeExecutionEngine.ts, notificationSystem.ts
- `getUserMedia` : APISupport.ts (support check)
- `MediaRecorder` : APISupport.ts (support check)
- `window.speechSynthesis` : APISupport.ts (support check)
→ Principalement dans moteurs internes (holophonique, RT, notifs) — PAS dans le chemin TTS principal

## E. Dépendances Audio Cargo.toml
- `cpal = "0.15"` (optional, feature "audio-capture", incluse dans default) ✅
- `hound = "3.5"` (WAV R/W) ✅
- `rustfft = "6.2"` (FFT spectral) ✅
- **Absent** : rodio, portaudio, libpulse-binding, pipewire-rs, whisper-rs, vosk-rs

## H. Capabilities Audio (audio_tts.json)
39 commandes autorisées. Parmi les défauts :
- `voice_synthesize_speech` : allowlisté mais handler déprécié/absent de generate_handler![]
- `stop_speaking`, `is_speaking` : allowlistés, handlers présents → **maintenant enregistrés (FIX-001)**
