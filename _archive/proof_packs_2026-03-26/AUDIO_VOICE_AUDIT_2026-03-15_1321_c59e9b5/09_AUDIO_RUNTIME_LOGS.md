# 09_AUDIO_RUNTIME_LOGS.md — Logs runtime audio

## Statut

BLOCKED: Pas d'execution runtime possible depuis CI/shell.

- pnpm tauri dev: requiert Node >= 20 (actuel: v18.19.1)
- cargo run: non lance (compilation longue, pas de display)
- device audio: pas d'acces depuis l'environnement CI

## Logs disponibles dans src-tauri/src/audio/commands.rs (statiques)

- log::info!("[TTS] tts_speak called with text: '...' engine: {}")
- log::info!("[TTS] Piper synthesis completed")
- log::info!("[TTS] Playing audio with aplay...")
- log::warn!("[TTS] Piper not found at {}")
- log::error!("[TTS] Piper failed: {}")
- log::error!("[TTS] Output file is empty!")

## Logs whisper_commands.rs

- log::info!("[WHISPER] start_whisper_streaming: model={}")
- log::info!("[WHISPER] Whisper streaming started")
- log::debug!("[WHISPER] send_audio_chunk: {} bytes")

## Conclusion

Runtime proof: BLOCKED — pas de logs captures en execution reelle.
