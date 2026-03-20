# 12 — DIFF FILES

## Files Changed

### src/services/chat/chatMemorySingleDoor.ts
- Added: `const TWINS_FUSION_MAX_AGE_MS = 1_800_000;` (after readJson function)
- Added: `function readFreshTwinsFusion()` — freshness guard with console.warn
- Changed: `buildChatContextEnvelope` now calls `readFreshTwinsFusion()` instead of raw `readJson`

### src/__tests__/twins/twins-context-chain.test.ts (NEW)
- 12 tests: B1-B7 (context transfer), C1-C3 (binding contract), D1-D2 (effect classification)

### scripts/autoheal/autoheal_rules.jsonl
- Appended: entry AH-2026-03-20-TWINS-STALE-001
