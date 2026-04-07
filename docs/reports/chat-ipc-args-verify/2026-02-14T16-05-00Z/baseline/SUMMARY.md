# GATE-1 SUMMARY — pnpm test

Date: 2026-02-14
Status: FAIL

## Execution

- Command: pnpm test
- Result: 2 failed | 3185 passed | 68 skipped (3255)

## Failures (Top)

1) src/services/conversationEngine.test.ts
	- Test: wraps conversation_generate payload under args
	- Issue: expected conversationId "c3" but received "c1" (mock sequence)

2) tests/contract/tauri-ipc-contract.test.ts
	- Test: should require args wrapper for conversation_generate
	- Issue: error message mismatch (expected /missing required field/i, got invalid field args)

## Log

- baseline/pnpm_test.log
