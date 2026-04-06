# 11 Autofix Log

## Fix ID

- `AUTOFIX-UI-FULL-CHAT-PERSISTENCE-2026-03-06`

## Symptom

- Full desktop suite failed on assertion:
	- `chat state should remain visible after page switch`

## Root cause

- Assertion used a brittle monotonic message-count check (`userAfter >= userBefore`), vulnerable to async rendering/rehydration timing after route switches.

## Minimal patch

- File: `e2e/desktop/ui-ultra-full.e2e.js`
- Change:
	- Capture last user message text before navigation.
	- After returning to `/titane`, wait for chat input visibility and restored prior user context.
	- Keep explicit visibility assertion on chat state.

## Verification

- `full_postfix3` in `08_TESTS_X3.log`: `3/3` exit `0`
- `smoke_postfix3` in `08_TESTS_X3.log`: `3/3` exit `0`

