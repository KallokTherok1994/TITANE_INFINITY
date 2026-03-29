# MERMAID

## Event append + replay proof flow (runtime-proven P1.11)

```mermaid
flowchart TD
    A[E2E harness start] --> B[titan_persistence_init]
    B --> C[titan_get_events_since ts=0\npre-event baseline count]
    C --> D[titan_load_state → preEventState\npreMemoryCount = total_memories]
    D --> E[titan_persist_event\nmodule=memory, event_type=add]
    E --> F[insert_event → events.json\natomic write via .tmp rename]
    F --> G[titan_get_events_since ts=0\npost-emit count]
    G --> H{postEventsCount >= preEventsCount + 1?}
    H -- YES --> I[titan_load_state → postEventState\nload_latest_snapshot + load_events_since\n+ apply_event_to_state]
    H -- NO --> Z1[EXIT 1 — EMIT_FAIL]
    I --> J{postMemoryCount === preMemoryCount + 1?}
    J -- YES → PASS --> K[EXIT 0]
    J -- NO → FAIL --> Z2[EXIT 1 — REPLAY_FAIL]

    style K fill:#2d5a27,color:#fff
    style Z1 fill:#8b0000,color:#fff
    style Z2 fill:#8b0000,color:#fff
```

## Full local persistence stack (proven components P1.10d + P1.11)

```mermaid
flowchart LR
    IPC[Tauri IPC] --> CMD[commands.rs]
    CMD --> ENG[PERSISTENCE_ENGINE\nLazy Arc RwLock]
    ENG --> PE_SNAP[force_snapshot\nforce_snapshot_current]
    ENG --> PE_EVT[persist_event\nload_latest_state]
    PE_SNAP --> DB_SNAP[save_snapshot\nload_latest_snapshot]
    PE_EVT --> DB_EVT[insert_event\nload_events_since]
    DB_SNAP --> FS_SNAP[(snapshots.json\n4 snapshots P1.10d)]
    DB_EVT --> FS_EVT[(events.json\n3 events P1.11)]
    PE_EVT --> REDUCER[apply_event_to_state\nmemory module PROVEN]

    style FS_SNAP fill:#1a3a5c,color:#fff
    style FS_EVT fill:#2d5a27,color:#fff
    style REDUCER fill:#2d5a27,color:#fff
```

## X3 monotonic proof

```mermaid
flowchart LR
    R1[Run 1\npreMemory=0\nevents=0] --> P1[PASS\ntotal_memories=1\nevents=1]
    R2[Run 2\nWRY crash] --> F1[FAIL non-persistence]
    F1 --> R2R[Run 2 retry\npreMemory=1\nevents=1]
    R2R --> P2[PASS\ntotal_memories=2\nevents=2]
    R3[Run 3\npreMemory=2\nevents=2] --> P3[PASS\ntotal_memories=3\nevents=3]
    P1 --> V[APPEND_ONLY_EVENT_REPLAY_PROVEN]
    P2 --> V
    P3 --> V

    style V fill:#2d5a27,color:#fff
    style F1 fill:#5a4a00,color:#fff
```

## Sync boundary (local vs external)

```mermaid
flowchart TD
    CHAT[Chat sync\nOllama local\nPROVEN] --> LOCAL[LOCAL SYNC\nPROVEN]
    SNAP[Snapshot path\nP1.10d PROVEN] --> LOCAL
    EVT[Event path\nP1.11 PROVEN] --> LOCAL
    LOCAL --> BOUNDARY{TURSO_URL set?}
    BOUNDARY -- NO --> BLOCKED[BLOCKED_ENV\nExternal sync unprovable]
    BOUNDARY -- YES --> EXT[External sync\nnot implemented mock]

    style LOCAL fill:#2d5a27,color:#fff
    style BLOCKED fill:#8b0000,color:#fff
```
