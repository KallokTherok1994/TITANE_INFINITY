# Step 5: Direct Ollama Chat Test

## Test Command
```
curl -s --max-time 30 -X POST http://localhost:11434/api/generate
  -H "Content-Type: application/json"
  -d '{"model":"gemma2:2b","prompt":"Reply with exactly: TITANE_OLLAMA_LIVE","stream":false}'
```

## Run 0 (initial, cold)
- RESPONSE: `TITANE_OLLAMA_LIVE`
- DONE: True
- TOTAL_DURATION_MS: 3548
- PROMPT_EVAL_DURATION_MS: 424 (TTFT estimate: ~424ms)
- EVAL_DURATION_MS: 1105
- EVAL_COUNT: 11 tokens
- WALL_TIME_MS: 3555

## x3 Repeatability (warm cache)
```
RUN[1]: wall=1224ms  total=1217ms  done=True  ✅
RUN[2]: wall=1200ms  total=1193ms  done=True  ✅
RUN[3]: wall=1193ms  total=1187ms  done=True  ✅
```

## Assessment
OLLAMA_DIRECT_PASS — 3/3 stable. Warm TTFT ~1.2s. Cold TTFT ~3.5s.
Model gemma2:2b responds correctly and consistently.
