# Runtime Truth Matrix — Profile Verification

## Configuration Truth (Code Inspection = PROVEN)

| Aspect | Status | Evidence |
|--------|--------|----------|
| Response profiles defined | ✅ PROVEN | responsePolicy.ts: 5 profiles (DIRECT, BALANCED, DEEP, ARCHITECT, OMEGA) |
| Token limits configured | ✅ PROVEN | DEEP=8192, ARCHITECT=12000, OMEGA=16000 |
| LTM injection enabled | ✅ PROVEN | BALANCED.memory.injectLTM=true in profile config |
| Profile selection logic | ✅ PROVEN | selectResponseProfile() function exists |
| Modelfile context | ✅ PROVEN | num_ctx=32768, num_predict=8192 |
| Clarification threshold raised | ✅ PROVEN | BALANCED.clarificationThreshold=0.72 (0.72 = less clarification) |
| Inference aggression raised | ✅ PROVEN | BALANCED.inferenceAggression=0.72 |

## Runtime Truth (E2E Execution = UNPROVEN)

| Aspect | Status | Evidence Required |
|--------|--------|-------------------|
| DEEP profile selected in real chat | ❌ UNPROVEN | E2E test: send message with "en détail" signal → expect profile=DEEP |
| Response length increases for DEEP | ❌ UNPROVEN | Measure: words(DEEP) > words(DIRECT) for identical query |
| LTM actually injected into prompt | ❌ UNPROVEN | Capture: prompt assembly logs showing LTM content |
| Latency acceptable per profile | ❌ UNPROVEN | Measure: latency(BALANCED) < 45s, DEEP < 120s |
| Clarification reduced | ❌ UNPROVEN | Test: identical ambiguous query → measure clarification frequency |
| Memory sources counted | ❌ UNPROVEN | Capture: memory_sources_injected metric in response |

## Current Verdict

**Configuration:** PASS ✅ (profiles defined, parameters set, logic wired)  
**Runtime Proof:** UNPROVEN ❌ (no E2E execution proof)  
**Overall:** QUALIFIED_WITH_MEASUREMENT_REQUIRED

---

## Next Steps to Achieve PASS

1. **Add response metadata capture**
   - Modify conversation_generate to return response token count
   - Capture profile actually used in response metadata
   - Record memory sources injected

2. **Run E2E tests (x3 repetitions)**
   - Send test query → DIRECT profile
   - Send identical query → DEEP profile
   - Measure: response length difference, latency, memory usage
   - Run x3 to confirm consistency

3. **Generate proof matrix**
   - Document metrics for all 3 runs
   - Calculate mean/std dev
   - Verify expectations met

4. **Final verdict**
   - If measurements confirm config working: VERDICT = PASS
   - If not: identify what's preventing runtime match

