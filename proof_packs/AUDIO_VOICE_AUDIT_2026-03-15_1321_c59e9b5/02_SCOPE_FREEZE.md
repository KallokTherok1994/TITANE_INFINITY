# 02_SCOPE_FREEZE.md — Gel du périmètre d'audit audio/voix

## Date: 2026-03-15T13:21:56Z

## Dossiers autorisés à la modification
- `src-tauri/src/main.rs` — enregistrement generate_handler! (IPC fixes)
- `src/hooks/useVoiceMode.ts` — correction nom de commande IPC
- `proof_packs/AUDIO_VOICE_AUDIT_2026-03-15_1321_c59e9b5/` — artefacts de preuve
- `scripts/autoheal/autoheal_rules.jsonl` — entrées AutoHeal

## Surfaces interdites (sans justification explicite)
- `src-tauri/src/audio/` — refactoring de moteur interdit sans preuve causale
- `src-tauri/src/overdrive/voice_engine.rs` — refactoring interdit
- `src-tauri/tauri.conf.json` / `src-tauri/capabilities/` — élargissement de capabilities interdit
- `src/services/tts/hybridTTS.ts` — refactoring Web Speech API fallback interdit (pas fix minimal)
- `src/hooks/useAudioChat.tsx` — remplacement Web Speech API interdit (hors scope minimal)
- `src/core/realtime/RealTimeExecutionEngine.ts` — remplacement stub interdit (pas fix minimal)

## Impact Ring par fix candidat
| Fix | Ring | Fichier | Justification |
|-----|------|---------|---------------|
| Enregistrer transcribe_audio | Ring3/4 | src-tauri/src/main.rs | Handler existe, missing generate_handler! |
| Enregistrer is_recording | Ring3/4 | src-tauri/src/main.rs | Handler existe, missing generate_handler! |
| Corriger get_vad_state → vad_get_state | Ring4 | src/hooks/useVoiceMode.ts | Nom de commande erroné côté UI |

## Fonctionnalités audio classifiées

### PROUVÉES
- `tts_speak` (piper/espeak) — handler existe + enregistré
- `tts_stop` — handler existe + enregistré
- `get_audio_output_devices` — handler existe + enregistré (PipeWire/PulseAudio/ALSA fallback chain)
- `get_audio_input_devices` — handler existe + enregistré
- `set_audio_output_device` / `set_audio_input_device` — handlers existent + enregistrés
- `start_recording` / `stop_recording` / `cancel_recording` — handlers existent + enregistrés
- `vad_get_state` / `vad_process_frame` / `vad_configure` / `vad_reset` — handlers + enregistrés
- `start_whisper_streaming` / `stop_whisper_streaming` / `send_audio_chunk` — enregistrés (STUBS)
- `voice_start_listening` / `voice_stop_listening` / `voice_get_status` — via overdrive::voice_engine

### PARTIELLES
- `test_microphone` — handler existe + enregistré, mais résultat simulé (#[cfg(mock)])
- `speak` (alias tts_speak) — enregistré, proxy vers tts_speak
- `tts_speak` → retourne `Result<(), String>` mais frontend `UnifiedCognitivePipeline` attend `TTSAudio`
- `hybridTTS.ts` — TTS Parler-TTS → Tauri → Web Speech API (fallback non silencieux, mais I2 violation)

### NON PROUVÉES
- `realtime_stream_tts` — appelé frontend, AUCUN handler backend (RealTimeExecutionEngine.ts:496)
- `autoheal_init_tts` — enregistré dans generate_handler mais comportement non vérifié
- `voice_test_pipeline` — registered mais pipeline réel inconnu (test runtime impossible)

### DOC-ONLY
- `transcribe_audio` — dans tauri.conf.json allowlist + handler existe MAIS pas dans generate_handler!
- `is_recording` — dans tauri.conf.json allowlist + handler existe MAIS pas dans generate_handler!
- `get_vad_state` — utilisé dans frontend mais commande backend réelle est `vad_get_state`

### STUBS
- `start_whisper_streaming` / `send_audio_chunk` — stockent les chunks mais ne transcrivent PAS (aucun moteur Whisper réel intégré)
- `voice_synthesize_speech` — commenté comme "deprecated" dans generate_handler
- `streaming_engine.rs` / `whisper_streaming.rs` — structures présentes, transcription réelle absente

### LEGACY
- `useVoice.ts` — explicitement marqué DEPRECATED, utilise Web Speech API

## Règles dures
- MAX 12 fichiers touchés → actuel: 3 fichiers (SAFE)
- Aucun cross-ring spread inattendu → vérifié
- Aucune élargissement capabilities → confirmé
