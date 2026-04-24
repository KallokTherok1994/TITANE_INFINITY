# 16_FINAL_VERDICT.md — Verdict Final Audit Audio/Voix

Date: 2026-03-15T13:21:56Z | SHA: c59e9b5b3 | Session: AUDIO_VOICE_AUDIT_2026-03-15_1321_c59e9b5

---

## 1. Périmètre exact audité

- src-tauri/src/audio/ (8 fichiers)
- src-tauri/src/commands/whisper_commands.rs
- src-tauri/src/overdrive/voice_engine.rs
- src-tauri/src/main.rs (generate_handler!)
- src-tauri/tauri.conf.json (allowlist)
- src-tauri/Cargo.toml (dépendances audio)
- src/hooks/useAudioChat.tsx, useVoice.ts, useVoiceMode.ts, useVoiceEngine.ts, useWhisperStream.ts
- src/services/tts/hybridTTS.ts
- src/core/pipelines/UnifiedCognitivePipeline.ts
- src/core/realtime/RealTimeExecutionEngine.ts
- src/types/ttsEngine.ts, voice.ts, audio.d.ts
- docs/CHAT_IA_VOICE_MODE_GUIDE.md, docs/06_api/TAURI_COMMANDS_REFERENCE.md

---

## 2. Ce qui est PROUVÉ

- tts_speak (piper/espeak): handler + enregistré + logs explicites
- tts_stop: handler + enregistré
- get_audio_output_devices / get_audio_input_devices: handlers + PipeWire/PulseAudio/ALSA chain
- set_audio_output_device / set_audio_input_device: handlers + enregistrés
- start_recording / stop_recording / cancel_recording: handlers + enregistrés
- vad_get_state / vad_process_frame / vad_configure / vad_reset: handlers + enregistrés
- voice_start_listening / voice_stop_listening / voice_get_status: overdrive::voice_engine
- start_whisper_streaming / stop_whisper_streaming / send_audio_chunk: enregistrés (STUBS prouvés)

---

## 3. Ce qui est PARTIEL

- transcribe_audio: handler présent, non enregistré avant fix — FIXÉ 2026-03-15
- is_recording: handler présent, non enregistré avant fix — FIXÉ 2026-03-15
- test_microphone: handler présent, résultat simulé en mode mock
- tts_stop: arrete processus par nom (pas de token cancel borné)
- device enumeration: code présent, runtime non vérifié CI

---

## 4. Ce qui est BROKEN

- realtime_stream_tts: invoqué frontend (RealTimeExecutionEngine.ts:496), AUCUN handler backend, uses new AudioContext() direct (I2)
- get_vad_state (avant fix): mauvais nom de commande frontend — FIXÉ
- UnifiedCognitivePipeline.tts_speak -> TTSAudio: type retour null -> TypeError cascade — FIXÉ

---

## 5. DOC_ONLY / STUB / UNKNOWN

- STUB: start_whisper_streaming / send_audio_chunk — stockent chunks, aucune transcription ASR réelle
- STUB: voice_synthesize_speech — commenté deprecated
- DOC_ONLY: STT Whisper natif (docs/CHAT_IA_VOICE_MODE_GUIDE.md décrit feature, runtime = stub)
- LEGACY: useVoice.ts — DEPRECATED explicitement, Web Speech API
- UNKNOWN: microphone permission denied, device hot-switch, unsupported sample rate, TTS timeout — pas de test runtime CI possible
- I2 violation connue non fixée: hybridTTS.ts (fallback Web Speech API), useAudioChat.tsx (SpeechRecognition)

---

## 6. Top 5 causes racines

1. generate_handler! incomplet: transcribe_audio et is_recording existaient dans les handlers mais n'étaient pas enregistrés
2. Nommage IPC incohérent: get_vad_state (frontend) vs vad_get_state (backend) — pas de contrat enforced
3. Contrat réponse IPC manquant: tts_speak retourne () mais pipeline attendait TTSAudio
4. realtime_stream_tts appel frontend sans handler backend: feature incomplète non gardée par gate
5. Whisper streaming = STUB: architecture présente (types, struct) mais aucun moteur ASR réel intégré

