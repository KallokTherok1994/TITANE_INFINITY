# SCOPE — P1.13a

## Objective

Prove the active LTM runtime path in TITANE∞ and identify the exact breakpoint between `persistent_memory_v19` and the conversation recall subsystem.

## In scope

1. `persistent_memory_write_entry` → file write → `persistent_memory_read` round-trip (PROVE)
2. `persistent_memory_get_stats` → `count_by_level.long_term` monotonic increment (PROVE)
3. Isolation: `conversation_generate` recall path (`unified_memory`) vs `persistent_memory_v19` (IDENTIFY)

## Out of scope

- External sync (BLOCKED_ENV — TURSO_URL absent)
- LTM encrypted content inspection (internal to Rust)
- Multi-turn conversation recall integration (future cycle: P1.14+)
- Bridging `persistent_memory_v19` into `conversation_generate` (not requested)

## Relation to P1.13

P1.13 (POST_SEALED_LTM_RUNTIME_BREAK_2026-03-28_2010_e88264039) was a LANE_A proof (break identification only) that analyzed the wrong code path. This cycle (P1.13a) is LANE_B: correct path identification + LANE_C: persistence round-trip proof.

## Gate conditions for commit

Verdict must be one of: LTM_PERSISTENCE_PROVEN, LTM_RUNTIME_PATH_PROVEN, LTM_BRIDGE_UNBLOCKED, LTM_RECALL_PROVEN, LTM_CONSUMPTION_READY, COMMITTED_TO_MAIN.

`LTM_PERSISTENCE_PROVEN` satisfies commit gate.
