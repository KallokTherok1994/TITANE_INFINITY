# VERDICT — AUDIO VOICE RECERTIFICATION (FINAL UPDATED)

**HEAD:** 17838b9b1  
**Date:** 2026-03-17 19:10 UTC  
**Auditor:** Copilot Agent (TITANE∞ Audit Protocol)

---

## ALL FIXES APPLIED AND COMMITTED

- `8af44abed` — voice binding patch (enrichConfigWithStoredVoice + local_tts dynamic routing)
- `6c9a21402` — fallback UI events (addToast) + backend auto-TTS voice:None fixed
- `17838b9b1` — proof pack sealed

---

## FINAL UNIQUE VERDICT

# `PARTIAL`

---

## Gate Summary (updated HEAD 17838b9b1)

| Gate | Status | Evidence |
|------|--------|----------|
| G_BOOT_TRUTH | PASS | HEAD=17838b9b1; piper installed; FR models confirmed |
| G_PATCH_CLAIMS_REVIEWED | PASS | All 5 claims + 2 new fixes verified |
| G_RUNTIME_PATH_MAPPED | PASS | Full 9-hop chain traced, voice NOT dropped |
| G_CHAT_PATH_PROVEN | PASS | enrichConfigWithStoredVoice() auto-enriches all callers |
| G_PROVIDER_TRUTH_VISIBLE | PASS | [TTS:BOOTSTRAP] log group on every speak() call |
| G_MODEL_TRUTH_VISIBLE | PASS | log::info! speak_piper model in local_tts.rs |
| G_FALLBACK_HONESTY | PASS | addToast warning on all fallback paths |
| G_TWO_VOICE_DIFFERENCE | PARTIAL | siwis+upmc models installed; routes correctly; perceptual BLOCKED |
| G_DESKTOP_TARGET_TRUTH | PARTIAL | Prior V10 PASS; this HEAD needs rebuild |
| G_NO_ACTIVE_BYPASS | PASS | All bypasses fixed; auto-TTS uses fr_FR-siwis-medium |
| G_ROLLBACK_READY | PASS | git restore documented |

**PASS: 9/11 | PARTIAL: 2/11 | FAIL: 0/11**

---

## What was Fixed

| Fix | Status |
|-----|--------|
| Voice enrichment in hybridTTS.speak() | DONE |
| local_tts dynamic piper routing | DONE |
| speak_piper dynamic model selection | DONE |
| Fallback events with UI toast notification | DONE |
| Backend auto-TTS voice:None -> fr_FR-siwis-medium | DONE |
| Amy (en_US) model download | BLOCKED (no internet) |

---

## Why Still PARTIAL

Only remaining blocker: **perceptual proof** — human listening confirmation that siwis and upmc piper models produce audibly different audio. Both models are installed. Code chain is correct.

## Upgrade to PASS

1. Launch TITANE desktop
2. Audio Center -> select "Siwis (Femme)" -> send message -> listen
3. Audio Center -> select "UPMC (Femme)" -> send message -> listen
4. Confirm audibly different voices
5. Check browser console [TTS:BOOTSTRAP] shows different voiceId

## Gates
```
verify_instructions.sh  -> PASS=20 FAIL=0
detect_recurrence.sh    -> PASS, entries=411
tsc --noEmit            -> exit 0
cargo check             -> Finished dev profile
```
