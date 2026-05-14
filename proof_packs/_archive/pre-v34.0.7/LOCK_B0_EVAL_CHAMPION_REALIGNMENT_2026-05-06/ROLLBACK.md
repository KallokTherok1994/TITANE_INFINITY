# Lock B0 — Rollback Plan

## Scope
Lock B0 created 12 new stub scorecard files and updated CHALLENGER_TEMPLATE.json.
All changes are additive — no existing scorecards were modified.

## Rollback Procedure

```bash
# Remove 12 new scorecard stubs
rm -f evals/scorecards/v1/INTELLIGENCE_TRUTH_SCORECARD.json
rm -f evals/scorecards/v1/COGNITIVE_CORE_TRUTH_SCORECARD.json
rm -f evals/scorecards/v1/KEVIN_AXIS_SCORECARD.json
rm -f evals/scorecards/v1/RESEARCH_TRUTH_SCORECARD.json
rm -f evals/scorecards/v1/AGENT_EFFECTIVENESS_SCORECARD.json
rm -f evals/scorecards/v1/PROVIDER_ROUTING_TRUTH_SCORECARD.json
rm -f evals/scorecards/v1/MEMORY_RETRIEVAL_QUALITY_SCORECARD.json
rm -f evals/scorecards/v1/KNOWLEDGE_GOVERNANCE_SCORECARD.json
rm -f evals/scorecards/v1/OMEGA_HANDLER_REALITY_SCORECARD.json
rm -f evals/scorecards/v1/SINGULARITY_MEASUREMENT_SCORECARD.json
rm -f evals/scorecards/v1/TWIN_CONSENT_SCORECARD.json
rm -f evals/scorecards/v1/SELF_IMPROVEMENT_GOVERNANCE_SCORECARD.json

# Restore CHALLENGER_TEMPLATE.json
git checkout HEAD~1 -- evals/scorecards/v1/CHALLENGER_TEMPLATE.json

# Remove autoheal entry 1645
head -1644 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_rollback.jsonl
mv /tmp/ah_rollback.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Safety
- Existing 6 scorecards (RESPONSE_QUALITY, MEMORY_TRUTH, ROUTER_TRUTH, HONESTY, AUTOHEAL_TRUTH, DESKTOP_CRITICAL_FLOW) were NOT modified.
- Champions at v28.0.0 are preserved.
- verify_evals_scaffold.sh will still PASS=42 after rollback.