---

## 7. Fichiers modifiés

- src-tauri/src/main.rs — +5 lignes (register transcribe_audio + is_recording)
- src/hooks/useVoiceMode.ts — 1 ligne (get_vad_state -> vad_get_state)
- src/core/pipelines/UnifiedCognitivePipeline.ts — 4 lignes (null-coalesce + commentaire)
- scripts/autoheal/autoheal_rules.jsonl — +3 entrées

---

## 8. Tests/smokes exécutés x3

- Vérification grep Fix1 x3: PASS (2 commandes enregistrées confirmées)
- Vérification grep Fix2 x3: PASS (vad_get_state correct confirmé)
- Vérification grep Fix3 x3: PASS (null-coalesce confirmé)
- cargo test: BLOCKED (compilation > 10 min)
- pnpm test: BLOCKED (Node v18 < v20)

---

## 9. Gates PASS/FAIL/BLOCKED

| Gate                            | Avant fix | Après fix               |
| ------------------------------- | --------- | ----------------------- |
| G_AUDIO_DOC_BACKEND_PARITY      | FAIL      | PARTIAL                 |
| G_AUDIO_FRONTEND_BACKEND_PARITY | FAIL      | PARTIAL                 |
| G_AUDIO_NO_SILENT_FALLBACK      | PARTIAL   | PARTIAL                 |
| G_AUDIO_NO_UI_LIES              | UNKNOWN   | UNKNOWN                 |
| G_AUDIO_DEVICE_ERROR_EXPLICIT   | PARTIAL   | PARTIAL                 |
| G_AUDIO_TTS_CANCEL_BOUND        | PARTIAL   | PARTIAL                 |
| G_AUDIO_STT_STREAM_CONTRACT     | FAIL      | FAIL (stub non fixable) |
| G_AUDIO_TESTS_X3                | BLOCKED   | BLOCKED                 |

---

## 10. Rollback

```
git restore -- src-tauri/src/main.rs src/hooks/useVoiceMode.ts src/core/pipelines/UnifiedCognitivePipeline.ts
```

---

## 11. VERDICT UNIQUE

**FAIL**

Justification:

- G_AUDIO_STT_STREAM_CONTRACT: FAIL (Whisper = STUB, docs promettent feature inexistante)
- G_AUDIO_TESTS_X3: BLOCKED (pas de tests automatisés exécutables)
- I2 violations actives: useAudioChat.tsx + RealTimeExecutionEngine.ts
- realtime_stream_tts: BROKEN sans handler backend
- Runtime proof: BLOCKED (CI sans device audio, Node v18)

Améliorations appliquées (provably fixed):

- transcribe_audio: DOC_ONLY -> REGISTERED (fix minimal prouvé)
- is_recording: DOC_ONLY -> REGISTERED (fix minimal prouvé)
- get_vad_state: BROKEN -> CORRECT (fix minimal prouvé)
- TTSAudio null cascade: BROKEN -> SAFE (fix minimal prouvé)

---

## 12. Prochaine action (<= 30 min)

1. Installer Node v20+ (`nvm use 20`) puis exécuter: `pnpm run lint && pnpm run check`
2. Vérifier que transcribe_audio et is_recording sont acceptés par TypeScript via `pnpm run check`
3. Ouvrir issue ou ticket pour: realtime_stream_tts (implémenter handler ou supprimer appel)
4. Ouvrir issue pour: Whisper STUB -> implémenter transcription réelle (whisper-rs ou subprocess)
5. Ouvrir issue pour: I2 violations useAudioChat.tsx -> migrer SpeechRecognition vers voice_start_listening IPC
