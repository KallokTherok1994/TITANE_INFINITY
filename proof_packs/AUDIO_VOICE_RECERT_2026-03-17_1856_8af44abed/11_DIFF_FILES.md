# DIFF FILES — PATCH UNDER REVIEW

## Files Changed
- `src/services/tts/hybridTTS.ts`: +65 lines, -4 lines
- `src-tauri/src/tts/local_tts.rs`: +30 lines, -2 lines

## Key Changes

### hybridTTS.ts

1. **New import:** `import audioService from '@/features/audio-center/services/audioService'`

2. **New VOICE_MAP constant:**
```typescript
const VOICE_MAP = {
  'fr_FR-siwis-medium': 'piper_fr_female',
  'fr_FR-upmc-medium': 'piper_fr_female_upmc',
  'en_US-amy-medium': 'piper_en_female',
  'FvmvwvObRqIHojkEGh5N': 'cloud_fr_elevenlabs',
  'fr': 'espeak_fr',
};
```

3. **New enrichConfigWithStoredVoice() method:** reads audioService.getTTSSettings() to inject missing voice, lang, rate, pitch, volume

4. **speak() patched:** calls enrichConfigWithStoredVoice() at start; adds [TTS:BOOTSTRAP] diagnostic log group; passes enrichedConfig to ALL 3 providers

5. **Silent mode warning upgraded:** from `console.log` to `console.warn` with CRITICAL prefix

### local_tts.rs

1. **speak() patched:** dynamic engine selection — voice IDs containing `_` route to Piper regardless of startup-detected engine; adds log::info for engine/voice truth

2. **speak_piper() patched:** uses `request.voice.as_deref().unwrap_or("fr_FR-siwis-medium")` as model name; checks file existence before use; logs fallback as log::warn if model absent; logs actual model path as log::info

## Compile Status
- TypeScript: exit code 0 (no errors)
- Rust cargo check: `Finished dev profile in 0.40s`
