# Lock B0 — Authority Map

| Layer | File | Governs |
|-------|------|---------|
| L1 | .github/copilot-instructions.md | AutoHeal Rule 10, test Rule 16, mapping Rule 15 |
| L2 | .github/instructions/titane.instructions.md | AutoHeal schema, eval champion update policy |
| L3 | AGENTS.md | QA Agent test matrix, eval scaffold gate |
| L6 | scripts/verify/verify_evals_scaffold.sh | G_EVAL_DATASET_VERSIONED + G_SCORECARDS_PRESENT |
| L6 | scripts/autoheal/detect_recurrence.sh | Anti-recurrence gate |
| L6 | scripts/verify_instructions.sh | PASS=51 governance gate |

## Decision Chain
1. B0 defined by program v6 spec (TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md)
2. 12 scorecard stubs required; no stubs found → DRIFT_FOUND
3. Stubs created as additive files; verify_evals_scaffold.sh only checks 6 required originals → zero breakage
4. CHALLENGER_TEMPLATE.json updated to include new scorecard keys for future eval runs
5. Existing champion commits untouched → backward-compatible
