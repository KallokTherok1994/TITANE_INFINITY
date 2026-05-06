# Lock C3 — Research Truth Engine — Ingress Audit

**Classification:** `C3_PARTIAL_COMMITTED`
**Date:** 2026-05-06
**Auditor:** titane-conductor (automated)
**Previous lock:** C2 (commit: 9ef783bd9) — Knowledge Governance CLEAN

---

## 1. Git State at Audit

- Branch: MAIN
- HEAD: 9ef783bd9 (C2 CLEAN)
- Dirty files: `memory/memory_core_state.json`, `memory/stm.json` — runtime state, **unrelated to C3** (do not stage)

---

## 2. C3 Pre-existing Surfaces Found

| Surface | Path | Status |
|---|---|---|
| Research Truth Contract | `src/services/research_truth/ResearchTruthContract.ts` | EXISTS (303 lines) |
| Research Truth Tests | `src/services/research_truth/__tests__/ResearchTruthContract.test.ts` | EXISTS (274 lines, 31 tests PASS) |
| C3 Proof pack dir | `proof_packs/LOCK_C3_RESEARCH_TRUTH_ENGINE_2026-05-06/` | EXISTS (2 files only: VERDICT.md, NEXT_LOCK.md) |
| Research docs | `docs/research/AI_ENGINEERING_SOURCE_MAP.md`, `COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md` | EXISTS (pre-existing source maps) |
| Research Truth Matrix | `docs/cognitive/RESEARCH_TRUTH_MATRIX.md` | EXISTS |
| Web Research Service | `src/services/webResearchService.ts`, `src-tauri/src/commands/web_research.rs` | EXISTS (pre-existing, not C3-owned) |

---

## 3. Gap Analysis vs v11 Spec

| Required | Status |
|---|---|
| ResearchAvailabilityState (state machine: RESEARCH_UNAVAILABLE, etc.) | **MISSING** |
| ResearchFreshnessClass (stable/time_sensitive/current/unknown/expired) | **MISSING** |
| ResearchSourceStatus (VERIFIED/TO_VERIFY/OUTDATED/REJECTED/UNAVAILABLE/UNKNOWN) | **MISSING** |
| ResearchClaimStatus (SUPPORTED/UNSUPPORTED/CONTRADICTED/STALE/HYPOTHESIS/INSUFFICIENT_EVIDENCE) | **MISSING** |
| ResearchSourceType (official/vendor/standard/paper/article/internal/generated/unknown) | **MISSING** |
| ResearchSource (full schema with url, date_accessed, published_at, source_id, relevance) | **MISSING** |
| ResearchClaim (full schema with claim_id, freshness, status, contradicts) | **MISSING** |
| ResearchCitation (url + date_accessed + source_type) | **MISSING** |
| ResearchTruthResult (research_state, sources, claims, citations, unsupported_claims, contradictions, freshness_gate, known_limits) | **MISSING** |
| Policy helpers (7 functions per v11 spec) | **MISSING** |
| C3-UNIT-01..10 tests | **MISSING** |
| docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md | **MISSING** |
| docs/research/RESEARCH_TRUTH_POLICY.md | **MISSING** |
| scripts/verify/verify_research_truth_engine.sh | **MISSING** |
| reports/research_truth_engine_audit.md | **MISSING** |
| Registry updates (5 registries) | **MISSING** |
| AutoHeal entry LOCK_C3_RESEARCH_TRUTH_ENGINE_2026_05_06 | **MISSING** |
| Proof pack complete (7 more files) | **MISSING** |
| AI-DESKTOP-09/10 in Desktop registry | EXISTING (PLANNED — not yet SCAFFOLDED) |

---

## 4. What Exists (Base Contract — DO NOT REWRITE)

The 303-line contract has a solid base:
- `ResearchQueryClassSchema` + `ResearchQueryClassificationSchema`
- `ResearchSourceEvidenceSchema` (evidence aggregation type)
- `TruthAggregationSchema` (multi-source aggregation)
- `ResearchTruthVerdictSchema` (final verdict)
- `C3ResearchTruthContractSchema` (contract instance)
- `classifyResearchQuery()`, `aggregateTruthEvidence()`, `buildResearchTruthVerdict()`, `getC3ResearchTruthContract()`
- Feature flag: `VITE_TITANE_C3_RESEARCH_TRUTH`
- 31 tests covering all base functions — all PASS

**Additive extension strategy:** add v11 schemas and policy helpers BELOW the existing contract. Zero mutation to original 303 lines.

---

## 5. Normalization Action Plan

- [x] Create C3_INGRESS_AUDIT.md (this file)
- [ ] Extend ResearchTruthContract.ts additively (v11 schemas + policy helpers)
- [ ] Add C3-UNIT-01..10 to test file (31→41+ tests)
- [ ] Create docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md
- [ ] Create docs/research/RESEARCH_TRUTH_POLICY.md
- [ ] Create scripts/verify/verify_research_truth_engine.sh
- [ ] Create reports/research_truth_engine_audit.md
- [ ] Update 5 registries (ADVANCED_INTELLIGENCE, TEST, FEATURE_FLAGS, DESKTOP_E2E, PROGRAM_STATUS)
- [ ] Append AutoHeal full-schema entry
- [ ] Create proof pack 9 files (VERDICT updated + 7 new)
- [ ] Run all validators
- [ ] Commit targeted files

---

## 6. Safety Checks

| Check | Result |
|---|---|
| data/knowledge_base/default/ will be modified | NO — immutable |
| memory/memory_core_state.json or stm.json staged | NO — left untouched |
| Runtime behavior changed silently | NO — all new functions are passive/policy only |
| Fake web/search results will be embedded | NO — RESEARCH_UNAVAILABLE state enforces honest absence |
| TO_VERIFY sources will support definitive facts | NO — policy enforced |
| README/CHANGELOG/package.json modified | NO |

---

## 7. Conclusion

**C3 classification: `C3_PARTIAL_COMMITTED`**

Base contract committed and functional (31 tests PASS) but missing all v11-required sidecar deliverables.
Normalization will extend the contract additively and produce a complete proof pack.
