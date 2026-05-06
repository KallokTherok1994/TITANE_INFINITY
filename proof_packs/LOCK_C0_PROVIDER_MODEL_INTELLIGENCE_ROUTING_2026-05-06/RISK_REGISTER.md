# Lock C0 — Risk Register

- R1: Legacy fallback path still exists for explicit compatibility.
  - Mitigation: C1+ locks can remove legacy path only with explicit rollout proof.
- R2: Runtime feature flag misuse can reintroduce model drift.
  - Mitigation: keep boundary validators and contract tests active.

Residual risk: bounded and documented.
