# GATES REPORT

| Gate | Status | Evidence |
|------|--------|---------|
| G_BOOT_TRUTH | PASS | HEAD=7cd1be080, MAIN, v28.0.0 confirmed |
| G_SINGLE_CANONICAL_CHAT_PATH | QUALIFIED | chatEngine.commands.ts → secureInvoke → generate_response / stream_response. Dynamic file exists but not audited |
| G_DEFAULT_BALANCED_NOT_DEEP | PASS | ChatProfile::default() = Balanced; ChatEngineConfig::default() = for_profile(Balanced) |
| G_FIRST_TOKEN_BOUNDED | PASS | first_token_timeout added per profile (BALANCED=7s, FAST=5s, DEEP=10s) |
| G_STAGE_TIMEOUTS_PRESENT | PASS | memory_fetch_timeout + response_timeout both present and used in mod.rs |
| G_NO_UNBOUNDED_RETRY | PASS | max_retry_chain=1 on all profiles |
| G_NO_UNBOUNDED_FALLBACK | PASS | max_fallback_chain=1 on all profiles |
| G_MEMORY_COMPACTION_BOUNDED | QUALIFIED | memory_retention_tokens now 10000 (BALANCED); compaction logic in chatMemoryCompactor.ts not audited in this session |
| G_STREAMING_TRUTH | PASS | done-chunk now carries stop_reason + profile; stream path uses per-profile stage timeouts |
| G_UI_META_TRUTH | PASS | stop_reason + profile in ChatCompletionPayload (Rust types + TS interface) |
| G_DESKTOP_X3 | BLOCKED | No live desktop runtime available in this CI environment. Required for PASS → QUALIFIED verdict. |
| G_NO_FALSE_PASS | PASS | Verdict declared QUALIFIED, not PASS, due to missing G_DESKTOP_X3 |

---
## ADDENDUM — commit 4ede39ac8

| Gate | Status | Evidence |
|------|--------|---------|
| G_STAGE_TIMEOUTS_PRESENT (TS) | PASS | providerAttemptMs=50000, ollama=45000 |
| G_NO_UNBOUNDED_RETRY (TS) | PASS | maxAttempts=2 |
| G_NO_UNBOUNDED_FALLBACK (TS) | PASS | maxAttempts=2 = primary+1 fallback |
