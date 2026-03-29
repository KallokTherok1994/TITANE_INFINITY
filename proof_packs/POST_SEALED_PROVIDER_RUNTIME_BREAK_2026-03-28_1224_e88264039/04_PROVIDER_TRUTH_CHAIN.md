# 04_PROVIDER_TRUTH_CHAIN

Requested -> Selected -> Executed -> Degraded/Fallback -> Shown -> Memory Consume Gate

- Requested: PROVEN
  - Evidence: runtime summary shows "Requested: Ollama".
- Selected: PROVEN
  - Evidence: runtime summary shows "Provider: Ollama (OMEGA+Singularity)".
- Executed: BROKEN
  - Evidence: provider mode ERROR and reason PROVIDER_UNAVAILABLE during memory turns 3/4.
- Degraded/Fallback: PROVEN
  - Evidence: MEMORY_PROOF_VERDICT = HONEST_OFFLINE_DEGRADED (x3).
- Shown: PROVEN (honest)
  - Evidence: runtime summary and provider fields match runtime truth.
- Memory consume gate: BLOCKED
  - Reason: provider execution unavailable at memory consume stage.
