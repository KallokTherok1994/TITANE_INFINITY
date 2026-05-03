# 10_RESIDUAL_RISKS

Residual risks (real only):
1. Local workspace cleanliness risk: untracked proof-pack directories keep MAIN_STATUS at DIRTY locally.
2. CI environment drift risk: future Ubuntu image/package shifts can re-impact native deps (alsa/webkit stack).
3. Governance drift risk: any new workflow edit without registry sync can re-trigger guard failures.
4. AutoHeal discipline risk: recurrence guard depends on continued append-only rule capture quality.
