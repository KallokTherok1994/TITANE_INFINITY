# OLLAMA_ABORTERROR_FINAL_PROOF_v2

Date: 2026-02-13

## Discovery

- Map: reports/ollama_abort_v2/MAP.md

## Fix summary

- AbortError normalized in secureInvoke and tauriProtector
- Ollama transport maps AbortError to OLLAMA_ABORTED with retryable=false
- Direct frontend Ollama fallback removed from tauriProtector
- User-facing hints updated to neutral local-fallback message
- Retry strategy treats abort as non-retriable

## Guards

- scripts/verify/guard-no-frontend-ollama-direct.sh
- scripts/verify/guard-dist-no-ollama-11434.sh

## Tests

- src/__tests__/lib/security/secureInvokeAbort.test.ts
- src/__tests__/services/ai/ollamaTransportAbort.test.ts
- src/services/ai/__tests__/ollamaAbortFallback.test.ts

## Pending

- Full test suite failed (E2E: net::ERR_CONNECTION_REFUSED to http://localhost:5173)
- Run guards after build and record outputs
