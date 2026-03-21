# 01 — BOOTSTRAP

git status: M e2e/desktop/total-dev.wdio.test.js (pre-existing, unrelated)
git HEAD: ce2cbecac
node: v18.19.1 (below ≥20 engine constraint — desktop runtime BLOCKED_ENV)
cargo: 1.94  rustc: 1.94

## Memory files found
- src-tauri/src/core/modules/unified_memory.rs (824 lines) — USED BY CHAT ORCHESTRATOR
- src-tauri/src/memory_os/ (full memory_os module ~2900 lines) — NOT WIRED TO CHAT
- src-tauri/src/unified_memory_v2/ (persistence.rs, etc.) — NOT WIRED TO CHAT
- src-tauri/src/overdrive/memory_engine.rs (541 lines) — Tauri cmd handlers, own state
- src/services/unified/UnifiedMemory.ts — TS-side memory
- src/services/backup/AutoBackupService.ts — TS backup (localStorage + fs invoke)
- src-tauri/src/time/backup_engine.rs — Rust backup engine (uses TravelEngine, snap)

## REAL_STATE
- STM: VecDeque in RAM, no disk. Pure session memory. Crash = STM loss.
- MTM: Vec in RAM, no disk. Crash = MTM loss.
- LTM: in-memory index only. promote_mtm_to_ltm() created metadata but wrote ZERO bytes to disk.
  init() never loaded from disk. LTM = empty index every boot.
- LTM storage path: ~/.local/share/titane-infinity/ltm/ (created by init())
- Retrieval: recall() searches STM+MTM+LTM in-memory index (lexical keyword match)
- Injection into prompt: NONE — store_in_unified_memory() is called AFTER response, recall() is
  NEVER called before building the prompt. Memory is stored but not retrieved for chat context.

## CURRENT_REAL_LOCK
PRIMARY: LTM disk write is a TODO comment — LTM_NOT_RETRIEVABLE (cross-session)
SECONDARY: STM/MTM RAM-only (design choice, acceptable for session; risk = crash loss)
TERTIARY: No memory injection into chat prompts — MEMORY_INJECTION_UNPROVEN
           (store_in_unified_memory is called post-response; no pre-request recall())

## RISK_MAIN
HIGH: LTM never persisted, never restored = user history silently lost on restart
MEDIUM: STM/MTM crash loss = session context lost on unexpected app crash
LOW: Injection absent = memory stored but never used to inform answers
