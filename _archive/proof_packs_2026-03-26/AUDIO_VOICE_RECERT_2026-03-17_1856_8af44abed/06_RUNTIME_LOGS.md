# RUNTIME LOGS — AUDIO VOICE RECERTIFICATION

## Status: BLOCKED — No live Tauri desktop session executed in this audit

No interactive TITANE desktop was launched during this recertification session.
Runtime logs could not be captured from browser devtools or Rust process stdout.

## What runtime logs WOULD show (expected based on patched code):

### Browser Console — [TTS:BOOTSTRAP] group (hybridTTS.ts)
```
[TTS:BOOTSTRAP] ─── Voice Engine Diagnostic ───
  selectedVoice (UI stored) : fr_FR-upmc-medium
  engine (stored)           : piper
  config.voice (caller)     : none — NOT PASSED
  enriched voice            : fr_FR-upmc-medium
  engine label (VOICE_MAP)  : piper_fr_female_upmc
  provider chain            : parler-tts → tauri → webspeech
  ⚠️ MISMATCH: caller did not pass voice — injected from settings: fr_FR-upmc-medium
```

### Rust process stdout (local_tts.rs)
```
[LocalTTS] speak engine=Piper voice=Some("fr_FR-upmc-medium")
[LocalTTS] speak_piper model: /home/titane-os/.local/share/piper/voices/fr_FR-upmc-medium.onnx
```

## Static Verification Executed

### TypeScript compile:
```
npx tsc --noEmit → exit code 0 (no errors)
```

### Cargo check:
```
cd src-tauri && cargo check → Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.40s
```

### AutoHeal entry AH-2026-03-17-TTS-VOICE-NOT-BOUND:
```json
{"id":"AH-2026-03-17-TTS-VOICE-NOT-BOUND","date":"2026-03-17",
 "scope":"src/services/tts/hybridTTS.ts, src-tauri/src/tts/local_tts.rs",
 "symptom":"Audio always robotic and identical regardless of voice selection..."}
```

### verify_instructions.sh: PASS=20 FAIL=0
### detect_recurrence.sh: PASS, entries=408
