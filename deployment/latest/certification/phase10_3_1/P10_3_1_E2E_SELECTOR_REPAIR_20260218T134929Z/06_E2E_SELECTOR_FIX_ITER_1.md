# E2E Selector Fix — Iteration 1

**Date**: $(date -u '+%Y-%m-%dT%H:%M:%SZ')
**Iteration**: 1 / 3
**Strategy**: Add data-testid to UI element, update test selectors

## Changes Applied

### Files Modified
1. **src/components/chat/ChatBubble.tsx** (line 343)
   - Added: `data-testid="chat-bubble-trigger"`
   - Location: motion.button wrapper for chat trigger
   - Rationale: Stable test anchor, CSS-independent

2. **e2e/desktop/ai-verification.full.e2e.js** (lines 72, 258)
   - Updated: `.chat-bubble-trigger` → `[data-testid="chat-bubble-trigger"]`
   - Locations: resolveSelectors() function and before() hook waitUntil()
   - Rationale: Query stable data-testid instead of CSS class

3. **e2e/desktop/chat-ar20.wdio.test.js** (line 123)
   - Updated: `.chat-bubble-trigger` → `[data-testid="chat-bubble-trigger"]`
   - Location: resolveChatSelectors() function trigger selector
   - Rationale: Consistent data-testid usage across test suites

### Patch Details
- Total files changed: 3
- Total lines changed: ~5 lines added/modified
- No dependencies installed
- No pnpm-lock.yaml changes
- No src-tauri changes
- No guard bypass

## Expected Outcome
- Chat bubble trigger element NOW has stable test anchor (data-testid)
- E2E tests NOW query data-testid instead of CSS class
- Selector should be found in DOM during test execution
- Chat interaction tests should proceed past trigger detection

## Next: Run Diagnostic E2E Attempt
