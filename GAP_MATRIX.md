# GAP_MATRIX

## G1 - Persistent memory injection status hidden
- Symptom: persistent memory fetch failures could be swallowed in frontend flow.
- Impact: silent fallback, low observability.
- Fix: explicit `PERSISTENT_MEMORY_STATUS` marker in prompt and warning on fetch failure.
- Status: PASS (patched).

## G2 - Conversation history load status not exposed
- Symptom: backend history load state not surfaced explicitly to trace/metadata.
- Impact: weak proof of retrieval/injection state.
- Fix: added `history_load_status`, `history_message_count`, `history_load_error` plus failure marker.
- Status: PASS (patched).

## G3 - Desktop proof instability (WRY session crash/hang)
- Symptom: `invalid session id` / `session deleted because of page crash or hang` in WDIO wait loop.
- Root cause: high model latency under heavy profile and tight UI wait budget.
- Fix A: `scripts/e2e/run-online-chat-proof-ui.sh` now enforces E2E stability defaults:
  - `OLLAMA_DEFAULT_MODEL=gemma2:2b` (override via `TITANE_E2E_OLLAMA_MODEL`)
  - `TITANE_CONVERSATION_TIMEOUT_SECS=30` default
- Fix B: `e2e/desktop/online-chat-proof-ui.wdio.test.js` assistant wait timeout now configurable and defaults to `120000ms`.
- Status: PASS (validated on final x3 rerun cycle).

## G4 - Full memory multi-turn proof chain (save->recall->consume)
- Symptom: strict end-to-end multi-turn certification still depends on environment stability and target harness.
- Current evidence: desktop single-turn proof is stable and instrumented; unit/rust targeted checks pass.
- Status: PARTIAL (single-turn proof PASS x3; multi-turn certification remains open work item).