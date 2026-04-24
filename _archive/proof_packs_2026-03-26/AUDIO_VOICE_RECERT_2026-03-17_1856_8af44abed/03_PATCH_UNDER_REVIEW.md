# PATCH UNDER REVIEW

## Patch Applied at HEAD 8af44abed

Previous HEAD: df3147c64 (AUDIO_VOICE_PROFILE_SYNC_V10)

## Files Changed

- `src/services/tts/hybridTTS.ts` (+65 lines)
- `src-tauri/src/tts/local_tts.rs` (+30 lines)

---

## CLAIM A

**hybridTTS now enriches missing voice config from stored audio settings**

```typescript
// hybridTTS.ts: new method
private enrichConfigWithStoredVoice(config: TTSConfig): TTSConfig {
  const stored = audioService.getTTSSettings();
  return {
    voice: config.voice || stored.voiceId || undefined,
    lang: config.lang || stored.language || 'fr-FR',
    rate: config.rate ?? stored.rate ?? 1.0,
    ...
  };
}
```

**Classification: PROVEN_STATIC_ONLY**
Code is present and logically correct. audioService.getTTSSettings() returns stored settings. The method is called inside speak() before any provider dispatch. Not runtime-verified in live desktop session.

---

## CLAIM B

**All important speak providers now receive the enriched config**

```typescript
// speak() calls:
await this.speakParlerTTS(text, enrichedConfig); // was: config
await this.speakTauri(text, enrichedConfig, useOnline); // was: config
await this.speakWebSpeech(text, enrichedConfig); // was: config
```

**Classification: PROVEN_STATIC_ONLY**
All three provider invocations pass `enrichedConfig` (not the raw `config`). Diff confirmed.

---

## CLAIM C

**local_tts::speak() dynamically routes according to request.voice**

```rust
// local_tts.rs: patched speak()
let effective_engine = match &request.voice {
    Some(v) if v.contains('_') => &TTSEngine::Piper,
    _ => &self.engine,
};
match effective_engine { ... }
```

**Classification: PROVEN_STATIC_ONLY**
Logic: any voiceId containing `_` (e.g. fr_FR-siwis-medium) forces Piper engine regardless of startup-detected engine. Correct heuristic for piper voice ID format.

---

## CLAIM D

**speak_piper() uses request.voice model instead of hardcoded model**

```rust
// speak_piper(): patched
let model_name = request.voice.as_deref().unwrap_or("fr_FR-siwis-medium");
let model_path = format!(".../{}.onnx", model_name);
// if file absent: log::warn! + fall back to default
```

**Classification: PROVEN_STATIC_ONLY**
Model file path is derived from voice ID. Fallback is logged (not silent). Path is correct for installed models (siwis, upmc). Missing models (Amy) are handled gracefully.

---

## CLAIM E

**The old symptom "always same voice" is no longer reproducible**

**Classification: STATIC_FIX_NOT_RUNTIME_PROVEN**

The code paths that previously caused the symptom are patched:

1. `enrichConfigWithStoredVoice()` ensures `config.voice` is populated from stored settings even when callers omit it
2. `speak_piper()` now uses the user-selected model file instead of always `fr_FR-siwis-medium.onnx`

However, since no live desktop session was run during this recertification:

- No audio output was captured
- No browser console logs showing `[TTS:BOOTSTRAP]` were collected
- No human listener confirmed two distinct voices are heard

**Manual verification protocol:** See `07_TWO_VOICE_TEST.md`
