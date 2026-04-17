# ADVANCED AGENT LIVE RUNTIME SURFACES — 2026-04-16

## Goal

Brancher des signaux runtime réels sur les surfaces canoniques orchestrator, explainability et security active pour publier des métriques, traces d inference et événements sécurité visibles et testables.

## Scope

- src/services/agents/advancedAgentCatalog.ts
- src/services/orchestrator/index.ts
- src/services/explainability/index.ts
- src/services/security_active/index.ts
- src/services/orchestrator/OrchestratorDashboard.tsx
- src/services/explainability/ExplainabilityDashboard.tsx
- src/services/security_active/SecurityDashboard.tsx
- src/services/__tests__/advancedAgentCatalog.test.tsx
- e2e/agents/orchestrator-dashboard.e2e.ts
- e2e/agents/explainability-dashboard.e2e.ts
- e2e/agents/security-dashboard.e2e.ts
- UI_SURFACE_MAP.md
- docs/CARTOGRAPHY_COMPLETE.md
- ARCHITECTURE.md
- registry/ui-events.jsonl
- scripts/autoheal/autoheal_rules.jsonl

## Change

Le contrat de statut des agents avancés expose maintenant des sections live testables. L orchestrateur publie charge et snapshots providers depuis la télémétrie et la gouvernance locales, l explainability publie la chaîne requested -> used -> shown et un rapport d inference depuis la conversation persistée active, et la sécurité active publie des événements de détection et de confinement à partir des alertes, logs UI et politiques runtime déjà disponibles.

## Validation

- PASS: runTests src/services/__tests__/advancedAgentCatalog.test.tsx
- PASS: corepack pnpm exec playwright test e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/explainability-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts
- PASS: bash scripts/autoheal/detect_recurrence.sh
- PASS: bash scripts/verify_instructions.sh

## Verdict

PASS