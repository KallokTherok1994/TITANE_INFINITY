# BASELINE — FIX_CHAT_PROVIDER_GOV_P3
## Gate: G4 — Provider Decision Certified
## Champion: v28.0.0 / 7973fbdec | Evidence date: 2026-03-20T15:51:26Z

---

## Problem (pre-fix state)
Provider badge in UI showed the *requested* provider (e.g. "ollama") rather than the
*actual* provider used by the backend. This violated truth: a message served by gemini
could appear as "ollama" in the UI — silent honesty violation (LOCK1).

## Fix commits
- 0dd11f69e — LOCK1: display actual provider from ProviderDecisionMeta
- 6abe58bac — LOCK1: wire meta.provider_used → ChatResponse.metadata.provider_used

## Invariants enforced post-fix

[INVARIANT-1] meta.provider_used from backend response is the authoritative truth source.
When backendResponse.meta.provider_used is present, it MUST override any other field.

[INVARIANT-2] UI provider badge MUST display metadata.provider_used, not the preferred/requested provider.

[INVARIANT-3] If meta is absent, fallback to "tauri-backend" (never invent a provider name).

[INVARIANT-4] Preferred=X but backend used Y → ChatResponse.metadata.provider_used=Y (not X).

## Files changed
- src/services/api/chat.ts — normalizeResponse reads meta.provider_used
- src/services/api/chat.test.ts — LOCK1 test cases RP1-RP4

## Baseline test coverage
23 tests across 3 provider-governance test files — all PASS at v28.0.0.
