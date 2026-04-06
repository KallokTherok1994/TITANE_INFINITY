# ONLINE PROFILE

- generated_at_utc: 2026-03-05T13:03:00Z

## Providers Detected

- `gemini` (external)
- `openai` (external)
- `anthropic` (external)
- `ollama` (local)
- `local` (fallback)

Source proofs:
- `src-tauri/src/overdrive/chat_orchestrator.rs` (`chat_check_providers` / provider availability)
- `src/services/ai/AIProviderLazyLoader.ts` (lazy cloud providers)
- `src/services/ai/orchestrator.ts` (online-first orchestration + fallback)

## Governed Network Path

- UI: `src/components/layout/TopNav.tsx` -> `safeInvoke('chat_check_providers')`
- IPC client: `src/lib/security.ts` -> `secureInvoke(...)`
- Backend command: `src-tauri/src/overdrive/chat_orchestrator.rs` -> `chat_check_providers`
- Gateway egress: `src-tauri/src/commands/orchestration_center.rs` -> `orchestration_gateway().head_status(...)`
- External targets:
  - Gemini models endpoint
  - OpenAI models endpoint
  - Anthropic models endpoint

## Expected Env Vars (names only)

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OLLAMA_BASE_URL`
- `OLLAMA_DEFAULT_MODEL`
- `OLLAMA_MODEL`

## Timeouts / Breakers / Retry

- Provider budgets: `src/config/aiTimeouts.config.ts`
  - `REQUEST_BUDGETS.globalRequestMs=60000`
  - `REQUEST_BUDGETS.providerAttemptMs=8000`
  - `REQUEST_BUDGETS.maxAttempts=3`
- Circuit breaker defaults: `src/services/ai/circuitBreaker.ts`
  - `failureThreshold=5`
  - `recoveryTimeoutMs=30000`
  - `successThreshold=2`
- Retry defaults: `src/services/ai/retryStrategy.ts`
  - `maxAttempts=3`
  - `initialDelayMs=1000`
  - `backoffMultiplier=2`
  - `maxDelayMs=10000`

## Healthcheck Canonical

- Command: `bash scripts/verify/verify_chat_online.sh`
- Result in this session: FAIL x3 (`10_PROVIDER_HEALTH_X3.log`)
  - Missing `GEMINI_API_KEY`
  - Missing `OPENAI_API_KEY`
  - Missing `ANTHROPIC_API_KEY`

## Gate: ONLINE_READY

- Status: `BLOCKED_PROVIDER_CONFIG`
- Reason: no external provider key configured + healthcheck failed
- Next action <=30min:
  1. set one valid external API key env var
  2. rerun health x3
  3. if pass, run online smoke/full x3
