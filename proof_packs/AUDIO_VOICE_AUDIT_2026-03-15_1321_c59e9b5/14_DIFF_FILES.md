# 14_DIFF_FILES.md — Fichiers modifies

## Fix 1: src-tauri/src/main.rs
- Ajout audio::commands::transcribe_audio dans generate_handler!
- Ajout audio::commands::is_recording dans generate_handler!
- Ligne ~1880, apres cancel_recording

## Fix 2: src/hooks/useVoiceMode.ts
- Ligne 187: get_vad_state -> vad_get_state
- Cause: nom de commande errone cote frontend

## Fix 3: src/core/pipelines/UnifiedCognitivePipeline.ts
- Ligne ~451: return result -> return result ?? this.createEmptyTTS()
- Cause: tts_speak retourne Result<()> = null, pipeline attendait TTSAudio
- Previent TypeError cascadant dans prepareAvatarAnimation

## Fichiers NON modifies (scope frozen)
- src-tauri/src/audio/commands.rs (handlers intacts)
- src-tauri/tauri.conf.json (pas d'elargissement)
- src/hooks/useAudioChat.tsx (I2 violation documentee, refactor hors scope minimal)
- src/services/tts/hybridTTS.ts (fallback documente, refactor hors scope)
- src/core/realtime/RealTimeExecutionEngine.ts (realtime_stream_tts BROKEN documente)
