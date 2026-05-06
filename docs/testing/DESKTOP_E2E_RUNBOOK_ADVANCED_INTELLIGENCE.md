# Desktop E2E Runbook — Advanced Intelligence

Lock: T0
Date: 2026-05-06

## Commands
- bash scripts/verify/verify_desktop_advanced_intelligence_tests.sh
- pnpm test:e2e:desktop:advanced || true
- pnpm playwright test e2e/advanced-intelligence || true

## Execution Notes
- If the desktop runtime is unavailable, classify BLOCKED_DESKTOP_E2E.
- Always persist command output in proof-pack logs.
- Do not mark PASS without executable output.
- Use explicit SKIPPED_WITH_BLOCKER only when linked dependency lock is not active/proven.
