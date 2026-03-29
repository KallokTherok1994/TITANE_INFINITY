# 05_COHERENCE_MAP

## Local State
- UnifiedMemory STM/MTM/LTM: operational
- Conversation OS v1: append-only SQLite, operational
- Persistent memory: operational

## External State
- Not configured
- No external target exists

## Coherence Rule
If external sync were configured:
- Local write → sync → external write → readback → local verify
- Acceptable lag: event-driven (immediate after sync_now)
- Exactness: append-only events must match (id, ts, payload)

## Current Coherence Status
**NOT APPLICABLE** — no external state to compare against.

## Proof Strategy
1. When TURSO env vars are set:
   - Write test event to local DB
   - Trigger sync_now
   - Readback from external Turso
   - Compare event id + payload hash
   - If match: coherence proven
   - If mismatch: classify failure mode
