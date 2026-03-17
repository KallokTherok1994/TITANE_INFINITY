# VERDICT — AUDIO VOICE RECERTIFICATION

**HEAD:** 8af44abed  
**Date:** 2026-03-17 18:56 UTC  
**Auditor:** Copilot Agent (TITANE∞ Audit Protocol)

---

## FINAL UNIQUE VERDICT

# `PARTIAL`

---

## Justification

### What is PROVEN (statically)

| Claim | Status |
|-------|--------|
| Voice enrichment from audioService in hybridTTS.speak() | ✅ PROVEN_STATIC |
| All 3 TTS providers receive enrichedConfig | ✅ PROVEN_STATIC |
| local_tts::speak() dynamic engine routing | ✅ PROVEN_STATIC |
| speak_piper() uses request.voice as model file | ✅ PROVEN_STATIC |
| Voice NOT dropped at any of 9 IPC/Rust hops | ✅ PROVEN_STATIC |
| 2 distinct piper FR models installed (siwis + upmc) | ✅ FILESYSTEM_CONFIRMED |
| Backend auto-TTS (voice:None) is DORMANT on OMEGA path | ✅ PROVEN_STATIC |
| No active bypass found | ✅ PROVEN_STATIC |

### What REMAINS UNPROVEN

| Gap | Classification |
|----|----------------|
| Human ear confirms 2 voices sound different | PERCEPTUAL_TRUTH_BLOCKED |
| Browser console shows [TTS:BOOTSTRAP] logs with correct voiceId | RUNTIME_LOGS_BLOCKED |
| Desktop binary rebuilt and E2E re-run at HEAD 8af44abed | DESKTOP_TARGET_PARTIAL |
| Amy (en_US) model missing — user sees silent fallback with no UI notification | FALLBACK_UI_GAP |

### Why not FAIL
The code is correct. The root cause (hardcoded voice model, missing enrichment) is fixed. The voice chain is end-to-end verified statically. Two compatible piper models are confirmed installed. The patch logic is sound.

### Why not PASS
Perceptual proof — human listening confirming two voices sound different — has not been executed. No live desktop session ran. This is an irreducible requirement per the Hard Constitution (I1, I2, I3).

### Why PARTIAL (not STATIC_FIX_NOT_RUNTIME_PROVEN)
The system has all prerequisites for real voice differentiation: piper installed, 2 models present, code path correct end-to-end. The only blocker is execution of the manual listening test. This is not a code defect — it is an audit resource limitation. The fix is very likely correct.

---

## Upgrade Path to PASS

To upgrade this verdict to PASS, execute the manual protocol in `07_TWO_VOICE_TEST.md`:
1. Launch TITANE desktop
2. Select Siwis → trigger chat → listen
3. Select UPMC → trigger same chat → listen
4. Confirm voices are audibly different
5. Capture browser console `[TTS:BOOTSTRAP]` output showing different voiceId per selection
6. Capture Rust logs showing different `speak_piper model:` paths

---

## Gate Summary
- PASS: 7/11
- PARTIAL: 2/11
- BLOCKED: 1/11
- FAIL: 0/11

---

## Mandatory Gates Final Status
```
bash scripts/verify_instructions.sh  →  PASS=20 FAIL=0 ✅
bash scripts/autoheal/detect_recurrence.sh  →  PASS, entries=408 ✅
```
