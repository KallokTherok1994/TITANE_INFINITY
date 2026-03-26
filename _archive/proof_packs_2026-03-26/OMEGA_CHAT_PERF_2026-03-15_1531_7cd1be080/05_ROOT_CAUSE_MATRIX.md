# ROOT CAUSE MATRIX

| Hypothesis | Status | Proof | Layer | Criticité | Patch | Risque si ignoré | Verdict |
|------------|--------|-------|-------|-----------|-------|-----------------|---------|
| H1 preset DEEP par défaut | FAIL | No profile system existed — flat config only | R2 | MEDIUM | Profile system added | drift to slow | FIXED |
| H2 budget output trop élevé | FAIL | TS maxTokens=1024 (in BALANCED range 1000-1400) | R4 | LOW | Updated to 1200 | minor | ACCEPTABLE |
| H3 OMEGA attend trop premier token | UNKNOWN | No first_token_timeout existed | R2/R3 | HIGH | first_token_timeout added per profile | blocked UX | FIXED-partial |
| H4 timeouts globaux sans stages | CONFIRMED | config.rs: single response_timeout=45s | R2/R3 | CRITICAL | Stage timeouts added (memory_fetch, total) | silent hangs | FIXED |
| H5 retries/fallbacks sans borne | CONFIRMED | chat path: secureInvoke direct, 0 retry; max_retry/fallback absent | R3 | HIGH | max_retry_chain=1, max_fallback_chain=1 | unbounded chains | FIXED |
| H6 stream ≠ non-stream chemin | PARTIAL | Both go through providers.dispatch — aligned. done-chunk now includes stop_reason+profile | R3 | MEDIUM | Profile + stop_reason unified | divergence truth | IMPROVED |
| H7 call sites multiples | PARTIAL | serviceInvoker has retries=3 but chat uses secureInvoke | R3/R4 | MEDIUM | Noted; chat path bounded | inconsistency | NOTED |
| H8 mémoire trop lourde/mal compactée | CONFIRMED | retention=3000 (target 8000-12000); context=2048 (target 3072-4096) | R2 | HIGH | BALANCED defaults corrected | context starvation | FIXED |
| H9 chemin legacy vivant | UNKNOWN | chatEngine.commands.dynamic.ts exists — not fully audited | R3 | MEDIUM | Needs follow-up audit | ghost path | OPEN |
| H10 mauvais runtime audité | UNKNOWN | No live binary available for verification | R4 | HIGH | Desktop x3 required | false optimism | BLOCKED |
| H11 métriques sans vérité | CONFIRMED | No stop_reason or profile in response | R3/R4 | HIGH | stop_reason+profile added | hidden failures | FIXED |
| H12 blocage côté provider/transport | UNKNOWN | No live test possible | R3 | MEDIUM | Stage timeouts now bound this | unknown | OPEN |
| H13 UI masque état backend lent | UNKNOWN | No desktop runtime | R4 | MEDIUM | Profile meta now in response | opaque UX | OPEN |
| H14 OMEGA sans budget par mode | CONFIRMED | No FAST/BALANCED/DEEP existed | R2 | CRITICAL | Profile system added | unbounded cost | FIXED |
| H15 problème dominant autre | UNKNOWN | No live metrics | — | — | — | — | UNKNOWN |

---
## ADDENDUM 2026-03-15 — H4+H5 TS PATH (commit 4ede39ac8)

| Hypothesis | Status | Proof | Layer | Criticité | Patch | Verdict |
|------------|--------|-------|-------|-----------|-------|---------|
| H4 stage timeouts TS | CONFIRMED | providerAttemptMs=8000 applied in orchestrator AND useChatCore | R3 | CRITICAL | providerAttemptMs: 8000→50000 | FIXED |
| H5 retry chain unbounded | CONFIRMED | maxAttempts=3 × providerAttemptMs=8000 = 24s frozen | R3 | CRITICAL | maxAttempts: 3→2 | FIXED |
| H5 PROVIDER_TIMEOUTS.ollama | CONFIRMED | 8000ms too tight for local LLM inference (typical: 15-45s) | R3 | CRITICAL | ollama: 8000→45000 | FIXED |
