# PERF DIFF MATRIX

| Scenario | Before | After | Delta | Verdict |
|----------|--------|-------|-------|---------|
| memory_retention_tokens | 3,000 | 10,000 | +233% | IMPROVED (richer context) |
| memory_context_tokens | 2,048 | 3,584 | +75% | IMPROVED (more history) |
| stream_chunk_size | 480 | 832 | +73% | IMPROVED (fewer chunks) |
| stream_buffer | 32 | 56 | +75% | IMPROVED (less backpressure) |
| maxTokens (TS) | 1,024 | 1,200 | +17% | ACCEPTABLE (BALANCED range) |
| Stage timeouts | ABSENT | memory=3s, total=52s | NEW | CRITICAL improvement |
| Profile system | ABSENT | FAST/BALANCED/DEEP | NEW | CRITICAL improvement |
| stop_reason | ABSENT | always present | NEW | IMPROVED observability |
| TTFT measured | UNKNOWN | UNKNOWN | — | BLOCKED (desktop needed) |
| Total latency | UNKNOWN | UNKNOWN | — | BLOCKED (desktop needed) |
