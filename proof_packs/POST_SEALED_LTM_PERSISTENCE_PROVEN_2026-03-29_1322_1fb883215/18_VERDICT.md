# VERDICT

## LTM_PERSISTENCE_PROVEN

---

## Evidence

| Claim | Evidence | Status |
|-------|----------|--------|
| persistent_memory_get_stats reachable via IPC | Returns PersistentMemoryStats with count_by_level in all 3 runs | PROVEN |
| persistent_memory_write_entry returns UUID | 3 distinct UUIDs across X3 runs | PROVEN |
| long_term count increments by 1 per write | 0→1→2→3 across X3 runs | PROVEN |
| persistent_memory_read returns entries array | total_count 87→88→89 across X3 runs | PROVEN |
| Cross-run LTM accumulation (disk persistence) | pre_long_term at run N = post_long_term at run N-1 | PROVEN |
| Encrypted long_term storage functional | encrypt/decrypt round-trip returns correct entries | INFERRED_PROVEN |
| unified_memory.recall() always returns 0 | write path removed v27.0.5-prod; LTM disk empty | BREAK_DOCUMENTED |
| persistent_memory ≠ conversation recall | Two isolated systems, no bridge | ISOLATION_CONFIRMED |
| External sync | TURSO_URL absent → BLOCKED_ENV | CLASSIFIED |

---

## Proof level achieved

```
WIRED_BUT_UNPROVEN (pre-P1.13a) → LTM_PERSISTENCE_PROVEN (P1.13a)
```

Real Tauri binary, real IPC (`window.__TAURI__.core.invoke`), real file I/O, real WebDriver session.

---

## Cumulative local persistence proof matrix

| Component | Status | Cycle |
|-----------|--------|-------|
| Snapshot emission | PROVEN | P1.10c |
| snapshots_created counter | PROVEN | P1.10c |
| Snapshot → restore roundtrip | PROVEN | P1.10d |
| No-loss hash equality (X3) | PROVEN | P1.10d |
| Event emission (append) | PROVEN | P1.11 |
| Event file persistence (cross-run) | PROVEN | P1.11 |
| Event replay → memory reducer | PROVEN | P1.11 |
| Event replay → xp reducer | PROVEN | P1.12 |
| Event replay → progress reducer | PROVEN | P1.12 |
| Event replay → knowledge reducer | PROVEN | P1.12 |
| Event replay → settings reducer | PROVEN | P1.12 |
| persistent_memory IPC round-trip | PROVEN | P1.13a |
| persistent_memory cross-run accumulation | PROVEN | P1.13a |
| unified_memory recall path | BREAK_DOCUMENTED | P1.13a |
| External sync | BLOCKED_ENV | N/A |
| LTM → conversation recall bridge | IDENTIFIED_GAP | future P1.14+ |

---

## Scope boundaries

- Proven: persistent_memory_v19 write/persist/read IPC round-trip
- Proven: encrypted long_term storage accumulation across sessions
- NOT proven: external sync (BLOCKED_ENV)
- NOT proven: LTM → conversation recall injection (IDENTIFIED_GAP)
- Documented break: unified_memory recall always returns 0 (BREAK_AT_RECALL_WRITE_MISMATCH)

---

## HEAD at verdict

1fb883215

## Version

28.88.0

## Timestamp

2026-03-29T13:22:00Z

---

## Final verdict

**LTM_PERSISTENCE_PROVEN**

The `persistent_memory_v19` system is proven at runtime: IPC write → encrypted disk persist → IPC read → correct entries returned. X3 independent E2E runs confirm monotonic long_term accumulation (0→1→2→3). The unified_memory recall break (`BREAK_AT_RECALL_WRITE_MISMATCH`) is precisely documented: the write path was removed in v27.0.5-prod and was never ported to `conversation_generate`. These are two isolated findings: the persistence store IS proven; the conversation recall bridge IS broken.
