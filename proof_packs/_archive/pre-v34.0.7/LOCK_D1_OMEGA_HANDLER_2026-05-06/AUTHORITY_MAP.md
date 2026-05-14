# D1 — OMEGA Real Handler Upgrade — AUTHORITY MAP

**Date:** 2026-05-06  
**Lock:** D1 v13 normalization  

## Source of Truth

| Surface | Authority File | Authority Claim |
|---------|---------------|-----------------|
| D1 contract | `src/services/omega_handler/OmegaHandlerUpgradeContract.ts` | D1GapSchema, D1_INVARIANTS, OmegaHandlerModeSchema, D1SelectedHandlerAdapterSchema |
| Memory handler | `src-tauri/src/omega/memory_bridge.rs` | OmegaMemoryBridge::enrich_context (real surface) |
| OMEGA executor | `src-tauri/src/omega/executor.rs` | DefaultTaskHandler for all 8 TaskTypes (mock) |
| Feature flag registry | `docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md` | FF-D1 declared (VITE_TITANE_D1_OMEGA_REAL_HANDLER=false) |
| AI registry | `docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md` | REG-AI-D1 row |
| Test registry | `docs/registry/TITANE_TEST_REGISTRY.md` | TREG-012 row |
| Desktop E2E registry | `docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md` | AI-DESKTOP-11 SCAFFOLDED |
| Program status | `docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md` | D1 row CLEAN |
| AutoHeal | `scripts/autoheal/autoheal_rules.jsonl` | LOCK_D1_OMEGA_REAL_HANDLER_2026_05_06 |
| Validator | `scripts/verify/verify_omega_real_handler.sh` | 31 checks PASS |

## Governance Layer

- **Kernel:** `.github/copilot-instructions.md` — Rule 1 (minimal patch), Rule 10 (AutoHeal), Rule 15 (mapping), Rule 16 (tests)
- **Lock:** D1 — T3 (CRITICAL — feature flag required)
- **Mode:** DURABLE
- **Ring:** Ring 3 (TypeScript governance layer) — no Ring 0/1 modifications

## Invariant Compliance

| Rule | Status |
|------|--------|
| Rule 1 — Minimal patch | PASS — additive sidecar only, no refactor |
| Rule 10 — AutoHeal capture | PASS — LOCK_D1_OMEGA_REAL_HANDLER_2026_05_06 appended |
| Rule 15 — Mapping updates | PASS — AI registry, test registry, desktop registry, program status |
| Rule 16 — Test creation | PASS — D1-UNIT-01..10 + supplementary, 62/62 PASS |
