# GATE_REPORT

- Scope: security governed export metadata
- Required gates:
  - `runTests src/services/__tests__/advancedAgentCatalog.test.tsx`
  - `pnpm exec playwright test e2e/agents/security-dashboard.e2e.ts --project=chromium --reporter=line`
  - `bash scripts/verify/verify-advanced-agents.sh`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Results:
  - `runTests src/services/__tests__/advancedAgentCatalog.test.tsx` => PASS (36 passed, 0 failed)
  - `pnpm exec playwright test e2e/agents/security-dashboard.e2e.ts --project=chromium --reporter=line` => PASS (1 passed)
  - `bash scripts/verify/verify-advanced-agents.sh` => PASS (`FAIL=0`)
  - `bash scripts/autoheal/detect_recurrence.sh` => PASS (`entries=1120`)
  - `bash scripts/verify_instructions.sh` => PASS (`SUMMARY: PASS=32 FAIL=0`)
- Status: PASS