# 07 — TEST PLAN

## LANE A — STM SAVE TRUTH
STATUS: BLOCKED_ENV (no display, Node v18)
Proof: code trace — store() pushes to stm.items VecDeque synchronously. No drop path.
Runtime proof: run app, send message, check logs for "[CHAT] 💾 Stored in UnifiedMemory"

## LANE B — MTM CONSOLIDATION TRUTH
STATUS: BLOCKED_ENV
Proof: code trace — promote_stm_to_mtm() triggers when stm.items.len() > max_capacity.
Items with age>2min + importance>0.4 OR age>retention_ms are moved to mtm.items Vec.
tick() drives this but is async and not observed to be called on a schedule from orchestrator.
Risk: tick() may not be called regularly → STM may grow unbounded without triggering MTM.

## LANE C — LTM PERSIST + RECALL
STATUS: PARTIALLY PROVEN (code path), BLOCKED_ENV for runtime
BEFORE FIX: promote_mtm_to_ltm() wrote zero bytes. LTM = empty after restart.
AFTER FIX: std::fs::write() at metadata.file_path + restore_ltm_from_disk() on init().
Cargo check: PASS. Runtime file creation proof: BLOCKED_ENV.

## LANE D — NO FALSE MEMORY
STATUS: BLOCKED_ENV
Proof: recall() does keyword match; returns empty if no match. No hallucinated memory.

## LANE E — PROVIDER INDEPENDENCE
STATUS: PASS (code path)
Proof: store_in_unified_memory() takes ChatMessage (already received response); memory write
is independent of provider state. restore_ltm_from_disk() uses std::fs only.

## LANE F — BACKUP / RESTORE
STATUS: MEMORY_RESTORE_UNPROVEN
TS AutoBackupService reads localStorage; does NOT invoke Rust LTM disk path.
Rust BackupEngine uses TravelEngine + SnapshotContext — LTM disk path unknown (needs audit).

## LANE G — CHAT CONSUMPTION
STATUS: MEMORY_INJECTION_UNPROVEN / MEMORY_CONSUMPTION_UNPROVEN
recall() is never called before sending prompt. Memory stored, never consumed.
