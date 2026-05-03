# 09_INVARIANTS_CHECK

- I1 Tauri-only runtime authority: PASS (desktop proof lane uses tauri-driver/WRY).
- I2 One-door governed network path: PASS (no new direct UI HTTP introduced by this patch set).
- I3 No silent fallback: PASS (frontend memory context fetch now emits explicit status marker + warning).
- I4 No fake readiness claims: PASS (report classifies missing proofs as BLOCKED).
- I5 Minimal patch: PASS (targeted files only).
- I6 No PASS without proof: PASS.
- I7 Browser E2E != Desktop E2E: PASS (reported separately).
- I9 Auto-repair bounded/retestable: PASS.
- I10 Missing proof => BLOCKED: PASS.

