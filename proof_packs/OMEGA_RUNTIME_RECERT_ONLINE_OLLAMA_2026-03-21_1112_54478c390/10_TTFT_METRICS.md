# Ollama TTFT Metrics

## Model: gemma2:2b (default chat model)

### Cold Start
| Metric | Value |
|--------|-------|
| Wall time | 3555ms |
| Total duration | 3548ms |
| Prompt eval (TTFT) | 424ms |
| Eval duration | 1105ms |
| Eval count (tokens) | 11 |

### Warm Runs (x3)
| Run | Wall ms | Total ms | Done |
|-----|---------|----------|------|
| 1   | 1224    | 1217     | True |
| 2   | 1200    | 1193     | True |
| 3   | 1193    | 1187     | True |

### TTFT Estimate
- **Cold TTFT**: ~424ms (prompt_eval_duration)
- **Warm total response**: ~1.2s (tokens already cached in model context)
- **Token throughput** (cold): 11 tokens / 1105ms ≈ **10 tok/s** on gemma2:2b

### Assessment
Response times well within the TIMEOUT_LOCAL_SECS=45s threshold. 
Normal operating range for gemma2:2b on this hardware.
