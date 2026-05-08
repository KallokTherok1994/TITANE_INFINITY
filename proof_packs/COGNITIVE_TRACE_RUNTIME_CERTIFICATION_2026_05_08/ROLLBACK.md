# CognitiveRuntimeTrace Runtime Certification — Rollback Plan

**Date:** 2026-05-08

## Scope of changes in certification phase

1. `e2e/critical/thinking-panel-quality.spec.ts` — added `COGNITIVE_TRACE_V2_VISIBLE_IN_THINKING_PANEL` test + `[MOCK_OK]` guard + safe test message
2. `src/services/conversationEngine.ts` — added `omega_trace_meta` to `buildE2EMockConversationResponse`

## Rollback commands (targeted — preserves prior locks)

```bash
# Revert only E2E certification test additions
git restore HEAD~1 -- e2e/critical/thinking-panel-quality.spec.ts

# Revert only mock omega_trace_meta addition
git restore HEAD~1 -- src/services/conversationEngine.ts
```

## What must NOT be reverted

- `src/services/ai/cognitiveRuntimeTrace.ts` — v1/v2 foundation lock
- `src/services/ai/webTruthPolicy.ts` — v2 policy lock
- `src/services/ai/qualityActionPolicy.ts` — v2 policy lock
- `src/hooks/useConversationEngine.ts` — UI bridge lock (cognitiveTrace on metadata)
- `src/features/chat/ThinkingPanel.tsx` — Expert view selectors `reasoning-cognitive-*`
- `src/components/sections/ConversationSection.tsx` — latestAssistantRuntime.cognitiveTrace
- All `reasoning-cognitive-*` data-testid selectors

## Production runtime impact

None. `omega_trace_meta` addition is in the E2E mock code path only (`buildE2EMockConversationResponse`), isolated by `if (isE2EChatMockEnabled())`. Production Tauri runtime is untouched.
