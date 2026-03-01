# OFFLINE_SIM CONTRACT (P3-3)

## Behavior

- Trigger: environment variable `OFFLINE_SIM=1`.
- Effect: returns deterministic offline response without provider calls.
- Mode: OFFLINE.
- Reason code: `FALLBACK_OFFLINE` (P3_META_V1 canonical).
- Provider used: `offline`.
- Provider class: local.
- Network used: false.
- Attempts: single attempt with outcome `success` and `reason_code=FALLBACK_OFFLINE`.

## Priority

- OFFLINE_SIM has priority over normal processing and timeout handling.
- No routing or provider selection logic is modified; only an early short-circuit in process_message.

## Notes

- OFFLINE_SIM is test-only and must remain opt-in.
- FORCE_LOCAL_PROVIDER remains separate and is not treated as offline.
