# ADVANCED_AGENT_RUNTIME_DETAIL_SECTIONS_2026-04-16

- Date: 2026-04-16
- Scope: explainability, orchestrator and security advanced-agent dashboards runtime detail sections
- Symptom: the three governed dashboards exposed PARTIAL readiness but still stopped at summary/proof/blocker text without publishing the runtime details already available in the repo
- Root cause: the earlier readiness alignment landed before the dashboards rendered persisted inference traces, provider health snapshots, and security detection/containment events on the visible runtime surface
- Fix: extend the advanced-agent status contract with runtime detail sections, correct explainability providerMeta normalization, render those sections in the three dashboards, and tighten unit/E2E proofs around the new selectors
- Proof commands:
  - `corepack pnpm exec vitest run src/services/__tests__/advancedAgentCatalog.test.tsx`
  - `corepack pnpm exec playwright test e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Validation results:
  - PASS: `corepack pnpm exec vitest run src/services/__tests__/advancedAgentCatalog.test.tsx` -> 12 passed
  - PASS: `corepack pnpm exec playwright test e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts` -> 3 passed after restarting stale Vite on 127.0.0.1:5173
  - PASS: `bash scripts/autoheal/detect_recurrence.sh` -> `PASS: G_AH_RECURRENCE_GUARD_PASS`
  - PASS: `bash scripts/verify_instructions.sh` -> `SUMMARY: PASS=32 FAIL=0`
- Rollback: `git restore -- src/services/agents/advancedAgentCatalog.ts src/services/explainability/index.ts src/services/explainability/ExplainabilityDashboard.tsx src/services/orchestrator/index.ts src/services/orchestrator/OrchestratorDashboard.tsx src/services/security_active/index.ts src/services/security_active/SecurityDashboard.tsx src/services/__tests__/advancedAgentCatalog.test.tsx e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl reports/ADVANCED_AGENT_RUNTIME_DETAIL_SECTIONS_2026-04-16.md proof_packs/ADVANCED_AGENT_RUNTIME_DETAIL_SECTIONS_2026-04-16/GATE_REPORT.md proof_packs/ADVANCED_AGENT_RUNTIME_DETAIL_SECTIONS_2026-04-16/VERDICT.md proof_packs/ADVANCED_AGENT_RUNTIME_DETAIL_SECTIONS_2026-04-16/ROLLBACK.md scripts/autoheal/autoheal_rules.jsonl`
- Verdict: PASS