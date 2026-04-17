# ADVANCED AGENT BOUNDED REFRESH AND SECURITY AUDIT — 2026-04-16

## Goal

Ajouter une série temporelle locale bornée et un refresh contrôlé sur l orchestrateur, puis un journal sécurité avec acquittement persistant, historique et corrélation croisée sur la surface canonique.

## Scope

- src/services/agents/advancedAgentCatalog.ts
- src/services/orchestrator/index.ts
- src/services/security_active/index.ts
- src/services/orchestrator/OrchestratorDashboard.tsx
- src/services/security_active/SecurityDashboard.tsx
- src/services/explainability/index.ts
- src/services/explainability/ExplainabilityDashboard.tsx
- src/components/AgentDashboardsPanel.tsx
- src/components/ExplainabilityDashboard.tsx
- src/services/__tests__/advancedAgentCatalog.test.tsx
- e2e/agents/explainability-dashboard.e2e.ts
- e2e/agents/orchestrator-dashboard.e2e.ts
- e2e/agents/security-dashboard.e2e.ts
- UI_SURFACE_MAP.md
- docs/CARTOGRAPHY_COMPLETE.md
- ARCHITECTURE.md
- registry/ui-events.jsonl
- scripts/autoheal/autoheal_rules.jsonl

## Change

L orchestrateur maintient maintenant une série temporelle locale bornée de snapshots charge/providers et l expose via un refresh 15s sur la surface canonique. La sécurité active maintient désormais un journal local borné d événements avec acquittement persistant, historique et corrélation croisée, rafraîchi toutes les 10 secondes. La surface Explainability a aussi été réalignée sur un export nommé explicite pour supprimer une dérive runtime Vite qui empêchait le montage du panneau agents.

## Validation

- PASS: runTests src/services/__tests__/advancedAgentCatalog.test.tsx
- PASS: corepack pnpm exec playwright test e2e/agents/explainability-dashboard.e2e.ts e2e/agents/orchestrator-dashboard.e2e.ts e2e/agents/security-dashboard.e2e.ts
- PASS: bash scripts/autoheal/detect_recurrence.sh
- PASS: bash scripts/verify_instructions.sh

## Verdict

PASS