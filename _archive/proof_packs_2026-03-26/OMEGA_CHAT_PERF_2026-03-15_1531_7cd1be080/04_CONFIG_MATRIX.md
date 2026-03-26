# CONFIG MATRIX — BEFORE / AFTER

| Param | Before | After (BALANCED) | FAST | DEEP | Source | Impact vitesse | Impact qualité | Risque trop haut | Risque trop bas |
|-------|--------|----------|------|------|--------|---------------|----------------|-----------------|-----------------|
| response_timeout | 45s | 52s | 30s | 82s | config.rs | HIGH | LOW | hang | timeout early |
| first_token_timeout | ABSENT | 7s | 5s | 10s | config.rs | CRITICAL | LOW | UX freeze | early abort |
| memory_fetch_timeout | ABSENT | 3s | 2s | 5s | config.rs | HIGH | LOW | context starvation | load failure |
| stream_chunk_size | 480 | 832 | 640 | 960 | config.rs | MEDIUM | MEDIUM | over-buffer | choppy output |
| memory_context_tokens | 2048 | 3584 | 2560 | 5120 | config.rs | LOW | HIGH | cost | poor context |
| memory_retention_tokens | 3000 | 10000 | 7000 | 14000 | config.rs | LOW | HIGH | memory bloat | amnesia |
| stream_channel_buffer | 32 | 56 | 40 | 64 | config.rs | MEDIUM | LOW | backpressure | drops |
| max_retry_chain | ABSENT | 1 | 1 | 1 | config.rs | MEDIUM | MEDIUM | retry loop | brittle |
| max_fallback_chain | ABSENT | 1 | 1 | 1 | config.rs | MEDIUM | MEDIUM | fallback spiral | no resilience |
| maxTokens (TS) | 1024 | 1200 | — | — | chatEngine.commands.ts | MEDIUM | MEDIUM | cost | short answers |
| stop_reason | ABSENT | present | present | present | types.rs + TS | — | HIGH | — | hidden failures |
| profile in response | ABSENT | present | present | present | types.rs + TS | — | HIGH | — | opaque routing |
