# 08 — GATES REPORT

## scripts/verify_instructions.sh (post-fix)
```
SUMMARY: PASS=20 FAIL=0
```
**Statut : PASS** ✅
Source : raw/validation/005_verify_instructions_post_fix.log

## scripts/autoheal/detect_recurrence.sh (post-fix)
```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=262
```
**Statut : PASS** ✅
Source : raw/validation/004_detect_recurrence_post_fix.log

## Gates Statiques Audio

| Gate | Statut | Source |
|---|---|---|
| stop_speaking dans generate_handler![] | ✅ PASS (post-fix) | raw/validation/001 l.1924 |
| is_speaking dans generate_handler![] | ✅ PASS (post-fix) | raw/validation/001 l.1925 |
| mock stub stop_speaking présent | ✅ PASS (post-fix) | raw/validation/001 l.174 |
| mock stub is_speaking présent | ✅ PASS (post-fix) | raw/validation/001 l.180 |
| mock stub transcribe_audio présent | ✅ PASS (post-fix) | raw/validation/001 l.188 |
| mock stub is_recording présent | ✅ PASS (post-fix) | raw/validation/001 l.194 |
| cargo build mode mock | ⏳ PENDING | BUILD_PROVEN requis |
| IPC runtime test | ⏳ PENDING | RUNTIME_PROVEN requis |

## Résumé Gates Session
- **PASS :** 22 (20 instructions + 2 audio spécifiques post-fix)
- **PENDING :** 2 (build + runtime)
- **FAIL :** 0
