# 12 — DIFF FILES (Session 2)

### src/hooks/useTwinEvolution.ts
- localStorage write: added currentPhase + syncScore from profile

### src/services/chat/chatMemorySingleDoor.ts
- twinsContext type: added currentPhase?: string|null, syncScore?: number
- readFreshTwinsFusion raw type: added currentPhase, syncScore fields
- return statement: passes currentPhase and syncScore through

### src-tauri/src/conversation_engine/commands.rs
- extract_context_binding: added twinsPhase + twinsSyncScore extraction
- system_prompt builder: extracts twins_phase; appends ", phase=X" when != "unknown"

### src/__tests__/twins/twins-context-chain.test.ts
- Added E1-E5 tests for phase + syncScore expansion

### scripts/autoheal/autoheal_rules.jsonl
- Appended: AH-2026-03-20-TWINS-CONTEXT-NARROW-009
