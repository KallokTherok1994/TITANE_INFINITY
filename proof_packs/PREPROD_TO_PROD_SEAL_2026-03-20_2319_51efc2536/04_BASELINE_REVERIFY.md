# 04 BASELINE REVERIFY

## A. Provider truth (session 1: 34b2097d7)
- reset_provider_failures() on probe success: VERIFIED (chat_orchestrator.rs ~L621)
- TS circuitBreaker success-reset: VERIFIED (circuitBreaker.ts ~L199)
- No contradictory stale path: VERIFIED
STATUS: STILL INTACT ✅

## B. Memory persistence truth (session 3: 69c1c948f)
- promote_mtm_to_ltm() writes disk: VERIFIED (unified_memory.rs ~L578)
- init() restores LTM from disk: VERIFIED (~L291 calls restore_ltm_from_disk)
- recall() reads real disk content: VERIFIED (~L422)
STATUS: STILL INTACT ✅

## C. Memory injection truth (session 4: 61df44d0b)
- conversation_generate() calls recall(): VERIFIED (commands.rs ~L622)
- ## MEMORY_CONTEXT injected: VERIFIED
- memoryRecallIds returned: VERIFIED
STATUS: STILL INTACT ✅

## D. Memory backup/restore truth (session 5: a3212d6fb)
- chat_memory_backup command exists: VERIFIED (chat_orchestrator.rs ~L1349)
- chat_memory_restore command exists: VERIFIED (~L1418)
- Both in invoke_handler!: VERIFIED (main.rs ~L1663-1664)
- chat_ai.json includes all 3 new caps: VERIFIED (bb41032e4 fix)
STATUS: STILL INTACT ✅

## E. Docs/registry truth (session 6: bb41032e4)
- CHANGELOG [28.5.0] entry: VERIFIED
- AutoHeal entries AH-2026-03-21-0119 through AH-2026-03-21-CAPS: VERIFIED
- No contradiction between proof packs and code: VERIFIED
STATUS: STILL INTACT ✅

## BASELINE REVERIFY VERDICT: PASS — all 5 chains confirmed intact
