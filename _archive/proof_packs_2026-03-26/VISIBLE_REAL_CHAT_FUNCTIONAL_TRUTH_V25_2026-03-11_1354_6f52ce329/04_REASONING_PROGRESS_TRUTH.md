# V25 Reasoning Progress Truth

Observed on real visible run:
- `reasoningVisible=true`
- `reasoningState=done`
- `reasoningTestIdPresent=true`
- `reasoningTopologyCount=1`

Evidence:
- `s4_processing_state`
- `s8_final_stable`
- Metrics JSON fields above

Assessment:
- Progress component is visible and stateful.
- Topology exists but remains minimal (`1` node), so utility is limited.
- No decorative-only claim retained; panel is now linked to runtime path metadata and visible states.

## Postbuild update

- `run_chat_postbuild` shows `reasoningTopologyCount=5`.
- Visible text now includes runtime-oriented entries (`mode:OFFLINE`, `provider:offline`, `reason:FALLBACK_OFFLINE`, `attempt1:offline/success`).
- Progress remains visible with `reasoningState=done`.
