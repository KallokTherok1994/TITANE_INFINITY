# ROUTING_TRACE_CONTRACT_v1

Status: QUALIFIED
Date: 2026-03-27
Scope: Phase 2 safe bounded subset - routing truth contract freeze

## Goal

Freeze the routing truth chain that is already runtime-backed today, without claiming the full
Phase 2 router is complete.

## Current Chain Of Truth

1. Backend emits `meta`
2. `chatService.sendMessage()` reads truth from `meta.provider_used`
3. `ChatResponse.provider` is normalized from backend truth, not legacy provider fields
4. `response.metadata.provider_used` preserves the same truth for downstream UI consumers
5. `provider_meta` is preserved for richer consumers

Primary runtime surface:

- `src/services/api/chat.ts`

Supportive runtime/defaulting surface:

- `src/services/conversationEngine.ts`

## Runtime-Backed Fields Frozen In v1

- `provider_used`
- `provider_class`
- `mode`
- `reason_code`
- `latency_ms_total`
- `timeout_ms`
- `retries`
- `attempts`
- `network_used`
- `cache_hit`
- `policy`
- `provider_meta`

## Proven Invariants

From provider meta truth tests:

1. `mode=REMOTE` requires `network_used=true`
2. `provider_used=local_only` must not be surfaced as `REMOTE`
3. fallback paths require explicit non-OK `reason_code`
4. backend `meta.provider_used` outranks legacy provider fields for UI truth

## Safe Defaults Proven

When metadata is absent or partial, the current runtime normalizes safely instead of inventing
provider truth:

- fallback provider defaults
- zero latency defaults
- explicit memory effect defaults
- preserved conversation_generate payload wrapping

## What This Lock Does Not Claim

- no single end-to-end `routing_trace` object exists yet
- no canonical `selected_model` field is proven end-to-end
- no canonical `fallback_reason` field is proven end-to-end
- no unified task classifier + policy engine + selector object is fully emitted

Those remain Phase 2 implementation gaps.

## Anti-Lie Rules

- Do not show the requested provider as the used provider when backend meta disagrees.
- Do not infer remote mode when `network_used=false`.
- Do not treat missing metadata as proof of successful routing.

