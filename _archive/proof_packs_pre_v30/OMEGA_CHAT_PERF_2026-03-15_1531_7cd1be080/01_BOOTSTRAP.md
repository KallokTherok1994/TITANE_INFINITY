# BOOTSTRAP — Phase 0

## Repo Truth
- HEAD: 7cd1be080
- Branch: MAIN
- Version: 28.0.0 (package.json)
- git status: M scripts/autoheal/autoheal_rules.jsonl (pre-existing)

## Runtime Truth
- Binary path: src-tauri/target/debug/titane-infinity (dev build)
- Provider default: Auto (ProviderPreference::Auto)
- Streaming: enabled by default
- Config before patch (PROVEN defaults):
  - response_timeout: 45s (single global, no stage splits)
  - stream_chunk_size: 480 chars
  - memory_context_tokens: 2,048 tokens (UNDERTARGETED for BALANCED)
  - memory_retention_tokens: 3,000 tokens (CRITICALLY LOW — BALANCED target: 8000-12000)
  - stream_channel_buffer: 32 (LOW — BALANCED target: 48-64)
  - maxTokens (TS): 1024
  - Profile system: ABSENT

## Key Gaps Identified
| Gap | Evidence |
|-----|---------|
| H4 CONFIRMED | Single `response_timeout: 45s`, no memory_fetch or first_token stage timeouts |
| H14 CONFIRMED | No FAST/BALANCED/DEEP profile enum — flat config only |
| H8 CONFIRMED | memory_retention_tokens=3000 vs BALANCED target 8000-12000 |
| H4+H8 | memory_context_tokens=2048 vs BALANCED target 3072-4096 |
| H7 PARTIAL | serviceInvoker.ts has retries=3 but chat path uses secureInvoke directly (0 retries) |
