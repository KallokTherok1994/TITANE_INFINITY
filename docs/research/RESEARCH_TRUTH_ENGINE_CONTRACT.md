# Research Truth Engine — Contract Reference

**Lock:** C3  
**Tier:** T3 (flag-gated: `VITE_TITANE_C3_RESEARCH_TRUTH`)  
**File:** `src/services/research_truth/ResearchTruthContract.ts`  
**Policy:** `docs/research/RESEARCH_TRUTH_POLICY.md`  
**Tests:** `src/services/research_truth/__tests__/ResearchTruthContract.test.ts` (77 tests)

---

## Overview

The Research Truth Engine provides a governed contract for:
1. Classifying research queries by type and temporal sensitivity
2. Aggregating evidence from multiple sources with conflict detection
3. Producing truth verdicts with provenance trails
4. Enforcing honesty policies — including **mandatory RESEARCH_UNAVAILABLE** when retrieval fails

This is a **passive contract** at T3. No runtime activation without the feature flag.

---

## State Machine

### ResearchAvailabilityState

| State                   | Meaning                                                      |
|-------------------------|--------------------------------------------------------------|
| `RESEARCH_NOT_REQUESTED`| No research needed for this query                            |
| `RESEARCH_REQUIRED`     | Claim requires research but it has not started               |
| `RESEARCH_AVAILABLE`    | Research completed and sources are available                 |
| `RESEARCH_UNAVAILABLE`  | Research attempted but failed (network/index unavailable)    |
| `RESEARCH_PARTIAL`      | Some sources found but confidence is below threshold         |
| `RESEARCH_FAILED`       | Hard retrieval failure (timeout, error)                      |
| `RESEARCH_BLOCKED`      | Research blocked by policy (e.g., restricted content)        |

**Invariant:** `RESEARCH_UNAVAILABLE` is terminal — it must never silently become `RESEARCH_AVAILABLE`.

---

## Schemas

### ResearchSource

```typescript
{
  source_id: string
  title: string
  url: string | null          // Required for VERIFIED non-internal sources
  source_type: 'official' | 'vendor' | 'standard' | 'paper' | 'article' | 'internal' | 'generated' | 'unknown'
  date_accessed: string | null // ISO datetime — required for VERIFIED
  published_at: string | null
  last_updated: string | null
  status: 'VERIFIED' | 'TO_VERIFY' | 'OUTDATED' | 'REJECTED' | 'UNAVAILABLE' | 'UNKNOWN'
  relevance: number            // 0..1
  confidence: number           // 0..1
  notes: string | null
}
```

### ResearchClaim

```typescript
{
  claim_id: string
  text: string
  claim_type: 'fact' | 'hypothesis' | 'opinion' | 'contested' | 'internal'
  freshness: 'stable' | 'time_sensitive' | 'current' | 'unknown' | 'expired'
  status: 'SUPPORTED' | 'UNSUPPORTED' | 'CONTRADICTED' | 'STALE' | 'HYPOTHESIS' | 'INSUFFICIENT_EVIDENCE'
  source_ids: string[]
  requires_source: boolean
  risk_level: 'low' | 'medium' | 'high' | 'restricted'
  contradicts: string[]        // claim_ids that contradict this claim
  notes: string | null
}
```

### ResearchCitation

```typescript
{
  citation_id: string
  source_id: string
  claim_id: string
  url: string | null
  date_accessed: string | null  // ISO datetime
  source_type: ResearchSourceType
  summary: string
}
```

### ResearchTruthResult

```typescript
{
  request_id: string
  query: string
  research_state: ResearchAvailabilityState
  sources: ResearchSource[]
  claims: ResearchClaim[]
  citations: ResearchCitation[]
  unsupported_claims: string[]  // claim_ids
  contradictions: string[]      // claim_ids with CONTRADICTED status
  freshness_gate: boolean       // true if all current/time_sensitive claims have VERIFIED sources
  known_limits: string[]        // non-empty when source proof is incomplete
  generated_at: string          // ISO datetime
}
```

---

## Policy Helpers

| Function                                | Purpose                                                        |
|-----------------------------------------|----------------------------------------------------------------|
| `requiresResearchForClaim(claim)`       | Returns true if freshness ∈ {current, time_sensitive}          |
| `canPresentAsFact(claim, sources)`      | True only if VERIFIED source, SUPPORTED, no contradiction      |
| `isSourceVerifiable(source)`            | True if has url + date_accessed and is not internal/generated  |
| `isCurrentClaim(claim)`                 | True if freshness ∈ {current, time_sensitive}                  |
| `isResearchUnavailable(result)`         | True if state ∈ {RESEARCH_UNAVAILABLE, RESEARCH_FAILED}        |
| `hasContradictions(result)`             | True if contradictions list is non-empty                       |
| `buildCitationSummary(result)`          | Formatted citation text with URL + date + type                 |
| `validateResearchUnavailableHonesty(r)` | Validates honest RESEARCH_UNAVAILABLE result                   |
| `mapC2RequiresWebValidationToResearchState(flag)` | Maps C2 requires_web_validation to ResearchAvailabilityState |

---

## Base Contract Functions (v1 — pre-v11)

| Function                       | Purpose                                                      |
|--------------------------------|--------------------------------------------------------------|
| `classifyResearchQuery()`      | Heuristic classifier by query text                           |
| `aggregateTruthEvidence()`     | Computes support/oppose/neutral counts, detects conflict     |
| `buildResearchTruthVerdict()`  | T3 flag-gated verdict builder (verified/disputed/etc.)       |
| `getC3ResearchTruthContract()` | Returns contract instance with current config                |

---

## Invariants

- `RESEARCH_UNAVAILABLE_IS_TERMINAL = true`
- A `TO_VERIFY` source cannot support a definitive current fact
- An `internal` or `generated` source cannot verify a public current fact alone
- A `CONTRADICTED` claim can never be presented as fact
- `freshness_gate` must be `false` when `research_state = RESEARCH_UNAVAILABLE`
- `known_limits` must be non-empty when research is unavailable

---

## C2 Bridge

Use `mapC2RequiresWebValidationToResearchState(bool)` to map C2 knowledge items with
`requires_web_validation=true` to `RESEARCH_REQUIRED`. High-risk entries (medical, legal,
temporal) with `requires_web_validation=true` and `freshness=time_sensitive` must always
receive research before being presented to users.

---

## Desktop E2E Linkage

- **AI-DESKTOP-09** — Research unavailable state is honest (SCAFFOLDED)
- **AI-DESKTOP-10** — Research sourced state when network available (SCAFFOLDED)

---

*Generated: 2026-05-06 | Lock: C3 | Tier: T3 | SEALED*
