# PROVIDER EXECUTION PATH (ACTIVE TARGET)

A. PROVIDER_REQUESTED
- Evidence: runtime summary "Requested: Ollama".
- Status: PROVEN (run2/run3).

B. PROVIDER_SELECTED
- Evidence: runtime summary "Provider: Ollama (OMEGA+Singularity)".
- Status: PROVEN (run2/run3).

C. PROVIDER_EXECUTED
- Evidence: runtime meta providerUsed="OLLAMA (OMEGA+SINGULARITY)", providerReason=OK, providerMode=LOCAL.
- Status: PROVEN in run2; PARTIAL overall (x3 blocked by session crashes).

D. FALLBACK_OR_DEGRADED
- Evidence: providerReason=OK, no HONEST_OFFLINE_DEGRADED.
- Status: PROVEN in run2; PARTIAL overall.

E. PROVIDER_SHOWN
- Evidence: runtime summary matches providerUsed and mode.
- Status: PROVEN in run2; PARTIAL overall.

F. MEMORY_CONSUME_GATE
- Evidence: run2 memory verdict PASS_MEMORY_REAL.
- Status: PARTIAL (x3 stability not achieved; two crashes).
