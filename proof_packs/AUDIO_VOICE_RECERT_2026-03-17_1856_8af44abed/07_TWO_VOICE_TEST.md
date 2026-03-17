# TWO-VOICE DIFFERENCE TEST

## Status: PERCEPTUAL_TRUTH_BLOCKED — requires live desktop + human listener

## Model Availability (confirmed from filesystem)
| Voice | voiceId | Model File | Available? |
|-------|---------|-----------|-----------|
| Siwis (Femme FR) | fr_FR-siwis-medium | fr_FR-siwis-medium.onnx | ✅ YES |
| UPMC (Femme FR) | fr_FR-upmc-medium | fr_FR-upmc-medium.onnx | ✅ YES |
| Amy (Female EN) | en_US-amy-medium | en_US-amy-medium.onnx | ❌ MISSING → fallback to siwis |

## Static Code Evidence That Two Voices Would Be Different

With the patch applied:
1. User selects "Siwis" → audioService stores `voiceId = fr_FR-siwis-medium`
2. hybridTTS.speak() → enrichConfigWithStoredVoice() → `enrichedConfig.voice = fr_FR-siwis-medium`
3. → speakTauri() → speak_text IPC → SpeechTask{voice: Some("fr_FR-siwis-medium")}
4. → local_tts.rs speak() → effective_engine = Piper (contains '_')
5. → speak_piper() → model_path = `.../fr_FR-siwis-medium.onnx`
6. **Result: fr_FR-siwis-medium.onnx audio**

With UPMC selected:
1. User selects "UPMC" → audioService stores `voiceId = fr_FR-upmc-medium`
2-5. Same chain...
6. **Result: fr_FR-upmc-medium.onnx audio**

Since fr_FR-siwis-medium and fr_FR-upmc-medium are DIFFERENT piper neural voice models,
they produce **materially different audio** for the same text.

## Manual Verification Protocol (required for PASS upgrade)

**Prerequisites:**
- TITANE desktop app built and running
- Audio output enabled (headphones/speakers)

**Step 1:** Open Audio Center → select "Siwis (Femme)" → save
**Step 2:** Open chat → send "Bonjour, je suis TITANE" → listen to response voice
**Step 3:** Open Audio Center → select "UPMC (Femme)" → save
**Step 4:** Open chat → send same message → listen to response voice
**Step 5:** Confirm: The two voices sound distinctly different (different tonal quality, accent, cadence)

**Expected log in browser console:**
```
Siwis test: enriched voice: fr_FR-siwis-medium → engine label: piper_fr_female
UPMC test:  enriched voice: fr_FR-upmc-medium  → engine label: piper_fr_female_upmc
```

**Expected in Rust logs:**
```
[LocalTTS] speak_piper model: .../fr_FR-siwis-medium.onnx
[LocalTTS] speak_piper model: .../fr_FR-upmc-medium.onnx
```

## Perceptual Classification
**PERCEPTUAL_TRUTH_BLOCKED** — Code path is correct; two models confirmed installed; human listening not executed.
