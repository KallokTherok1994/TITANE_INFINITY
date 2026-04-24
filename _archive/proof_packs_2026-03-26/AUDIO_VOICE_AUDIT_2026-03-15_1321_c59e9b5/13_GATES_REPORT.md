# 13_GATES_REPORT.md — Rapport de Gates

## G_AUDIO_DOC_BACKEND_PARITY

- transcribe_audio: doc OUI, handler OUI, generate_handler AVANT FIX = NON -> FAIL -> FIXE
- is_recording: doc OUI, handler OUI, generate_handler AVANT FIX = NON -> FAIL -> FIXE
- realtime_stream_tts: doc PARTIAL, handler NON -> FAIL (non fixable sans backend)
- Verdict: FAIL avant fix / PARTIAL apres fix

## G_AUDIO_FRONTEND_BACKEND_PARITY

- get_vad_state (frontend) vs vad_get_state (backend): FAIL -> FIXE
- realtime_stream_tts: frontend appelle, aucun handler -> FAIL (non fixable)
- Verdict: FAIL avant fix / PARTIAL apres fix

## G_AUDIO_NO_SILENT_FALLBACK

- audio/commands.rs: fallbacks explicites (auto_fallback conditionnel, logs) -> PASS
- hybridTTS.ts: console.warn avant fallback -> PASS (visible)
- useAudioChat.tsx: catch + console.warn puis speechSynthesis -> PARTIAL
- RealTimeExecutionEngine.ts: console.error + retour [] -> PARTIAL (non remonte UI)
- Verdict: PARTIAL

## G_AUDIO_NO_UI_LIES

- UNKNOWN: pas de test UI runtime possible depuis CI
- Verdict: UNKNOWN

## G_AUDIO_DEVICE_ERROR_EXPLICIT

- audio/commands.rs: Err(String) explicite pour device manquant
- Pas de test permission denied runtime
- Verdict: PARTIAL

## G_AUDIO_TTS_CANCEL_BOUND

- tts_stop: arrete aplay/paplay par nom de processus
- NOTE: tts_stop utilise une approche par nom de processus
- Verdict: PARTIAL (non borne par timeout explicite)

## G_AUDIO_STT_STREAM_CONTRACT

- start_whisper_streaming / send_audio_chunk / stop_whisper_streaming: enregistres, STUBS
- Docs existent (CHAT_IA_VOICE_MODE_GUIDE.md) mais runtime = stub
- Verdict: FAIL (DOC_ONLY mismatch — docs decrivent feature non implementee)

## G_AUDIO_TESTS_X3

- cargo test: BLOCKED (compilation > 10 min, interrompue)
- pnpm test: BLOCKED (Node v18 < v20)
- Tests grepping: tests/voice/voiceE2ETests.ts presents mais mocks only
- Verdict: BLOCKED

## Synthese Gates

| Gate                            | Avant fix | Apres fix |
| ------------------------------- | --------- | --------- |
| G_AUDIO_DOC_BACKEND_PARITY      | FAIL      | PARTIAL   |
| G_AUDIO_FRONTEND_BACKEND_PARITY | FAIL      | PARTIAL   |
| G_AUDIO_NO_SILENT_FALLBACK      | PARTIAL   | PARTIAL   |
| G_AUDIO_NO_UI_LIES              | UNKNOWN   | UNKNOWN   |
| G_AUDIO_DEVICE_ERROR_EXPLICIT   | PARTIAL   | PARTIAL   |
| G_AUDIO_TTS_CANCEL_BOUND        | PARTIAL   | PARTIAL   |
| G_AUDIO_STT_STREAM_CONTRACT     | FAIL      | FAIL      |
| G_AUDIO_TESTS_X3                | BLOCKED   | BLOCKED   |
