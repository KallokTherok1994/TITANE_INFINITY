# Provider Routing Truth Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| AI Router/provider routing | src/services/ai/orchestrator.ts, src/types/providerMeta.ts, src/types/providerDecisionMeta.ts | Select provider/model per task/risk constraints | Routing structures exist; full task-aware policy hardening remains C0 scope | PARTIAL | Types and orchestration files present | Silent fallback / drift | C0 | ROUTER_TRUTH_SCORECARD, PROVIDER_ROUTING_TRUTH_SCORECARD | AI-DESKTOP-04, AI-DESKTOP-05 |
| Ollama boundary truth | src-tauri/src/ollama.rs, src-tauri/src/ai/ollama.rs, src/config/ollamaDefaults.ts | Keep prod model defaults separated from dev model defaults | Constants and boundary validator exist; continuous guard depends on validator lane | HEURISTIC | verify-ollama-copilot-boundary gate exists | Dev/prod contamination risk | C0, F0 | PROVIDER_ROUTING_TRUTH_SCORECARD | AI-DESKTOP-04, AI-DESKTOP-18, AI-DESKTOP-19 |
