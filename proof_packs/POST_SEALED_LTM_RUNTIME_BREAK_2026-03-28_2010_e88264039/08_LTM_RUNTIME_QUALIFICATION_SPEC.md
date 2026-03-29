# LTM RUNTIME QUALIFICATION SPEC — P1.13

## 1. Purpose and scope
Define the exact behavioral standard for LTM runtime qualification on the active Tauri desktop target. This is NOT a broad memory redesign. This covers exactly: write → persist → recall → inject → consume → false recall guard.

## 2. LTM runtime truth boundary
- Active target: Tauri desktop (wry), embedded assets
- TypeScript LTM path: MemoryBridge.ts → UnifiedMemoryService (in-memory ONLY)
- Rust LTM path: memory_os/ + unified_memory_v2/ (exist but NOT WIRED to TypeScript)
- Canonical persistence: conversation_os_v1.db (events/snapshots, NOT LTM)
- LTM persistence: NONE at runtime (memory/ltm.json is static, not runtime-sourced)

## 3. Write / persist / recall / inject / consume rules

### WRITE
- Proven: MemoryBridge.store() writes to UnifiedMemoryService (in-memory array)
- Broken: No disk persistence, no IPC to Rust backend
- Verdict: PARTIAL (in-memory only)

### PERSIST
- Proven: conversation_os_v1.db and titan_events.db are proven persistent stores
- Broken: LTM has NO persistent store at runtime
- Verdict: BROKEN (BREAK_AT_PERSIST)

### RECALL
- Proven: UnifiedMemoryService.recall() searches in-memory array
- Broken: No disk recall, no Rust semantic search
- Verdict: PARTIAL (in-memory only)

### INJECT
- Proven: MemoryBridge.buildInjection() creates systemPromptAddition
- Wired: conversationEngine.ts → providers (titaneLocal, ollama)
- Verdict: WIRED_BUT_UNPROVEN

### CONSUME
- Proven: NOT PROVEN (provider state unreliable)
- Prior evidence: HONEST_OFFLINE_DEGRADED
- Verdict: UNKNOWN

## 4. False-recall guard rule
- Current guard: Pattern-based intent detection (RECALL_PATTERNS, STORE_PATTERNS)
- Missing: Semantic deduplication, improbable-token guard, restart-boundary verification
- Verdict: PARTIAL

## 5. Local sync closure rule
- Chat sync: PROVEN
- Orchestrator sync: PROVEN
- Module sync: PROVEN
- Persistence sync: PROVEN
- LTM sync: BROKEN (no disk persistence, no Rust bridge)
- Verdict: LOCAL_SYNC_PARTIAL_BUT_HONEST

## 6. External sync BLOCKED_ENV rule
- TURSO_DATABASE_URL: NOT SET
- TURSO_AUTH_TOKEN: NOT SET
- Verdict: BLOCKED_ENV (explicit, not a proof failure)

## 7. Autoheal update rule
- No autoheal update needed — break is architectural, not a bounded bug
- Verdict: NO_AUTOHEAL_UPDATE_NEEDED

## 8. Mermaid summary

### LTM Runtime Path (Current)
```
User → MemoryBridge.ts → UnifiedMemoryService (in-memory)
  ↓ store()
  [JS array — volatile]
  ↓ recall()
  [search in-memory]
  ↓ buildInjection()
  [systemPromptAddition string]
  → conversationEngine.ts → Provider (Ollama/titaneLocal)
  → [CONSUME — unproven]
```

### LTM Rust Modules (Not Wired)
```
memory_os/ltm.rs → [NOT CONNECTED]
unified_memory_v2/persistence.rs → [NOT CONNECTED]
persistence/commands.rs → [NO LTM IPC]
```

### Correct Path (Not Yet Built)
```
User → MemoryBridge.ts → IPC → memory_os/ltm.rs → disk persistence
  ↓ restart
  disk → memory_os/ltm.rs → IPC → UnifiedMemoryService → recall → inject → consume
```

## 9. Mapping summary
- LTM Runtime Truth Map: 02_LTM_RUNTIME_TRUTH_MAP.md
- LTM Boundary Map: 03_LTM_BOUNDARY_MAP.md
- Local Sync Truth Map: 04_LOCAL_SYNC_TRUTH_MAP.md
- Commit Scope Map: 05_COMMIT_SCOPE_MAP.md

## 10. Registry append rule
Append proof pack entry to registry/proofpack-index.jsonl.

## 11. Reopen / escalation rule
Escalate to triage if the Rust ↔ TS bridge fix requires architecture-wide redesign.

## 12. Rollback rule
- rm -rf proof_packs/POST_SEALED_LTM_RUNTIME_BREAK_2026-03-28_2010_e88264039/
- git restore -- docs/governance/LTM_RUNTIME_QUALIFICATION_SPEC.md
- git restore -- registry/proofpack-index.jsonl