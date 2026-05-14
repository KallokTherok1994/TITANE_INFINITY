# Risk Register — LOCK C3 Research Truth Engine

**Lock:** C3  
**Date:** 2026-05-06  

## Risk Inventory

| Risk ID | Category | Description | Likelihood | Impact | Mitigation | Status |
|---------|----------|-------------|------------|--------|------------|--------|
| R-C3-01 | Honesty | RESEARCH_UNAVAILABLE silently overridden to RESEARCH_AVAILABLE | Medium | HIGH | `validateResearchUnavailableHonesty()` + `RESEARCH_UNAVAILABLE_IS_TERMINAL=true` | MITIGATED |
| R-C3-02 | Data integrity | TO_VERIFY source presented as verified fact | Medium | HIGH | `canPresentAsFact()` returns false for TO_VERIFY; C3-UNIT-03 | MITIGATED |
| R-C3-03 | Data integrity | Internal/generated source used to verify public current fact | Low | HIGH | `isSourceVerifiable()` excludes internal/generated; C3-UNIT-04 | MITIGATED |
| R-C3-04 | Contradiction | Contradicted claim presented as settled fact | Low | HIGH | `canPresentAsFact()` blocks CONTRADICTED claims; C3-UNIT-06 | MITIGATED |
| R-C3-05 | C2 bridge | C2 high-risk entry bypasses research requirement | Medium | MEDIUM | `mapC2RequiresWebValidationToResearchState()` + C3-UNIT-09 | MITIGATED |
| R-C3-06 | Schema drift | ResearchTruthResult schema changes break downstream consumers | Low | LOW | Zod runtime validation; additive-only extension rule | MITIGATED |
| R-C3-07 | Flag contamination | `VITE_TITANE_C3_RESEARCH_TRUTH` activates unintended surfaces | Low | LOW | Passive contract by default; no runtime network calls | MITIGATED |
| R-C3-08 | Citation honesty | Citation missing URL/date presented without warning | Medium | MEDIUM | `buildCitationSummary()` marks URL_UNAVAILABLE/DATE_UNAVAILABLE explicitly; C3-UNIT-07 | MITIGATED |

## Hard-Stop Invariants

| Invariant | Enforcement |
|-----------|-------------|
| No fake research | Contract is passive — no web/search calls are made |
| TO_VERIFY ≠ fact | `canPresentAsFact()` gate |
| RESEARCH_UNAVAILABLE terminal | `RESEARCH_UNAVAILABLE_IS_TERMINAL=true` + validator |
| No internal source as public fact | `isSourceVerifiable()` + `canPresentAsFact()` |
| Non-empty known_limits when unavailable | `validateResearchUnavailableHonesty()` |
| AI-DESKTOP-09/10 scaffolded | Both lanes now SCAFFOLDED in registry |

## Residual Risks

- **R-C3-RES-01:** Runtime network retrieval behavior (when C3 is activated by T3 flag) is out-of-scope for this lock. Will be addressed at C4.
- **R-C3-RES-02:** AI-DESKTOP-09/10 remain SCAFFOLDED until E0 desktop execution authority is granted and live network is available.
