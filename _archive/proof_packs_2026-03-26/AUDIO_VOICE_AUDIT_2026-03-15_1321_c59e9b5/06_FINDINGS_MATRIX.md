# 06_FINDINGS_MATRIX.md — Matrice des résultats d'audit

| Fonctionnalite                                      | Statut          | Details                                                               |
| --------------------------------------------------- | --------------- | --------------------------------------------------------------------- |
| tts_speak (piper/espeak)                            | PROVEN          | Handler + enregistre + logs                                           |
| tts_stop                                            | PROVEN          | Handler + enregistre                                                  |
| get_audio_output_devices                            | PROVEN          | PipeWire/PulseAudio/ALSA chain                                        |
| get_audio_input_devices                             | PROVEN          | Idem                                                                  |
| set_audio_output_device                             | PROVEN          | Handler + enregistre                                                  |
| set_audio_input_device                              | PROVEN          | Handler + enregistre                                                  |
| start_recording / stop_recording / cancel_recording | PROVEN          | Enregistres (fix 2026-03-06)                                          |
| vad_get_state / vad_process_frame / vad_configure   | PROVEN          | Handler + enregistre                                                  |
| voice_start_listening / voice_stop_listening        | PROVEN          | overdrive::voice_engine                                               |
| voice_get_status / voice_get_config                 | PROVEN          | overdrive::voice_engine                                               |
| transcribe_audio                                    | PARTIAL         | Handler existe, manquant generate_handler avant fix — FIXE 2026-03-15 |
| is_recording                                        | PARTIAL         | Handler existe, manquant generate_handler avant fix — FIXE 2026-03-15 |
| get_vad_state (frontend) -> vad_get_state (backend) | BROKEN          | Mauvais nom frontend — FIXE 2026-03-15                                |
| tts_speak -> TTSAudio (UnifiedCognitivePipeline)    | BROKEN          | Type retour null cascade TypeError — FIXE 2026-03-15                  |
| realtime_stream_tts                                 | BROKEN          | Aucun handler backend, AudioContext direct (I2 violation)             |
| start_whisper_streaming                             | STUB            | Enregistre, mais stocke chunks sans transcription reelle              |
| stop_whisper_streaming / send_audio_chunk           | STUB            | Idem                                                                  |
| voice_synthesize_speech                             | STUB            | Commente deprecated dans generate_handler                             |
| hybridTTS.ts Web Speech API fallback                | DOC_ONLY        | Strategie fallback documentee, I2 violation connue                    |
| useAudioChat.tsx SpeechRecognition                  | DOC_ONLY/LEGACY | Fonctionnel Web-only, I2 violation                                    |
| useVoice.ts                                         | LEGACY          | DEPRECATED explicitement, suppression prevue v20                      |
| STT Whisper natif reel                              | UNKNOWN         | Aucun moteur ASR reel dans Cargo.toml/src                             |
| Microphone permission denied                        | UNKNOWN         | Pas de test runtime possible dans CI                                  |
| Device hot-switch                                   | UNKNOWN         | Pas de test runtime possible                                          |
| Unsupported sample rate                             | UNKNOWN         | Pas de test runtime possible                                          |
| TTS cancel en cours                                 | PARTIAL         | tts_stop arrete processus, pas de token cancel borne                  |
