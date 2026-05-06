# TITANE Test Registry

Lock: C3
Date: 2026-05-06

| id | name | lock | surface | files | status | proof_pack | validators | desktop_e2e_coverage | risk |
|---|---|---|---|---|---|---|---|---|---|
| TREG-001 | Instruction governance gate | global | scripts | scripts/verify_instructions.sh | ACTIVE | lock proof packs | PASS=51 baseline | n/a | low |
| TREG-002 | AutoHeal recurrence gate | global | scripts | scripts/autoheal/detect_recurrence.sh | ACTIVE | lock proof packs | entries monotonic | n/a | low |
| TREG-003 | Eval scaffold gate | B-phase | scripts/evals | scripts/verify/verify_evals_scaffold.sh | ACTIVE | B1/B1I | PASS=42 baseline | indirect | medium |
| TREG-004 | Advanced intelligence registry gate | B1.5 | scripts/docs | scripts/verify/verify_advanced_intelligence_registry.sh | ACTIVE | B1.5 | existence + consistency checks | indirect | low |
| TREG-005 | Desktop advanced intelligence harness gate | T0 | scripts/docs | scripts/verify/verify_desktop_advanced_intelligence_tests.sh | ACTIVE | T0 | PASS=8 baseline | AI-DESKTOP-01..20 | low |
| TREG-006 | Intelligence Observability Contract | B2 | src/services/observability | src/services/observability/__tests__/IntelligenceObservabilityContract.test.ts | ACTIVE | B2 | vitest PASS=26 | AI-DESKTOP-03 | low |
| TREG-007 | Provider Routing Contract | C0 | src/services/routing | src/services/routing/__tests__/ProviderRoutingContract.test.ts | ACTIVE | C0 | vitest PASS=22 | AI-DESKTOP-04/05 | medium |
| TREG-008 | MemoryGraph v2 Shadow Contract | C1 | src/services/memory/v2 | src/services/memory/v2/__tests__/MemoryGraphV2ShadowContract.test.ts | ACTIVE | C1 | vitest PASS=47 | AI-DESKTOP-06/07 | medium |
| TREG-009 | Knowledge Governance Contract | C2 | src/services/knowledge_governance | src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts | ACTIVE | C2 | vitest PASS=77 (41 base + 36 C2-UNIT-01..08) | AI-DESKTOP-08 | medium |
| TREG-010 | Research Truth Engine Contract | C3 | src/services/research_truth | src/services/research_truth/__tests__/ResearchTruthContract.test.ts | ACTIVE | C3 | vitest PASS=77 (31 base + 46 C3-UNIT-01..10 sidecar) | AI-DESKTOP-09; AI-DESKTOP-10 | medium |

