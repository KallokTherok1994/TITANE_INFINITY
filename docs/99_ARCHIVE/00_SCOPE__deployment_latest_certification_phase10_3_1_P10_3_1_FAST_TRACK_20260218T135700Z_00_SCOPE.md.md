# P10.3.1 Fast Track: Scope & Files

## Exact File Paths
- **ChatBubble.tsx**: src/components/chat/ChatBubble.tsx
- **E2E Test 1**: e2e/desktop/ai-verification.full.e2e.js
- **E2E Test 2**: e2e/desktop/chat-ar20.wdio.test.js

## Changes Made
1. Added `data-testid="chat-bubble-trigger"` to ChatBubble.tsx motion.button (line ~343)
2. Updated E2E selector from CSS class to data-testid in test files
3. Transport layer patch already committed (ollama.ts lines 39-40 removed)

## Proof Pack
- Directory: deployment/latest/certification/phase10_3_1/P10_3_1_FAST_TRACK_20260218T135700Z
- Created: 2026-02-18T13:57:10Z

## Status
- Files allowed: ChatBubble.tsx, e2e/desktop/**, deployment/**
- Guard: Pending
- E2E: Pending
