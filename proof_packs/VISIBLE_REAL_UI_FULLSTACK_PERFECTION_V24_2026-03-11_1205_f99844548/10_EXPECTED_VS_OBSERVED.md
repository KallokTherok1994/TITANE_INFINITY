# V24 Expected vs Observed

Expected:

- Reasoning panel visible with stable testid/state/topology in runtime proof.

Observed on final rebuilt artifact:

- Reasoning panel present with `data-testid=reasoning-progress`.
- State exposed as `done`.
- Topology nodes detectable in compact mode.
- Only remaining friction is harness-side native setter typing path.

Status: PASS