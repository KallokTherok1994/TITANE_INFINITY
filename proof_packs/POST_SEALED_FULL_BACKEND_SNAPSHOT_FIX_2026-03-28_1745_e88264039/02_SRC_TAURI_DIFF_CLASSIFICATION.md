# SRC_TAURI_DIFF_CLASSIFICATION

## File 1: src-tauri/capabilities/persistence.json
- Change type: additive (1 line)
- Role: Adds `titan_force_snapshot_current` to Tauri capability list
- Risk: LOW — additive only, extends IPC surface
- Part of active lock: YES

## File 2: src-tauri/src/main.rs
- Change type: additive (1 line)
- Role: Registers `persistence::commands::titan_force_snapshot_current` as Tauri command
- Risk: LOW — additive only
- Part of active lock: YES

## File 3: src-tauri/src/persistence/commands.rs
- Change type: additive (31 lines — new command implementation)
- Role: Implements `titan_force_snapshot_current` with two feature-gated variants:
  - full+!mock path: uses AIChatState.core_collection.engine().snapshot()
  - mock/!full path (BROKEN): was returning Err("requires full backend")
- Risk: MEDIUM — mock stub was non-functional, blocking restore harness
- Part of active lock: YES — this is the primary breakpoint

## File 4: src-tauri/src/system/persona_engine/mod.rs
- Change type: correction (4 lines)
- Role: Fixes `self.lock_or_recover!(state)` → `lock_or_recover!(self.state)` macro call syntax
- Risk: LOW — correctness fix, no API change
- Part of active lock: NO — independent fix

## File 5: src-tauri/tauri.conf.json
- Change type: additive (3 lines)
- Role: Adds `titan_force_snapshot_current` to IPC allowlist
- Risk: LOW — additive only
- Part of active lock: YES

## Non-src-tauri diffs (classified as governance/ops)
- .clinerules/05-truth-surface.md: governance update
- docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md: audit update
- e2e/desktop/online-chat-proof-ui.wdio.test.js: restore harness added
- registry/proofpack-index.jsonl: registry append
- scripts/autoheal/autoheal_rules.jsonl: autoheal update
- scripts/*.sh: mode bit changes (0 line diffs = chmod only, no content)
- src/lib/security.ts: minor TS change

## Summary
The product trigger is confirmed: titan_force_snapshot_current was added as a new
Tauri command but its mock stub was broken. All 4 src-tauri files are accounted for
and all changes are bounded and reversible.
