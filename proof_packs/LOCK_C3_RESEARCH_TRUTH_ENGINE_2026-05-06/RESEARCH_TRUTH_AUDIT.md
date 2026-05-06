# Research Truth Audit — LOCK C3

**Lock:** C3  
**Date:** 2026-05-06  

## Audit Scope

Full v11 normalization of the Research Truth Engine contract, starting from a C3_PARTIAL_COMMITTED base (31 tests, no state machine, no source/claim schemas, no policy helpers).

---

## Contract Completeness Audit

| Component | Expected (v11) | Present Before | Present After |
|-----------|---------------|----------------|---------------|
| `ResearchAvailabilityStateSchema` (7 states) | Yes | No | YES |
| `ResearchFreshnessClassSchema` | Yes | No | YES |
| `ResearchSourceStatusSchema` | Yes | No | YES |
| `ResearchClaimStatusSchema` | Yes | No | YES |
| `ResearchSourceTypeSchema` | Yes | No | YES |
| `ResearchSourceSchema` (full provenance) | Yes | No | YES |
| `ResearchClaimSchema` (full claim) | Yes | No | YES |
| `ResearchCitationSchema` | Yes | No | YES |
| `ResearchTruthResultSchema` | Yes | No | YES |
| `requiresResearchForClaim()` | Yes | No | YES |
| `canPresentAsFact()` | Yes | No | YES |
| `isSourceVerifiable()` | Yes | No | YES |
| `isCurrentClaim()` | Yes | No | YES |
| `isResearchUnavailable()` | Yes | No | YES |
| `hasContradictions()` | Yes | No | YES |
| `buildCitationSummary()` | Yes | No | YES |
| `validateResearchUnavailableHonesty()` | Yes | No | YES |
| `mapC2RequiresWebValidationToResearchState()` | Yes | No | YES |
| `RESEARCH_UNAVAILABLE_IS_TERMINAL` | Yes | No | YES |
| C3-UNIT-01..10 (test coverage) | Yes | No | YES (46 new tests) |

## Policy Honesty Audit

| Policy | Enforcement Function | Test | Status |
|--------|---------------------|------|--------|
| NO_SOURCE_NO_CURRENT_FACT | `canPresentAsFact()` | C3-UNIT-02,03,04 | PASS |
| RESEARCH_UNAVAILABLE_MUST_BE_HONEST | `validateResearchUnavailableHonesty()` | C3-UNIT-01,08,10 | PASS |
| TO_VERIFY_SOURCE_POLICY | `canPresentAsFact()` | C3-UNIT-03 | PASS |
| CONTRADICTION_BLOCKS_SETTLEMENT | `canPresentAsFact()` | C3-UNIT-06 | PASS |
| C2_BRIDGE_POLICY | `mapC2RequiresWebValidationToResearchState()` | C3-UNIT-09 | PASS |

## Base Contract Preservation Audit

| Base Function | Line Range | Modified? | Impact |
|---------------|-----------|-----------|--------|
| `classifyResearchQuery()` | ~160-210 | NO | None |
| `aggregateTruthEvidence()` | ~215-255 | NO | None |
| `buildResearchTruthVerdict()` | ~260-290 | NO | None |
| `getC3ResearchTruthContract()` | ~292-303 | Extension point added after | None |

All 31 base tests remain PASS after extension (total 77/77).

## State Machine Audit

| State | isResearchUnavailable? | Can be presented to user? |
|-------|------------------------|--------------------------|
| `RESEARCH_NOT_REQUESTED` | No | Only non-research content |
| `RESEARCH_REQUIRED` | No | No — must fetch first |
| `RESEARCH_AVAILABLE` | No | Yes — if claims pass policy |
| `RESEARCH_UNAVAILABLE` | Yes (TERMINAL) | No — show known_limits |
| `RESEARCH_PARTIAL` | No | With caveat markers |
| `RESEARCH_FAILED` | Yes (TERMINAL) | No — show error |
| `RESEARCH_BLOCKED` | No | No — blocked by policy |

## Risk Summary

No high-risk items remain open. All 8 risks in RISK_REGISTER.md are MITIGATED. Two residual items (live network E2E, E0 desktop authority) are tracked and not blocking.
