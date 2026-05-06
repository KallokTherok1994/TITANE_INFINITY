# Research Truth Policy — C3 Lock

**Lock:** C3  
**Tier:** T3  
**Enforced by:** `src/services/research_truth/ResearchTruthContract.ts`  
**Contract doc:** `docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md`

---

## Core Policies

### Policy 1 — NO_SOURCE_NO_CURRENT_FACT

> A claim with `freshness ∈ {current, time_sensitive}` can only be presented as fact if at least
> one source has `status=VERIFIED`, `url` is non-null, `date_accessed` is non-null, and
> `source_type ∉ {generated, internal}`.

**Enforcement:** `canPresentAsFact(claim, sources)` returns `false` otherwise.  
**Rationale:** Internal and generated sources cannot independently validate public current facts.
They may help contextualize but cannot serve as primary evidence for public factual claims.

---

### Policy 2 — RESEARCH_UNAVAILABLE_MUST_BE_HONEST

> When network or index retrieval fails, the result must carry `research_state=RESEARCH_UNAVAILABLE`
> (or `RESEARCH_FAILED`) with `freshness_gate=false` and non-empty `known_limits`.

**Enforcement:** `validateResearchUnavailableHonesty(result)` returns `{honest: false}` otherwise.  
**Terminal invariant:** `RESEARCH_UNAVAILABLE_IS_TERMINAL = true` — this state must never be
overridden silently to `RESEARCH_AVAILABLE`.  
**Rationale:** Claiming research is available when retrieval failed is a Category-1 honesty
violation. The contract must surface limits transparently to users.

---

### Policy 3 — TO_VERIFY_SOURCE_POLICY

> A source with `status=TO_VERIFY` cannot be used to support a definitive current fact.
> It may only be presented with explicit uncertainty markers.

**Enforcement:** `canPresentAsFact()` returns `false` when all sources are `TO_VERIFY` for
`current`/`time_sensitive` claims.  
**Rationale:** Unverified sources contribute uncertainty, not confirmation.

---

### Policy 4 — CONTRADICTION_BLOCKS_SETTLEMENT

> A claim with `status=CONTRADICTED` can never be presented as fact, regardless of the number
> of supporting sources.

**Enforcement:** `canPresentAsFact()` returns `false` for `CONTRADICTED` claims.  
**Rationale:** Contradicted claims require explicit human adjudication or additional evidence
before settlement.

---

### Policy 5 — C2_BRIDGE_POLICY

> Knowledge items with `requires_web_validation=true` (C2 knowledge base) must be mapped
> to `RESEARCH_REQUIRED` state before presentation. Medical, legal, and temporal entries
> with `freshness=time_sensitive` are the highest-risk cases.

**Enforcement:** `mapC2RequiresWebValidationToResearchState(true)` returns `RESEARCH_REQUIRED`.  
**Rationale:** C2 governance flags high-risk claims that need external validation; C3 must
consume this signal and withhold settled-fact presentation until research is done.

---

## Risk Levels

| Level       | Meaning                                                                       |
|-------------|-------------------------------------------------------------------------------|
| `low`       | Stable, non-sensitive claim. No special handling required.                    |
| `medium`    | May change over time. Freshness check required.                               |
| `high`      | Time-sensitive or authority-required. VERIFIED source mandatory.              |
| `restricted`| Legal, medical, or security-sensitive. Policy review required before display. |

---

## Source Verifiability Rules

| Condition                                   | Verifiable? |
|---------------------------------------------|-------------|
| `source_type=generated`                     | No          |
| `source_type=internal`                      | No          |
| `status ∈ {REJECTED, UNAVAILABLE, UNKNOWN}` | No          |
| `url=null`                                  | No          |
| `date_accessed=null`                        | No          |
| All others                                  | Yes         |

---

## Citation Requirements

All citations exposed to users must include:
- `url` (or explicit `URL_UNAVAILABLE` marker)
- `date_accessed` (or explicit `DATE_UNAVAILABLE` marker)
- `source_type`

Use `buildCitationSummary(result)` to produce a governed citation summary.

---

## Policy Violation Consequences

| Violation                            | Consequence                                    |
|--------------------------------------|------------------------------------------------|
| Current fact from TO_VERIFY source   | `canPresentAsFact` returns false — no display  |
| RESEARCH_UNAVAILABLE without limits  | `validateResearchUnavailableHonesty` fails     |
| Contradiction ignored                | `canPresentAsFact` returns false               |
| internal/generated source for fact   | `isSourceVerifiable` + `canPresentAsFact` fail |
| C2 high-risk without research        | State remains RESEARCH_REQUIRED                |

---

*Policy version: C3-v11 | Generated: 2026-05-06 | SEALED*
