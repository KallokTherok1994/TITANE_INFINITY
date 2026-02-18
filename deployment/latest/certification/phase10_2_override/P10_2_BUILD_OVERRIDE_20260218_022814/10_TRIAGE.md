# P10.2 Triage

## Stop-the-line Reason
- `runTests` tool executed Playwright E2E suite by default (52 failures) because it did not accept the targeted unit/integration files.
- The run attempted to reach http://localhost:5173 (connection refused). This is not a permitted dev server run in this phase.

## Impact
- Unit x3 and Integration x3 could not be executed with the required tool.
- E2E x3 and scans were not executed.

## Evidence
- `runTests` output: localhost:5173 connection refused across Playwright E2E specs.
- `11_UNIT_RUN_ATTEMPT_1.txt`: runTests could not detect tests in unit file list.

## Required Decision
- Approve an explicit exception to run unit/integration via `pnpm run test` and `pnpm run test:coverage:integration`, OR
- Provide a supported test runner mapping for `runTests` to target Vitest unit/integration suites.
