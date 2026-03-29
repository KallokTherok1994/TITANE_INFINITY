# FIX CANDIDATE ANALYSIS

Candidate class: WRY_WINDOW_STABILITY_GLITCH (session lifetime instability).

Rationale:
- Crashes present as invalid session id during executeScript/navigation.
- No provider-unavailable signal observed in completed run.

Decision:
- NO_SAFE_FIX in this cycle without widening scope (needs deeper WRY/driver diagnosis).
