# STRUCTURAL RUNS SUMMARY — FIX_CHAT_PROVIDER_GOV_P3

## Gate: G4 — Provider Decision Certified
## Run date: 2026-03-20 | Node: v20.20.0 | Champion: 7973fbdec (v28.0.0)

---

## Test Files Run

| File | Tests | Result |
|------|-------|--------|
| src/__tests__/provider-decision-invariants.test.ts | 10 | PASS |
| src/services/api/chat.test.ts | 9 | PASS |
| src/services/conversationEngine.test.ts | 4 | PASS |
| **Total** | **23** | **PASS** |

---

## Run Summary

| Run | Files | Tests | Result |
|-----|-------|-------|--------|
| Run 1 | 3 passed | 23 passed | ✅ PASS |

**Stability: PASS (23/23 — 0 failures)**

---

## Invariant Coverage

[INVARIANT-1] meta.provider_used is authoritative truth
- CASE RP1: `uses meta.provider_used as truth when it differs from legacy provider field` ✅
- CASE RP2: `propagates ollama as actual provider when meta.provider_used=ollama` ✅

[INVARIANT-2] UI badge shows actual provider, not preferred
- CASE RP3: `falls back to tauri-backend when meta is absent (no invention)` ✅
- CASE RP4: `CRITICAL — preferred=ollama but backend used gemini → metadata.provider_used=gemini` ✅

[INVARIANT-3] No provider name invention on fallback
- CASE: `chat.test.ts > ChatService normalizeResponse > falls back provider/latency when backend omits them` ✅

[INVARIANT-4] Preferred override works correctly
- CASE: `provider-decision-invariants.test.ts` — 10/10 invariant cases ✅

---

## Rollback
```bash
git reset --hard $(git log --oneline | grep "LOCK1" | tail -1 | awk '{print $1}')~1
# Then run: bash scripts/gates/g4-provider-decision-certified.sh
```

## VERDICT: GATE G4 — PASS
