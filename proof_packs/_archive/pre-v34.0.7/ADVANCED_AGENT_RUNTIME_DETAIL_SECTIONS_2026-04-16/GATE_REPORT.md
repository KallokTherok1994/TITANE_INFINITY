# GATE_REPORT

- Scope: advanced agent runtime detail sections
- Required gates:
  - `corepack pnpm exec vitest run src/services/__tests__/advancedAgentCatalog.test.tsx`
  - `corepack pnpm exec playwright test e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Results:
  - PASS: `corepack pnpm exec vitest run src/services/__tests__/advancedAgentCatalog.test.tsx` -> 12 passed
  - PASS: `corepack pnpm exec playwright test e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts` -> 3 passed
  - PASS: `bash scripts/autoheal/detect_recurrence.sh`
  - PASS: `bash scripts/verify_instructions.sh`
- Status: PASS