# Desktop Lane Linkage — LOCK C3 Research Truth Engine

**Lock:** C3  
**Date:** 2026-05-06  

## Desktop E2E Lanes

| Lane | Name | Status | Scaffold | Blocker |
|------|------|--------|----------|---------|
| AI-DESKTOP-09 | Research unavailable honesty | SCAFFOLDED | `isResearchUnavailable()` + `validateResearchUnavailableHonesty()` | E0 desktop execution authority |
| AI-DESKTOP-10 | Research sourced state when network available | SCAFFOLDED | `canPresentAsFact()` + `buildCitationSummary()` | E0 + live network |

## Scaffold Evidence

### AI-DESKTOP-09 — Research unavailable state is honest

**Contract proof functions:**
- `isResearchUnavailable(result)` — returns `true` for `RESEARCH_UNAVAILABLE` or `RESEARCH_FAILED`
- `validateResearchUnavailableHonesty(result)` — validates honest RESEARCH_UNAVAILABLE result
- `RESEARCH_UNAVAILABLE_IS_TERMINAL = true`

**Test coverage:** C3-UNIT-01 (6 tests), C3-UNIT-08 (5 tests), C3-UNIT-10 (4 tests)

**Current run command (unit):**
```bash
pnpm vitest run src/services/research_truth/__tests__/ResearchTruthContract.test.ts
```

**Future E2E path (when E0 + network available):**
```bash
# Will require:
# - E0 desktop harness running
# - Research engine activated via VITE_TITANE_C3_RESEARCH_TRUTH=true
# - Network unavailable simulation (mock or offline mode)
# Expected behavior: UI shows "Research unavailable" with known_limits, not fake results
```

---

### AI-DESKTOP-10 — Research sourced state when network available

**Contract proof functions:**
- `canPresentAsFact(claim, sources)` — only VERIFIED + non-internal source for current claims
- `buildCitationSummary(result)` — includes URL + date_accessed + source_type
- `requiresResearchForClaim(claim)` — time_sensitive/current claim requires research

**Test coverage:** C3-UNIT-02 (5 tests), C3-UNIT-03 (4 tests), C3-UNIT-04 (5 tests), C3-UNIT-07 (4 tests)

**Future E2E path (when E0 + network available):**
```bash
# Will require:
# - E0 desktop harness running
# - Live network + research engine active
# - At least one VERIFIED source retrieved
# Expected behavior: Citations show URL, date_accessed, source_type explicitly
```

---

## State Machine Summary

```
RESEARCH_NOT_REQUESTED → RESEARCH_REQUIRED → RESEARCH_AVAILABLE
                                           → RESEARCH_UNAVAILABLE (TERMINAL)
                                           → RESEARCH_PARTIAL
                                           → RESEARCH_FAILED (TERMINAL)
                                           → RESEARCH_BLOCKED
```

The desktop lanes verify the terminal branches (AI-DESKTOP-09) and the happy-path (AI-DESKTOP-10).
