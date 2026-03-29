# Breakpoint Analysis

Primary breakpoint: BREAK_AT_CONSUME

Evidence:
- MEMORY_PROOF_VERDICT = HONEST_OFFLINE_DEGRADED (runs 1/2/3)
- Provider unavailable/degraded during memory proof turns; runtime shows PROVIDER_UNAVAILABLE / ERROR in run1 and degraded verdicts in all runs.

Consequence:
- Behavioral consumption cannot be proven while provider path is degraded.
