# LTM_RUNTIME_PATH_PROOF_SPEC

## 1. Purpose and scope

This spec defines what constitutes a valid runtime proof of the LTM persistence path in TITANE∞.

This is NOT a broad memory architecture spec.
This covers exactly: the `persistent_memory_v19` IPC path — write → file persist → read round-trip — proven via `persistent_memory_write_entry` → `persistent_memory_get_stats` → `persistent_memory_read` at real runtime.

## 2. Active LTM systems boundary

TITANE∞ has three distinct memory subsystems:

| System | Location | Disk-backed | Proven |
|--------|----------|-------------|--------|
| `persistent_memory_v19` | `src-tauri/src/commands/persistent_memory.rs` | YES (encrypted long_term, plaintext intermediate) | P1.13a |
| `unified_memory` (ChatOrchestratorState) | `src-tauri/src/core/modules/unified_memory.rs` | YES (but write path removed) | BREAK P1.13a |
| `MultiLayerMemoryManager` | `src-tauri/src/conversation_engine/mod.rs` | NO (in-session only) | BY_DESIGN |

## 3. Proof rules

Proof is valid only if ALL of the following are observed at runtime for each scenario:

### Scenario A: get_stats baseline

1. `persistent_memory_get_stats` IPC call returns non-null `PersistentMemoryStats`
2. `count_by_level.long_term` is readable (integer ≥ 0)
3. Holds across ≥3 independent runs

### Scenario B: write_entry

1. `persistent_memory_write_entry` with `{ content, level: 'long_term', modeId }` returns a UUID string
2. UUID has length > 0
3. Each run returns a distinct UUID (unique per entry)
4. Holds across ≥3 runs

### Scenario C: stats after write

1. `persistent_memory_get_stats` after write returns `count_by_level.long_term === pre + 1`
2. Strict increment by exactly 1 (proves atomic write, not batch)
3. Holds across ≥3 runs (0→1, 1→2, 2→3)

### Scenario D: read round-trip

1. `persistent_memory_read` returns `MemoryReadResponse` with `entries: Array`
2. `total_count ≥ 1` (proves at least one entry is readable after write)
3. Holds across ≥3 runs with monotonically increasing total_count

## 4. IPC invocation protocol

Use `window.__TAURI__.core.invoke` (via `invokeTauriCommand` helper), NOT raw `window.__tauri_ipc__`.

Payload key conventions:
- Top-level command params: camelCase (Tauri v2 converts to snake_case for Rust)
  - `mode_id: String` → `modeId`
- Struct fields with `#[serde(rename_all = "camelCase")]`:
  - `current_mode` in `MemoryReadRequest` → `currentMode`
- Enum values with `#[serde(rename_all = "snake_case")]`:
  - `MemoryLevel::LongTerm` → `"long_term"` (string value, not key)

## 5. Cross-run state accumulation

`persistent_memory_v19` is disk-backed. Long_term entries persist across app restarts. The `preLongTerm + 1` assertion form correctly handles accumulated state.

## 6. BREAK_AT_RECALL_WRITE_MISMATCH

`conversation_generate` calls `orchestrator.unified_memory.recall()` but unified_memory has no active writer. This is a documented break, not proven, not fixed in P1.13a.

See `05_BREAK_ANALYSIS.md` in `POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215` for full analysis.

## 7. BLOCKED_ENV rule

If TURSO_URL or SYNC_TOKEN are absent:
- Classify as BLOCKED_ENV
- Do not attempt external sync proof
- This does NOT affect local persistence proof validity

## 8. Mermaid summary

```
persistent_memory_write_entry (content, level, modeId)
  → PersistentMemoryState (main.rs:1282)
  → ~/.local/share/titane-infinity/persistent_memory/{level}/entries.json
    (long_term: AES encrypted; intermediate: plaintext)

persistent_memory_read (request: { currentMode })
  → reads all levels → MemoryReadResponse { entries, total_count }

persistent_memory_get_stats ()
  → PersistentMemoryStats { count_by_level: { session, intermediate, long_term } }
```

## 9. Registry append rule

Append to `registry/proofpack-index.jsonl` only when:
- X3 independent runs all PASS
- All 4 scenario assertions confirmed
- Proof pack files 00–18 complete
- Verdict is `LTM_PERSISTENCE_PROVEN` or higher

## 10. Rollback rule

```
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
git restore -- docs/governance/LTM_RUNTIME_PATH_PROOF_SPEC.md
git restore -- registry/proofpack-index.jsonl
rm -rf proof_packs/POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215
```

No Rust code was changed in P1.13a. No product rollback needed.

## 11. Reopen / escalation rule

This spec is sealed for the current scope.
It may be extended (not replaced) when:
- The LTM → conversation recall bridge is implemented (P1.14+)
- External sync becomes unblocked
- A new memory subsystem is added

Do not reopen LTM persistence proof without a new product trigger.
