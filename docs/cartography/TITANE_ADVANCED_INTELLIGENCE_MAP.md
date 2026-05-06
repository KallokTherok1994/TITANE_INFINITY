# TITANE Advanced Intelligence Map

Lock: B1.5
Date: 2026-05-06
Type: T0/T1

## Architecture Layers
- Governance kernel and instruction layers: .github/copilot-instructions.md, .github/instructions/*
- Runtime backend cognition: src-tauri/src/ (omega, ai, memory, conversation engine)
- Frontend/service cognition: src/services/*, src/core/*
- Validation/evidence: scripts/verify/*, scripts/autoheal/*, proof_packs/*

## Runtime Subsystems
- OMEGA pipeline: routing, execution, merge, guardrails
- Provider routing: providerDecisionMeta and policy surfaces
- Singularity measured layer: typed events/intensity scaffolds
- Twin consent boundary: identity-sensitive guard ledger

## Memory and Knowledge
- UnifiedMemory baseline (STM/MTM/LTM)
- MemoryGraph v2 shadow lane (comparison, non-replacement)
- Knowledge governance contract + sidecar metadata lane

## Research Truth
- Research contract with explicit unavailable state
- Source-map linkage: S001..S012 via AI_ENGINEERING_SOURCE_MAP

## Agent and Eval Governance
- Agent effectiveness scorecard and validator lanes
- Evals scorecards under evals/scorecards/v1
- AutoHeal recurrence capture via scripts/autoheal/detect_recurrence.sh

## Desktop Advanced Test Mapping (planned lanes)
- AI-DESKTOP-01..AI-DESKTOP-20 tracked in registry (see TITANE_DESKTOP_E2E_REGISTRY.md)

## Release/Docs Surfaces
- Program status: docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
- Registries: docs/registry/TITANE_*
- Proof packs: proof_packs/LOCK_* and TITANE_INTELLIGENCE_SEAL_v1_2026-05-06

## E0 — Advanced Desktop E2E Matrix (2026-05-06, commit 9a8df5507)

### Node Status: PASS_WITH_EXPLICIT_BLOCKERS
- WDIO headless run: 23 assertions PASS, 11.7s, EXIT 0
- Vitest contracts: 21/21 PASS
- Validator `verify_desktop_advanced_intelligence_tests.sh`: PASS=25 FAIL=0
- Desktop lanes: 8 PASS · 12 SKIPPED_WITH_EXPLICIT_BLOCKER · 0 FAIL
- Binary policy: TITANE_ENFORCE_BINARY_FRESHNESS=0 used for E0 run

### PASS Lanes
- AI-DESKTOP-01 (launch), 02 (chat DOM), 06 (memory nav), 14 (scorecard), 16 (D4 contract), 17A (autoheal), 17B (detect_recurrence), 18 (offline UI), 20A (smoke)

### Blocker Lanes (12)
- Live conversation/Ollama: 03, 04, 05, 19, 20B → next: F1
- Pipeline activation: 11 (D1 shadow), 12 (D2 passive) → next: D2/D3 activation
- UI surface missing: 13 (twin-consent-panel) → next: D5 UI build
- Feature flag: 07 (hybrid memory) → next: T4 activation gate
- Research network: 10 → next: F1
- Security: 15 (C3 security lane) → next: C3 security lock

### Cartography Delta vs B1.5
- Added: e2e/advanced-intelligence/ WDIO spec (headless harness)
- Added: tests/contract/e2e-desktop/ Vitest contracts (21 tests)
- Added: scripts/verify/verify_desktop_advanced_intelligence_tests.sh
- Added: e2e/advanced-intelligence/reports/e2e_matrix_run.json
- Added: reports/desktop_advanced_intelligence_e2e_matrix.md
- Added: proof_packs/LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06/ (11 files)
- Seal state: NOT_SEALED

## F0 — Registry / README / CHANGELOG Sync (2026-05-06)

### Node Status: IN_PROGRESS
- All documentation surfaces (README, CHANGELOG, RELEASE_SURFACE) updated to reflect proven C0–E0 lock chain
- 3 registries updated: TITANE_ADVANCED_INTELLIGENCE_REGISTRY, TITANE_DESKTOP_E2E_REGISTRY, TITANE_PROOF_PACK_REGISTRY
- D5 status corrected from CLEAN to NOT_STARTED
- D5 readiness assessment created: docs/roadmap/D5_READINESS_ASSESSMENT.md
- 2 validators created: verify_readme_changelog_registry_sync.sh, verify_intelligence_seal_prereqs.sh
- F0 proof pack: proof_packs/LOCK_F0_REGISTRY_README_CHANGELOG_SYNC_2026-05-06/

### Desktop Advanced Test Mapping (post-E0 truth)
- AI-DESKTOP-01..AI-DESKTOP-20 tracked in registry (see TITANE_DESKTOP_E2E_REGISTRY.md)
- 8 PASS / 12 SKIPPED_WITH_EXPLICIT_BLOCKER / 0 FAIL (E0 run, 2026-05-06)

## Release/Docs Surfaces
- Program status: docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
- Registries: docs/registry/TITANE_*
- Proof packs: proof_packs/LOCK_* 
- Seal state: NOT_SEALED (D5 requires T4 approval)
