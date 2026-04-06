# ROOT CAUSE (DEFECT_001 — now fixed)

DEFECT: chat_memory_backup + chat_memory_restore + chat_get_memory_stats
        not in src-tauri/capabilities/chat_ai.json

ROOT CAUSE:
  New Tauri commands added to invoke_handler! without a paired capabilities JSON update.
  No automated gate cross-checks invoke_handler! registrations against capability allow lists.

CONTRIBUTING FACTORS:
  1. Large main.rs (2000+ lines) — easy to miss capabilities check
  2. Capability files not adjacent to command definitions
  3. Prior proof packs verified cargo check (compilation) but not capability coverage

SYSTEMIC PREVENTION:
  - AutoHeal rule AH-2026-03-21-CAPS added
  - Manual discipline: every new invoke_handler! entry must have matching capability entry
  - Future: add script to cross-check invoke_handler! registrations vs capability JSON allow lists
