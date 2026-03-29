# MERMAID — P1.13

## LTM Runtime Path (Current — BROKEN at PERSIST)

```mermaid
flowchart TD
  U[User Message] --> MB[MemoryBridge.ts]
  MB -->|detectIntent| DI[Intent Detection]
  DI -->|store intent| US[UnifiedMemoryService.store]
  US -->|in-memory only| ARR[JS entries array]
  US -->|NO disk write| BROKEN1[BREAK_AT_PERSIST]
  DI -->|recall intent| UR[UnifiedMemoryService.recall]
  UR -->|in-memory search| ARR
  UR -->|no disk read| BROKEN2[No Disk Recall]
  UR --> BI[MemoryBridge.buildInjection]
  BI -->|systemPromptAddition| CE[conversationEngine.ts]
  CE -->|inject context| P1[titaneLocal.ts]
  CE -->|inject context| P2[ollama.ts]
  P1 -->|CONSUME unknown| BROKEN3[BREAK_AT_CONSUME]
  P2 -->|CONSUME unknown| BROKEN3
```

## Rust LTM Modules (EXIST but NOT WIRED)

```mermaid
flowchart TD
  MO[memory_os/] --> LTM[ltm.rs — 25KB]
  MO --> CORE[core.rs — 27KB]
  MO --> STM[stm.rs]
  MO --> MTM[mtm.rs]
  MO --> SEM[semantic_search.rs]
  MO --> BRIDGE[memory_os_bridge.rs]
  UM[unified_memory_v2/] --> API[api.rs]
  UM --> PERS[persistence.rs]
  UM --> CONF[config.rs]
  UM --> ENC[encryption.rs]
  PER[persistence/] --> CMD[commands.rs — 23KB]
  PER --> DB[database.rs]
  PER --> EL[event_log.rs]
  PER --> SNAP[snapshot.rs]
  LTM -.->|NOT CONNECTED| TS[TypeScript Runtime]
  API -.->|NOT CONNECTED| TS
  CMD -.->|NO LTM IPC| TS
```

## Correct LTM Path (Not Yet Built)

```mermaid
flowchart TD
  U[User] --> MB[MemoryBridge.ts]
  MB -->|IPC call| PER[persistence/commands.rs]
  PER -->|LTM store| LTM_DISK[memory_os/ltm.rs → disk]
  LTM_DISK -->|persist| DISK[(LTM disk store)]
  DISK -->|restart| RECALL[memory_os/ltm.rs → recall]
  RECALL -->|IPC response| MB2[MemoryBridge.ts]
  MB2 -->|inject| CE[conversationEngine.ts]
  CE -->|provider| P[Ollama/titaneLocal]
  P -->|consume| OUT[Model output uses memory]
```

## External Sync (BLOCKED_ENV)

```mermaid
flowchart TD
  REQ[Sync Request] --> CFG{TURSO config?}
  CFG -->|No| BLOCKED[BLOCKED_ENV]
  CFG -->|Yes| SYNC[Option1SyncService]
  SYNC -->|sync_now| TURSO[Turso Remote]
  BLOCKED -->|TURSO_DATABASE_URL missing| ENV1[NOT SET]
  BLOCKED -->|TURSO_AUTH_TOKEN missing| ENV2[NOT SET]