# ORCHESTRATOR / CHAT / PROVIDERS AUDIT

- Orchestrateur principal: `src/services/ai/orchestrator.ts`.
- Retry/backoff/circuit-breaker présents (quick-fail cache, rate limiter, circuit breaker, provider timeout).
- Fallback/local provider présents (`fallback.ts`, `titaneLocal.ts`, `ollama.ts`).
- Anti-attente infinie: timeout global + tentatives bornées observés.
- Échec tests x3 persistant non-fonctionnel orchestrateur: webServer Playwright ne démarre pas (infra test harness).
