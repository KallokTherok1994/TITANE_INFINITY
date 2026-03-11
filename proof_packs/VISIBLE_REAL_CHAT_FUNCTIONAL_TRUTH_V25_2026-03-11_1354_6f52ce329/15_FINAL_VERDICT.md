# V25 Final Verdict

VERDICT: `FAIL`

Why PASS is forbidden in this run:
- The visible assistant response to the canonical prompt is still degraded simulated offline output (`Mode OFFLINE_SIM actif...`).
- Runtime badges confirm offline/fallback/simulated state.

What is validated:
- UI visible/stable.
- Input/send/response mechanics function.
- Reasoning/progress component is visible and stateful.

What is not validated:
- Healthy real fullstack provider/orchestrator answer for canonical question.

Postbuild retention:
- After AppImage rebuild and rerun, verdict remains `FAIL` with explicit runtime attrs:
	- `providerMode=OFFLINE`
	- `providerReason=FALLBACK_OFFLINE`
	- `providerUsed=offline`
	- `providerNetworkUsed=false`
