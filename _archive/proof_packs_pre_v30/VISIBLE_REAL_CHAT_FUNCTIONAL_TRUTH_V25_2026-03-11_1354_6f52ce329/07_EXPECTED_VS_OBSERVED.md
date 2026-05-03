# V25 Expected Vs Observed

Expected for PASS:
- Real chat answer for canonical question.
- Visible processing/progression.
- Badges aligned with non-degraded runtime.

Observed:
- Real send and response cycle: YES.
- Visible progression signal: YES.
- Final answer quality for canonical question: NO (degraded simulated offline sentence).
- Runtime badges: offline/fallback/simulated.

Delta:
- Functional UI/chat mechanics pass.
- Fullstack answer truth fails.

## Baseline vs postbuild

- `run_chat_baseline`: `FAIL`
- `run_chat_postbuild`: `FAIL`

Invariant across both runs:
- input/send/response mechanics remain good
- visible response remains offline simulated/degraded
