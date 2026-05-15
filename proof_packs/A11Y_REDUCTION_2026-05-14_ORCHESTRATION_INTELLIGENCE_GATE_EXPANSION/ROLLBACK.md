# ROLLBACK — A11Y Orchestration Intelligence contrast + gate expansion

Single command to revert the whole tranche to the parent commit:

```
git restore -- \
  src/modules/OrchestrationIntelligenceCenter.tsx \
  src/__tests__/pages/OrchestrationIntelligenceA11yContrast.test.tsx \
  e2e/a11y/wcag-aa-core.spec.ts \
  UI_SURFACE_MAP.md \
  docs/CARTOGRAPHY_COMPLETE.md \
  registry/ui-events.jsonl \
  scripts/autoheal/autoheal_rules.jsonl \
  reports/A11Y_REDUCTION_2026-05-14_ORCHESTRATION_INTELLIGENCE_GATE_EXPANSION.md \
  proof_packs/A11Y_REDUCTION_2026-05-14_ORCHESTRATION_INTELLIGENCE_GATE_EXPANSION
```

Or revert the commit directly:

```
git revert --no-edit <commit-sha>
```

Risk: zero — the only source change is removing a `opacity-70` Tailwind modifier on a single span. UI behaviour and component shape are unchanged. Reverting reintroduces the prior AA contrast failure on `/orchestration-intelligence`.
