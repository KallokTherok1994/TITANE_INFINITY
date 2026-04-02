# ROUTING_POLICY_CANON_v1

Status: QUALIFIED
Date: 2026-03-27
Scope: Phase 0 routing canon freeze based on current repo truth

## Active Routing Doctrine

- Routing must remain truthful to backend meta.
- Online-first governed policy remains active.
- Local fallback is mandatory but must never be mislabeled as remote.
- UI must not infer provider/mode from heuristics when backend meta is available.

## Current Routing Sources

- Intent classifier: `src-tauri/src/engines/conversation_os/router.rs`
- Frontend orchestrator scoring and fallback: `src/services/ai/orchestrator.ts`
- Backend router stack: `src-tauri/src/ai/router.rs`
- Provider truth contract: `docs/PROVIDER_ORCHESTRATION_CONTRACT.md`

## Runtime-Backed Inputs Present Today

- provider availability
- provider health / quick-fail state
- preferred provider override
- concurrency pressure
- recent provider reuse / diversity pressure
- message heuristics / intent classification
- network-used truth in provider meta

## Runtime-Backed Outputs Present Today

- `provider_used`
- `provider_class`
- `mode`
- `reason_code`
- `network_used`
- `cache_hit`
- `policy`
- `alternates` (internal orchestrator selection surface)

## Required Future Outputs Not Yet Canonically Runtime-Backed

- `task_type`
- `policy_applied`
- `required_capabilities`
- `selected_model`
- `fallback_reason`
- `confidence`
- `routing_trace`
- `fallback_trace`

These fields are Phase 2 targets, not Phase 0 completion claims.

## Fallback Rules

- `FORCE_LOCAL_PROVIDER=1` is local policy override, not offline mode.
- `OFFLINE_SIM=1` is the explicit offline simulation path.
- Silent fallback is forbidden.
- Frontend fallback handling must preserve the reason code and provider truth.

## Canonical Decision Rules Frozen In v1

1. `mode=REMOTE` requires `network_used=true`
2. `provider_used=local_only` must not be surfaced as `REMOTE`
3. fallback paths require explicit non-OK `reason_code`
4. loopback access remains local, not remote

## Explicit Gap

Current routing surfaces are real but not yet one unified Phase 2 router with a single
end-to-end trace object. This file freezes the current truth without overstating maturity.
