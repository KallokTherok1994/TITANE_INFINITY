# 13 — ROLLBACK (Session 2)

```bash
git restore -- src/hooks/useTwinEvolution.ts
git restore -- src/services/chat/chatMemorySingleDoor.ts
git restore -- src-tauri/src/conversation_engine/commands.rs
git restore -- src/__tests__/twins/twins-context-chain.test.ts
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

After rollback: currentPhase + syncScore no longer in localStorage or TWINS_CONTEXT.
Session 1 stale guard remains intact.
