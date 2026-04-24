# BOOTSTRAP — AUDIO VOICE RECERTIFICATION

**Date:** 2026-03-17 18:56 UTC

## Environment

| Item   | Value                         |
| ------ | ----------------------------- |
| HEAD   | `8af44abed`                   |
| Branch | MAIN                          |
| node   | v18.19.1                      |
| cargo  | 1.94.0 (85eff7c80 2026-01-15) |
| rustc  | 1.94.0 (4a4ef493e 2026-03-02) |

## Git Log (last 10)

```
8af44abed feat(e2e): add Audio E2E Truth System (STEP3-8)
8b78ce1e2 docs(proof): force-add LOCAL_TRUTH_V4 log artifacts
59123ab6a docs(proof): complete LOCAL_TRUTH_V4 governance proof pack index and wrappers
f0fda53d8 fix(governance): repair duplicate autoheal id AH-2026-03-17-SEAL-MASTER
df3147c64 proof(V10): seal AUDIO_VOICE_PROFILE_SYNC_V10 — desktop E2E online+offline PASS
8b0494324 Merge pull request #182
fd64e2f68 Merge branch 'MAIN' into copilot/establish-documentation-system
999715425 docs: complete canonical FR/EN documentation system, gates PASS=20 FAIL=0
657bc54f7 docs: create canonical documentation structure
be2cc878c docs(proof): FIX-016 verdict + autoheal entries for runtime REAL classification
```

## TTS Runtime Availability

| Component               | Status     | Path                                                |
| ----------------------- | ---------- | --------------------------------------------------- |
| piper binary            | ✅ PRESENT | `~/.local/bin/piper`                                |
| fr_FR-siwis-medium.onnx | ✅ PRESENT | `~/.local/share/piper/voices/`                      |
| fr_FR-upmc-medium.onnx  | ✅ PRESENT | `~/.local/share/piper/voices/`                      |
| en_US-amy-medium.onnx   | ❌ MISSING | `~/.local/share/piper/voices/en_US-amy-medium.onnx` |
| espeak-ng               | ✅ PRESENT | `/usr/bin/espeak-ng`                                |

## AutoHeal

- entries: 408 (added AH-2026-03-17-TTS-VOICE-NOT-BOUND)
- verify_instructions.sh: PASS=20 FAIL=0 (HEAD 8af44abed)
