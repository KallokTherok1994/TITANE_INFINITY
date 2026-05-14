# CognitiveRuntimeTrace Runtime Certification — Gate Report

**Date:** 2026-05-08  
**Scope:** `e2e/critical/thinking-panel-quality.spec.ts` + `src/services/conversationEngine.ts`

---

## G1 — AutoHeal JSONL integrity

```
AUTOHEAL_JSONL_VALID
entries= 1704
last_id= COGNITIVE_TRACE_RUNTIME_CERTIFICATION_2026_05_08
runtime_cert_entries= ['COGNITIVE_TRACE_RUNTIME_CERTIFICATION_2026_05_08']
duplicates= []
SCHEMA_CHECK: missing= NONE
```

**Verdict: PASS**

---

## G2 — Unit / Component gates

Command:
```
pnpm exec vitest run src/services/ai/__tests__/cognitiveRuntimeTrace.test.ts \
  src/services/ai/__tests__/webTruthPolicy.test.ts \
  src/services/ai/__tests__/qualityActionPolicy.test.ts \
  src/features/chat/__tests__/ThinkingPanel.cognitiveTrace.test.tsx
```

Output:
```
✓  core  src/features/chat/__tests__/ThinkingPanel.cognitiveTrace.test.tsx (8 tests) 161ms
✓  core  src/services/ai/__tests__/webTruthPolicy.test.ts (7 tests) 6ms
✓  core  src/services/ai/__tests__/cognitiveRuntimeTrace.test.ts (6 tests) 7ms
✓  core  src/services/ai/__tests__/qualityActionPolicy.test.ts (7 tests) 5ms

Test Files  4 passed (4)
      Tests  28 passed (28)
   Duration  2.22s
```

**Verdict: PASS (28/28)**

---

## G3 — E2E gate

Command:
```
TITANE_E2E_FULL=1 TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_PORT=4000 \
  pnpm exec playwright test e2e/critical/thinking-panel-quality.spec.ts \
  --project=chromium --reporter=line
```

Output:
```
Running 5 tests using 1 worker
  5 passed (10.6s)
```

Tests proven:
- `T-QS-01` — ThinkingPanel displays quality score after message
- `T-QS-02` — data-runtime-quality contains valid percentage (0–100%)
- `T-QS-03` — summary text shows "Réponse X%" or "Effort X%", not "Qualité X%"
- `COGNITIVE_TRACE_V2_VISIBLE_IN_THINKING_PANEL` — verdict, web policy, quality action visible in Expert mode; no raw CoT strings
- `T-QS-SMOKE-01` — ThinkingPanel component smoke (sans Tauri)

**Verdict: PASS (5/5)**

---

## G4 — Recurrence guard

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1704
```

**Verdict: PASS**

---

## G5 — Instruction layers

```
SUMMARY: PASS=51 FAIL=0
```

**Verdict: PASS**

---

## Composite verdict: PASS
