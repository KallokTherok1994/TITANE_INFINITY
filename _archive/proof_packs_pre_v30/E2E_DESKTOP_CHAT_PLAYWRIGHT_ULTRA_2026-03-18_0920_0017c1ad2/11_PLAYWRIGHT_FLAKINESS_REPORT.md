# PLAYWRIGHT_FLAKINESS_REPORT

| test | project | first-run result | retry result | flaky? | likely cause | next action |
|---|---|---|---|---|---|---|
| tests/e2e/chat.spec.ts :: should send and receive message | chromium-tests-e2e | FAIL (timeout locator input[type="text"]) | FAIL x3 | NO (deterministic fail) | stale selector contract | migrate to role/testid selectors |
| tests/e2e/chat.spec.ts :: should handle new conversation | chromium-tests-e2e | FAIL (.conversation-list count 0) | FAIL x3 | NO | outdated DOM expectation | align with current conversation UI structure |
| tests/e2e/chat.spec.ts :: keyboard shortcuts | chromium-tests-e2e | FAIL (#search-input not found) | FAIL x3 | NO | feature/selector drift | re-baseline shortcut target and selector |
