# LOCK D0 — ROLLBACK PLAN

## Scope
src/services/agent_effectiveness/ — v12 accountability sidecar
docs/agents/ — AGENT_EFFECTIVENESS_SCORECARD.md + AGENT_EFFECTIVENESS_POLICY.md
scripts/verify/verify_agent_effectiveness_scorecard.sh
docs/registry/ — 4 registry updates
docs/roadmap/ — D0_INGRESS_AUDIT.md + program status D0 row

## Rollback Command

```bash
git restore \
  src/services/agent_effectiveness/AgentEffectivenessContract.ts \
  src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts \
  docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md \
  docs/agents/AGENT_EFFECTIVENESS_POLICY.md \
  scripts/verify/verify_agent_effectiveness_scorecard.sh \
  docs/roadmap/D0_INGRESS_AUDIT.md \
  docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md \
  docs/registry/TITANE_TEST_REGISTRY.md \
  docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md \
  docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md \
  docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Safety
- D0 is T1/T2 measurement layer only. No runtime activation. No feature flag required.
- Rolling back does NOT affect production runtime.
- Rolling back DOES remove scorecard/policy docs. Re-run D0 normalization to restore.
