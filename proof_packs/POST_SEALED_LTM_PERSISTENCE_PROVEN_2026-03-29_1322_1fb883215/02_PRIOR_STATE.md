# PRIOR_STATE — P1.13a

## Baseline (from P1.12 / 1fb883215)

| Component | Status | Cycle |
|-----------|--------|-------|
| Snapshot emission | PROVEN | P1.10c |
| Snapshot → restore roundtrip | PROVEN | P1.10d |
| Event emission (append) | PROVEN | P1.11 |
| Event replay → memory reducer | PROVEN | P1.11 |
| Event replay → xp/progress/knowledge/settings | PROVEN | P1.12 |
| persistent_memory IPC round-trip | WIRED_BUT_UNPROVEN | pre-P1.13a |
| LTM recall in conversation_generate | BREAK_IDENTIFIED | P1.13 (corrected) |

## P1.13 state at entry to this cycle

- P1.13 verdict: LTM_BREAK_IDENTIFIED
- P1.13 break: analyzed TypeScript `UnifiedMemoryService` (LEGACY)
- P1.13 correction trigger: reading `src/core/services/unifiedMemory.ts` which stated "Cette mémoire unifiée locale n'est plus la source de vérité de la LTM conversationnelle active."
- Actual active path discovered: `persistent_memory_v19` (Rust, registered main.rs:2163-2174)

## persistent_memory_v19 file state before P1.13a X3 runs

- `~/.local/share/titane-infinity/persistent_memory/long_term/entries.json`: encrypted, 0 entries
- `intermediate/entries.json`: 86 entries
- `session_cache`: 0 entries

## Events state (unchanged from P1.12)

- `events.json`: 15 events (3 memory + 12 multi-reducer)
- `snapshots.json`: 4 snapshots
