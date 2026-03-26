# V24 Expected vs Observed

Expected:

- Reasoning panel visible with stable testid/state/topology in runtime proof.

Observed on final rebuilt artifact:

- Reasoning panel present with `data-testid=reasoning-progress`.
- State exposed as `done`.
- Topology nodes detectable in compact mode.
- Only remaining friction is harness-side native setter typing path.

Status: PASS

## V24.1 Continuation Addendum (2026-03-11)

Expected for closure from the run4 resume point:

- No ambiguous run state before making decisions.
- Real chat remains usable on rebuilt runtime artifact.
- Reasoning progress remains visible, real, and selector-stable.
- Minimal topology remains observable on the retained final runtime path.

Observed from retained evidence in the same pack:

- `run_postbuild_4` is complete, deterministic, and non-ambiguous (`POSTBUILD4_RC=0`, 5/5 spec PASS).
- `run_postbuild_5_clean` is complete (`POSTBUILD5_RC=0`).
- `run_postbuild_final_clean` and `run_postbuild_topology_clean` are complete and keep 5/5 PASS.
- Final retained state (`run_postbuild_topology`) keeps chat usable (`inputPresent=true`, `sendPresent=true`, `inputTyped=true`, `sendEnabledAfterTyping=true`, `sendClicked=true`, `visibleUiChangeAfterSend=true`).
- Reasoning state is real and visible (`reasoningProgressState=done`, `reasoningProgressTestIdPresent=true`).
- Topology is present (`reasoningProgressHasTopology=true`).

Continuation status: PASS
