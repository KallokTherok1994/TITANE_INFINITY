# TITANE Desktop E2E Registry

Lock: B1.5
Date: 2026-05-06
Status model: PASS | SKIPPED_WITH_BLOCKER | BLOCKED_DESKTOP_E2E | PLANNED

| id | name | lock_dependency | expected_artifact | status | blocker |
|---|---|---|---|---|---|
| AI-DESKTOP-01 | Launch + boot intelligence services | T0/E0 | DESKTOP_E2E.log | PLANNED | pending E0 harness |
| AI-DESKTOP-02 | Conversation baseline response with trace | B2/E0 | DESKTOP_E2E.log | PLANNED | pending E0 harness |
| AI-DESKTOP-03 | IntelligenceDecisionEnvelope visible/logged | B2/E0 | DESKTOP_E2E.log | PLANNED | pending B2 runtime proof |
| AI-DESKTOP-04 | Provider routing decision logged | C0/E0 | DESKTOP_E2E.log | PLANNED | pending C0 lock |
| AI-DESKTOP-05 | Provider fallback explicit | C0/E0 | DESKTOP_E2E.log | PLANNED | pending C0 lock |
| AI-DESKTOP-06 | Memory write/read baseline | C1/E0 | DESKTOP_E2E.log | PLANNED | pending C1 lock |
| AI-DESKTOP-07 | MemoryGraph shadow write | C1/E0 | DESKTOP_E2E.log | PLANNED | pending C1 lock |
| AI-DESKTOP-08 | Knowledge governance metadata used | C2/E0 | DESKTOP_E2E.log | SCAFFOLDED | blocker=E0 desktop execution authority; scaffold: e2e/advanced-intelligence/; run: pnpm run test:e2e:advanced-intelligence |
| AI-DESKTOP-09 | Research unavailable honesty | C3/E0 | DESKTOP_E2E.log | SCAFFOLDED | blocker=E0 desktop execution authority; scaffold: src/services/research_truth/; contract: isResearchUnavailable + validateResearchUnavailableHonesty; run: pnpm vitest run src/services/research_truth/__tests__/ResearchTruthContract.test.ts |
| AI-DESKTOP-10 | Research sourced state when network available | C3/E0 | DESKTOP_E2E.log | SCAFFOLDED | blocker=E0 desktop execution authority + live network; scaffold: canPresentAsFact + buildCitationSummary; run: pnpm vitest run src/services/research_truth/__tests__/ResearchTruthContract.test.ts |
| AI-DESKTOP-11 | OMEGA first real handler trace | D1/E0 | DESKTOP_E2E.log | SCAFFOLDED | D1 delivered: Memory handler selected (shadow mode), OmegaMemoryBridge declared, D1_SELECTED_HANDLER.md + OMEGA_REAL_HANDLER_UPGRADE.md + 62/62 vitest tests. Full E2E (pipeline trace injection) blocked until D2 activation gate. Scaffold: OmegaMemoryHandlerOutputSchema contract + shadow mode factory. |
| AI-DESKTOP-12 | Singularity measured/UNMEASURED | D2/E0 | DESKTOP_E2E.log | SCAFFOLDED | D2 delivered: OmegaTaskResult selected as measurement target (passive mode), 5 event types + 4 intensity levels, 69/69 vitest tests. Full E2E emission trace blocked until D3 + B2 integration. |
| AI-DESKTOP-13 | Twin consent boundary enforced | D3/E0 | DESKTOP_E2E.log | SCAFFOLDED | D3 delivered: TwinConsentLedgerContract v13 sidecar (84/84 vitest), TwinIdentityObservationEntry schema, policy helpers (confidence-not-consent, canAffectIdentity, canAffectBehavior, canAffectMemory, normalizeAutoDetectedObservation), docs/twin/ docs, validator 25/25 PASS. Full E2E consent lane blocked until D4 + identity observation Rust integration active. Scaffold: e2e/advanced-intelligence/twin-consent.spec.ts needed when UI exists. |
| AI-DESKTOP-14 | Agent effectiveness scorecard accessible | D0/E0 | DESKTOP_E2E.log | SCAFFOLDED | D0 delivered: docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md + contract + validator. Full E2E (interactive scorecard UI) blocked until D0 desktop lane activated. Scaffold: e2e/advanced-intelligence/ spec needed when UI exists. |
| AI-DESKTOP-15 | Injection blocking evidence | C3/E0 | DESKTOP_E2E.log | PLANNED | pending security lane |
| AI-DESKTOP-16 | Self-improvement requires approval | D4/E0 | DESKTOP_E2E.log | PLANNED | pending D4 desktop lane |
| AI-DESKTOP-17 | AutoHeal recurrence after mutation | E0 | DESKTOP_E2E.log | PLANNED | pending E0 execution |
| AI-DESKTOP-18 | Offline local fallback behavior | E0 | DESKTOP_E2E.log | PLANNED | pending E0 execution |
| AI-DESKTOP-19 | Online-first governed behavior | E0 | DESKTOP_E2E.log | PLANNED | pending E0 execution |
| AI-DESKTOP-20 | Full smoke chain | E0 | DESKTOP_E2E.log | PLANNED | pending E0 execution |
