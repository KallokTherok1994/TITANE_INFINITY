# 01 — POSTFIX SCOPE

## Continuing from: MEMORY_SEALING_STM_MTM_LTM_2026-03-20_2214_ce2cbecac

Already completed (DO NOT reopen):
- LTM disk write in promote_mtm_to_ltm() — real std::fs::write()
- LTM startup restore in init() — restore_ltm_from_disk()
- Anti-ghost rollback on write failure
- AutoHeal AH-2026-03-20-2214

## This session scope:
- MEMORY_INJECTION_UNPROVEN: close it
- LTM_FULL_CONTENT_NOT_LOADED: fix recall() to load disk content
- MEMORY_CONSUMPTION_UNPROVEN: expose memoryRecallIds in response metadata

## NOT in scope:
- Provider state machine
- TS AutoBackupService backup/restore path (MEMORY_RESTORE_UNPROVEN — separate session)
- memory_os or unified_memory_v2 (not wired to chat)
- Broad memory refactor

## git HEAD at session start: 69c1c948f (previous memory persistence commit)
