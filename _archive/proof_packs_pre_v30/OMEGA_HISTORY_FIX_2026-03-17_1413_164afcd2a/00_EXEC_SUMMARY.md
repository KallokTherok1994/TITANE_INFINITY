# EXEC_SUMMARY — OMEGA_HISTORY_FIX_2026-03-17_1413
Date: 2026-03-17T14:13Z  SHA: 164afcd2a (pre-commit)  Branch: MAIN

## VERROU-A: OMEGA Multi-turn History Drop (PARTIAL → PARTIAL with LTM)

### Root Cause
build_prompt() in pipeline.rs received full ConversationRequest but never read
request.history. SQLite LTM (max 20 msgs, loaded commands.rs:532-563) was
silently dropped every turn. AI had no access to prior turns from SQLite.

### STM was working: mlm.get_immediate_context() (in-memory, current session)
injected as STM_RECENT_TURNS via stm_context_block (commands.rs:567-580).
Only LTM SQLite (cross-session persistence) was being dropped.

## FIX-004 APPLIED (Rust, minimal — 10 lines added to build_prompt)
- pipeline.rs: history_block computed from request.history
- Injected as ## HISTORIQUE_RÉCENT after CONTEXTE CONVERSATION
- No-op when None/empty (new conversations unaffected)
- No new dependencies, no new function, no behavior change for history=None

## PROOF (static)
- cargo check: 0 errors in pipeline/conversation_engine (pre-existing audio errors unrelated)
- verify_instructions.sh: PASS=20 FAIL=0
- detect_recurrence.sh: PASS entries=359
