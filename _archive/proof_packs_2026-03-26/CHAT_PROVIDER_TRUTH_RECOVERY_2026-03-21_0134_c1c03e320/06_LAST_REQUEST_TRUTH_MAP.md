# LAST_REQUEST_TRUTH_MAP

Based on observed log facts (not live runtime — BLOCKED_HEADLESS):

## Pre-Fix Scenario (Reconstructed from logs)

| Property | Value |
|----------|-------|
| Selected provider | ollama (auto mode) |
| Actual invoked provider | ollama |
| Response result | TIMEOUT at ~5000ms |
| Error category | REQUEST_TIMEOUT |
| Timeout category | GENERATE_TIMEOUT (5s) |
| Breaker state before | count=2 → OPEN on this failure (count=3) |
| Breaker state after | count=3 → "temporairement désactivé" logged |
| UI label shown | provider="ollama" then disabled state |
| Truthful? | PARTIAL — count shown as hardcoded "3 échecs" even when actually higher |
| Recovery | Every 30s TTL: probe succeeds → returns true (count stays 3) → if next request fails: count=4, "toujours désactivé" flood |

## Post-Fix Scenario (Expected)

| Property | Value |
|----------|-------|
| On probe success (30s) | reset_provider_failures("ollama") → count=0 |
| Next request | fresh window, count=0 |
| If next request succeeds | reset again (no-op, count already 0) |
| If next request fails | count=1, no disable message |
| If 3 more failures | count=3, "temporairement désactivé (3 échecs consécutifs)" — accurate |
| Recovery | Bounded: max 30s disabled per intermittent failure burst |

## Source of Truth Authority
Single: `state.provider_failure_count` (Arc<RwLock<HashMap<String, u32>>>) in ChatOrchestratorState.
No split authority. G_PROVIDER_STATE_AUTHORITY_UNIQUE = PASS.
