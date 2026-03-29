# MERMAID

## Local persistence spine
```mermaid
flowchart TD
  U[User/Assistant Turns] --> C[Conversation OS v1 DB]
  C --> E[Events (append-only)]
  C --> S[Snapshots (append-only)]
  C --> P[Provider Decisions]
  C --> So[Sources]
  M[Memory Vault\nvault/encrypted] --> MV[MemoryDatabase]
  L[LTM Disk\nunified_memory/ltm] --> LI[LTM Index (derived)]
  O[Option1 Local DB\noption1_libsql_local.db] --> OE[Option1 events]
  O --> OS[Option1 snapshots (upsert)]
  C --> B[Backup Engine\nTITANE_INFINITY/persistence]
  M --> B
  L --> B
```

## Chat/orchestrator/module sync flow
```mermaid
flowchart TD
  Chat[Chat/Orchestrator] -->|append events| CDB[Conversation OS v1]
  Modules[Modules/Engines] -->|emit events| ODB[Option1 Local DB]
  CDB --> Views[Derived UI/Read models]
  ODB --> Sync[Option1 Sync Service]
  Sync -->|if TURSO env set| Remote[Turso/Remote]
  Sync -->|missing config| SyncErr[SYNC_MISSING_CONFIG]
```

## Snapshot/restore lifecycle
```mermaid
flowchart TD
  State[Live State] --> Snap[Create Snapshot]
  Snap --> Archive[Backup Engine Export]
  Archive --> Restore[Restore Path]
  Restore --> Verify[Restore Verification]
  Verify --> OK[Durable]
  Verify --> Fail[Blocked/Unknown]
```

## No-loss verification decision
```mermaid
flowchart TD
  A[Append-only events exist?] -->|No| B[No-loss blocked]
  A -->|Yes| C[Restart survival proven?]
  C -->|No| B
  C -->|Yes| D[Restore proven?]
  D -->|No| B
  D -->|Yes| E[No-loss proven]
```
