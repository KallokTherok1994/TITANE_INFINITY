# 14 TEST RUNS x3 — PROFILE COMPARISON MEASUREMENT MATRIX

**Test Date:** 2026-03-22  
**Objective:** Measure response characteristics by profile (DIRECT vs DEEP vs ARCHITECT)  
**Query:** "Explique en détail les composants d'une IA moderne"  
**Runs:** x3 sequential  
**Status:** READY_FOR_EXECUTION  

---

## Expected Baseline

Based on responsePolicy.ts configuration:

| Profile | Max Tokens | Temp | Clarif Thresh | Inference Agg | Memory Sources | Expected Response |
|---------|-----------|------|---|---|---|---|
| DIRECT | 1024 | 0.5 | 0.85 ↑ | 0.8 ↑ | 2 | 300-400 words, concise |
| DEEP | 8192 | 0.65 | 0.4 ↓ | 0.5 → | 10 | 1500-2500 words, detailed |
| ARCHITECT | 12000 | 0.55 | 0.3 ↓ | 0.4 ↓ | 12 | 2000-3500 words, structured |

---

## Measurement Template

**RUN 1 — DIRECT Profile**
```
Profile Selected: DIRECT
Request: "Explique en détail les composants d'une IA moderne"
Response Length: [___] words
Token Count: [___] tokens (target: ~1000)
Memory Sources: [___] (target: 2)
Latency: [___] ms (target: <20s)
Clarifications: [___] (target: 0)
Response Shape: [concise | minimal | developed ]
```

**RUN 2 — DEEP Profile**
```
Profile Selected: DEEP
Request: "Explique en détail les composants d'une IA moderne"
Response Length: [___] words  
Token Count: [___] tokens (target: ~4000+)
Memory Sources: [___] (target: 5-10)
Latency: [___] ms (target: <60s)
Clarifications: [___] (target: 0)
Response Shape: [ developed | structured | deep ]
```

**RUN 3 — ARCHITECT Profile**
```
Profile Selected: ARCHITECT
Request: "Explique en détail les composants d'une IA moderne"
Response Length: [___] words  
Token Count: [___] tokens (target: ~6000+)
Memory Sources: [___] (target: 10-12)
Latency: [___] ms (target: <90s)
Clarifications: [___] (target: 0)
Response Shape: [ axes/priorities | strategic | audited ]
```

---

## Success Criteria (To Achieve PASS)

Each criterion must be MET:

```
✅ Criterion C1: Profile actually selected
   Evidence: response.metadata.profile_used == "DEEP" (for run 2)

✅ Criterion C2: Token count increases by profile
   Evidence: tokens(DIRECT) < tokens(DEEP) < tokens(ARCHITECT)
   Threshold: 100-200% increase DEEP vs DIRECT

✅ Criterion C3: Response length increases
   Evidence: words(DEEP) > words(DIRECT) * 1.5
   AND words(ARCHITECT) > words(DEEP) * 1.2

✅ Criterion C4: Memory sources injected
   Evidence: memory_sources_injected > 0 for all profiles
   Expected: DEEP >= 5, ARCHITECT >= 10

✅ Criterion C5: Consistency across x3 runs
   Evidence: All three runs show same profile selection
   AND all show length/token progression
   Variance: ±10% acceptable

✅ Criterion C6: Latency acceptable
   Evidence: latency_ms matches timeout budget
   DIRECT: <20s | DEEP: <60s | ARCHITECT: <90s

✅ Criterion C7: No artificial truncation
   Evidence: Response doesn't end with "..."
   AND response is coherent (not cut mid-sentence)
```

---

## Verdict Logic

```
IF all(C1-C7 pass):
  VERDICT = PASS
  STATUS = "Runtime proven"
ELSE:
  VERDICT = QUALIFIED_WITH_FINDINGS
  STATUS = "Configuration correct, gaps identified"
  FINDINGS = [list of unmet criteria]
```

---

## Measurement Execution Plan

**Phase 1: Setup (5 min)**
- Start Tauri app in dev mode
- Verify Ollama running on localhost:11434
- Enable TITANE_E2E_FULL=1

**Phase 2: Run x3 (30 min)**
- RUN 1: Send query with profile override → DIRECT
  - Capture response, metadata, latency
  - Record measurements
  
- RUN 2: Clear conversation, send same query → DEEP  
  - Capture response, metadata, latency
  - Record measurements
  
- RUN 3: Clear conversation, send same query → ARCHITECT
  - Capture response, metadata, latency
  - Record measurements

**Phase 3: Analysis (10 min)**
- Compare word counts: DEEP vs DIRECT
- Compare token counts (if available)
- Calculate ratios
- Verify consistency

**Phase 4: Verdict (5 min)**
- Review all criteria C1-C7
- Classify PASS or FINDINGS
- Document in 15_GATES_REPORT.md

---

## Critical Notes

1. **Profile Override Method**
   - If UI doesn't have profile selector, inject via browser console:
     ```javascript
     window.__TITANE_PROFILE_OVERRIDE__ = 'DEEP'
     ```

2. **Metadata Capture**
   - Check DevTools Network tab for response JSON
   - Look for `metadata.profile_used` and `metadata.tokens_used`

3. **Consistency Requirement**
   - All three runs MUST show same profile selection
   - If profiles don't stick, that's a blocker FINDING

4. **Fallback if Metadata Not Available**
   - Count words manually from response text
   - Compare response lengths as proxy for token count
   - Still valid for MEASUREMENT_READY milestone

---

## Post-Measurement Actions

**If PASS:**
- Update runtimeProven to true for DEEP/ARCHITECT
- Mark profiles as production-ready
- Release with profiles enabled

**If FINDINGS:**
- Analyze which criteria failed
- Propose fixes (configuration vs code)
- Rerun with fixes
- Achieve PASS before release

