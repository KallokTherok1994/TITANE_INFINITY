# 06 — PATCH DECISION

## Primary Lock Selected
Lock #4 (variant): **localStorage written but stale-value guard absent**

## Root Cause
`chatMemorySingleDoor.ts` called `readJson<ChatContextEnvelope['twinsContext']>('titane_twin_fusion_v1')`
without checking `updatedAt`. A `titane_twin_fusion_v1` value written in a prior session (days ago)
would be injected into every subsequent chat system_prompt as current TWINS data — a false integration claim.

## Minimal Fix Applied
File: `src/services/chat/chatMemorySingleDoor.ts`

Added after `readJson()` function (line 111):
- `TWINS_FUSION_MAX_AGE_MS = 1_800_000` (30 min)
- `readFreshTwinsFusion()`: reads key, validates `updatedAt`, returns null if stale or missing

Replaced in `buildChatContextEnvelope` (line 338):
- Before: `readJson<...>('titane_twin_fusion_v1') ?? undefined`
- After:  `readFreshTwinsFusion() ?? undefined`

## Invariants Respected
- I1 (Tauri-only): no runtime claim made
- I2 (No fake integration): stale data now correctly excluded
- I3 (No silent fallback): console.warn on stale/missing updatedAt
- I4 (No broad refactor): 2 functions added, 1 line changed
- I5 (No fake effect): response effect still classified UNPROVEN
- I6 (No prompt theater): classification unchanged
