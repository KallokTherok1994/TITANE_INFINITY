# 04 — TWINS CHAT CHAIN

```
Twin backend value (NumericTwinState::fusion_index)
  → useTwinEvolution fetches via IPC
  → writes localStorage['titane_twin_fusion_v1'] = {globalScore, trend, updatedAt}

  → Chat request triggered (user sends message)
    → buildChatContextEnvelope(input)
        → readFreshTwinsFusion()  ← PATCHED: freshness guard here
            → reads localStorage['titane_twin_fusion_v1']
            → validates updatedAt: rejects if missing or age > 30min
            → returns {globalScore, trend, updatedAt} or null
        → envelope.twinsContext = fresh value or undefined

  → envelope serialized → sent to Rust via IPC
  → extract_context_binding(envelope) in commands.rs
      → context_binding.twinsFusionScore = twins.globalScore (or 0.0)
      → context_binding.twinsTrend = twins.trend (or "unknown")
      → has_twins_context = score > 0.0 && trend != "unknown"

  → build_custom_system_prompt(context_binding)
      → if has_twins_context:
          append "TWINS_CONTEXT: fusion_score={:.2}, trend={}" to system_prompt

  → system_prompt → provider call (Ollama / OpenAI / etc.)
  → LLM response returned → UI renders
```

**Effect classification:**
- PROMPT_EFFECT_PROVEN: TWINS block reaches system_prompt (code-proven + 12 unit tests)
- RESPONSE_EFFECT_UNPROVEN: LLM behavioral change from TWINS block is non-deterministic
