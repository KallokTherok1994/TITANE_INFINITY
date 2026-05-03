# 27_DESKTOP_ARTIFACT_INTENT_EVIDENCE
Desktop E2E for this lock:
- Positive scenario: PASS
	- Command: `pnpm -s exec playwright test tests/e2e/chat.spec.ts --grep "should open ModeBuilder for generate-and-open document intent"`
	- Result: `1 passed`
	- Runtime checks: ModeBuilder opened + `Artifact Manifest: artifact-` visible.

- Negative scenario: PASS
	- Command: `pnpm -s exec playwright test tests/e2e/chat.spec.ts --grep "should keep code-intent editor route blocked and not open ModeBuilder"`
	- Result: `1 passed`
	- Runtime checks: `.mode-builder-overlay` absent + runtime badge `OPEN_FROM_CHAT_UNPROVEN` visible.

Classification:
- NEGATIVE_ROUTE_GUARD_PROVEN
