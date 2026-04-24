# 03 — ACTIVE SURFACE INVENTORY (post-patch)

## .clinerules/ — 10 files (all ACTIVE)

| File                         | Classification   | Active? | Canonical?            | Historical? | Risky?   | Stays? |
| ---------------------------- | ---------------- | ------- | --------------------- | ----------- | -------- | ------ |
| `00-kernel.md`               | ACTIVE_RULE      | YES     | YES (mirrors Copilot) | NO          | LOW      | YES    |
| `20-proof-gates-verdicts.md` | ACTIVE_RULE      | YES     | YES                   | NO          | LOW      | YES    |
| `40-autoheal-rollback.md`    | ACTIVE_RULE      | YES     | YES                   | NO          | LOW      | YES    |
| `hooks/TaskStart`            | ACTIVE_HOOK      | YES     | YES                   | NO          | LOW      | YES    |
| `hooks/PreToolUse`           | ACTIVE_HOOK      | YES     | YES                   | NO          | LOW      | YES    |
| `hooks/PostToolUse`          | ACTIVE_HOOK      | YES     | YES                   | NO          | MEDIUM\* | YES    |
| `hooks/UserPromptSubmit`     | ACTIVE_HOOK      | YES     | YES                   | NO          | LOW      | YES    |
| `install-hooks.sh`           | ACTIVE_COMPAT    | YES     | YES                   | NO          | LOW      | YES    |
| `test-complete.sh`           | ACTIVE_VALIDATOR | YES     | YES                   | NO          | LOW      | YES    |
| `logs/operations.log`        | ACTIVE_LOG       | YES     | N/A                   | NO          | LOW      | YES    |

\*PostToolUse MEDIUM risk: auto-capture block writes `files_changed: []` always (dormant — 0 synthetic entries in production JSONL to date).

## ARCHIVED (moved to proof pack)

| File                                  | Old Location   | New Location                | Reason                               |
| ------------------------------------- | -------------- | --------------------------- | ------------------------------------ |
| `behavioral_analysis_report.md`       | `.clinerules/` | `archived_from_clinerules/` | HISTORICAL_REPORT                    |
| `observation_protocol_operational.md` | `.clinerules/` | `archived_from_clinerules/` | HISTORICAL_PROTOCOL                  |
| `verdict_final_sealed.md`             | `.clinerules/` | `archived_from_clinerules/` | HISTORICAL_VERDICT + SEALED_UNPROVEN |

## .github/ Active Surfaces

| File/Dir                         | Type             | Active? |
| -------------------------------- | ---------------- | ------- |
| `copilot-instructions.md`        | CANONICAL_KERNEL | YES     |
| `instructions/*.instructions.md` | SCOPED_RULES     | YES     |
| `agents/*.agent.md`              | AGENT_DEFS       | YES     |
| `prompts/*.prompt.md`            | PROMPT_WORKFLOWS | YES     |
