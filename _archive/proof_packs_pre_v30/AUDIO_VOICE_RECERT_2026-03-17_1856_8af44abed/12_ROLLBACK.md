# ROLLBACK PLAN

## Rollback Command
```bash
git restore -- src/services/tts/hybridTTS.ts src-tauri/src/tts/local_tts.rs
```

## Effect of Rollback

### hybridTTS.ts (reverted)
- `enrichConfigWithStoredVoice()` removed → callers that omit `config.voice` will again pass `undefined` to TTS engine
- `VOICE_MAP` diagnostic removed
- `[TTS:BOOTSTRAP]` log group removed
- All 3 providers revert to receiving raw `config` (without stored voice injection)
- Silent mode warning reverts to `console.log` (non-critical)

### local_tts.rs (reverted)
- `speak()` reverts to using `self.engine` always (no dynamic piper override for underscore voice IDs)
- `speak_piper()` reverts to hardcoded `fr_FR-siwis-medium.onnx` regardless of `request.voice`
- log::info and log::warn for model path removed

## Post-rollback State
- Voice selection in UI will have no effect on hybridTTS path
- All TTS calls via hybridTTS will use default model (fr_FR-siwis-medium)
- Per-message play via messageSpeechController path unaffected (separate code path)

## Rollback Verification
```bash
cargo check --manifest-path src-tauri/Cargo.toml
npx tsc --noEmit
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```
