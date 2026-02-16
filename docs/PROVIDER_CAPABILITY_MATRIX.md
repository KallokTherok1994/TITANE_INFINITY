# Provider Capability Matrix (P3_META_V1)

**Scope:** Canonical provider capabilities and fallback order (governance).
**Source:** P3-0 discovery proof pack.

## Providers (Real, Found)

| Provider | provider_class | Network | Capabilities | Constraints | Availability |
|----------|----------------|---------|--------------|------------|--------------|
| local | local | none | chat | no keys, always available | always available |
| ollama | local | loopback | chat, local-llm | requires local Ollama on 127.0.0.1:11434 | optional |
| gemini | remote | internet | chat, streaming, vision (if enabled) | GEMINI_API_KEY required | optional |
| openai | remote | internet | chat, streaming, vision (if enabled) | OPENAI_API_KEY required | optional |
| claude | remote | internet | chat, streaming (if enabled) | ANTHROPIC_API_KEY required | optional |

## Fallback Order (Canonical)

- Runtime order is defined by the backend router and orchestrator.
- UI MUST NOT impose a divergent order.
- Current fallback (discovered): `ollama` (if auto enabled) -> `local`.

## Deprecated Routes (Documented Only)

- `chat_send_message` (deprecated, superseded by `conversation_generate`)
- `chat_generate_gemini` (deprecated)
- `chat_generate_openai` (deprecated)

## Acceptance Mapping

- OFFLINE5 is supported by `local` and `ollama` (loopback local) and must surface `mode=OFFLINE` when offline simulated.
- Local-first is maintained by `network_used=false` for local/loopback paths.
- Remote providers are optional and must be gated by allowlist and policy.
