# 05_COMMANDS_USED.md — Commandes utilisees

## Bootstrap

- git status
- git rev-parse --short HEAD
- git log -20 --oneline
- node -v && pnpm -v && cargo -V && rustc -V

## Discovery

- rg -n "voice*|tts*|whisper|speech|audio|..." -S src src-tauri docs
- grep -n "generate_handler" src-tauri/src/main.rs
- grep -n "fn tts*|fn get_audio*|fn voice\_|fn start_recording..." src-tauri/src/audio/commands.rs
- grep -rn "invoke(" src/ --include="\*.ts" | grep -iE "tts|voice|audio|record|whisper"
- grep -n "navigator.mediaDevices|SpeechRecognition|AudioContext..." src/
- grep -n "transcribe_audio|is_recording|get_vad_state" src-tauri/src/main.rs
- grep -n "realtime_stream_tts" src-tauri/src/ (no results — BROKEN confirmed)
- cargo test --manifest-path=src-tauri/Cargo.toml (BLOCKED — too long)

## Files read

- src-tauri/src/audio/mod.rs
- src-tauri/src/audio/commands.rs (full)
- src-tauri/src/commands/whisper_commands.rs (full)
- src-tauri/src/overdrive/voice_engine.rs (head -150)
- src/hooks/useAudioChat.tsx (head -270)
- src/hooks/useVoice.ts (head -200)
- src/services/tts/hybridTTS.ts (head -100, grep fallback)
- src/core/pipelines/UnifiedCognitivePipeline.ts (lines 430-475, 560-580)
- src/core/realtime/RealTimeExecutionEngine.ts (lines 488-510)
- src-tauri/src/main.rs (lines 1249-1900 via grep)
