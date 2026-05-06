# Research Truth Engine Audit Report

**Lock:** C3  
**Date:** 2026-05-06  
**Mode:** DURABLE  
**Branch:** MAIN  
**Verdict:** PASS  

---

## Executive Summary

Lock C3 (Research Truth Engine) was found in a `C3_PARTIAL_COMMITTED` state: base query classification and evidence aggregation were committed (commit 9ef783bd9), but the v11 policy layer was missing. This report documents the normalization executed on 2026-05-06.

---

## Pre-Normalization State

| Component | State |
|-----------|-------|
| `ResearchTruthContract.ts` | 303 lines, base only (classifyResearchQuery, aggregateTruthEvidence, buildResearchTruthVerdict) |
| Test file | 274 lines, 31 tests PASS |
| State machine (ResearchAvailabilityState) | ABSENT |
| Source/Claim/Citation/Result schemas | ABSENT |
| Policy helpers (requiresResearchForClaim etc.) | ABSENT |
| RESEARCH_UNAVAILABLE honesty enforcement | ABSENT |
| docs/research/ | ABSENT |
| Validator script | ABSENT |
| Registry entries (C3) | ABSENT |
| Desktop lanes AI-DESKTOP-09/10 | PLANNED (not scaffolded) |
| Proof pack | 2 files only (VERDICT.md + NEXT_LOCK.md) |

---

## Post-Normalization State

| Component | State |
|-----------|-------|
| `ResearchTruthContract.ts` | Extended additively: +7 schemas, +9 policy helpers, state machine |
| Test file | +46 tests (C3-UNIT-01..10), 77/77 PASS |
| State machine (7 states) | IMPLEMENTED |
| ResearchSource, ResearchClaim, ResearchCitation, ResearchTruthResult | IMPLEMENTED |
| Policy helpers | IMPLEMENTED (7 functions + 2 validators) |
| RESEARCH_UNAVAILABLE honesty | ENFORCED (validateResearchUnavailableHonesty + TERMINAL flag) |
| docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md | CREATED |
| docs/research/RESEARCH_TRUTH_POLICY.md | CREATED |
| scripts/verify/verify_research_truth_engine.sh | CREATED (21 checks PASS) |
| TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md | Updated: Lock→C3, REG-AI-C3 |
| TITANE_TEST_REGISTRY.md | Updated: TREG-010 |
| TITANE_RUNTIME_FEATURE_FLAGS.md | Updated: FF-C3 |
| TITANE_DESKTOP_E2E_REGISTRY.md | AI-DESKTOP-09/10 SCAFFOLDED |
| TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md | C3 row filled |
| AutoHeal entry | APPENDED (entries=1666) |
| Proof pack | 9 files |

---

## Gate Results

| Gate | Result |
|------|--------|
| vitest 77/77 | PASS |
| verify_research_truth_engine 21/21 | PASS |
| verify_instructions 51/51 | PASS |
| detect_recurrence entries=1666 | PASS |
| verify_advanced_intelligence_registry 16/16 | PASS |

---

## Key Policies Enforced

1. **NO_SOURCE_NO_CURRENT_FACT** — `canPresentAsFact()` blocks non-VERIFIED, internal, and generated sources for current/time_sensitive claims
2. **RESEARCH_UNAVAILABLE_MUST_BE_HONEST** — terminal state, cannot be silently promoted
3. **TO_VERIFY_SOURCE_POLICY** — unverified sources require uncertainty markers
4. **CONTRADICTION_BLOCKS_SETTLEMENT** — contradicted claims blocked from fact presentation
5. **C2_BRIDGE_POLICY** — C2 `requires_web_validation=true` maps to `RESEARCH_REQUIRED`

---

## Anomalies Detected and Fixed

| Anomaly | Fix |
|---------|-----|
| `canPresentAsFact()` initially allowed internal/generated VERIFIED sources for current claims | Added `source_type !== 'generated' && source_type !== 'internal'` guard |
| Duplicate `const NOW` in test file after sidecar addition | Removed duplicate, reused existing constant |

---

## Runtime Safety

- No runtime changes — C3 is T3 flag-gated, `VITE_TITANE_C3_RESEARCH_TRUTH` defaults to `false`
- No Tauri IPC commands added
- No knowledge content modified
- No production Ollama model configuration touched

---

*Report generated: 2026-05-06 | Lock: C3 | SEALED*
