# 07 — SURFACE PURITY MATRIX

## .clinerules/ (post-patch — 10 files)

| File | Classification | Should be here? | Notes |
|---|---|---|---|
| `00-kernel.md` | ACTIVE_RULE | YES | Copilot mirror, canonical |
| `20-proof-gates-verdicts.md` | ACTIVE_RULE | YES | Gate definitions |
| `40-autoheal-rollback.md` | ACTIVE_RULE | YES | AutoHeal + rollback doctrine |
| `hooks/TaskStart` | ACTIVE_HOOK | YES | Sober — 7 lines context |
| `hooks/PreToolUse` | ACTIVE_HOOK | YES | Architecture guard |
| `hooks/PostToolUse` | ACTIVE_HOOK | YES | Status classifier + dormant AutoHeal cap |
| `hooks/UserPromptSubmit` | ACTIVE_HOOK | YES | Prompt entry handler |
| `install-hooks.sh` | ACTIVE_COMPAT | YES | Installation utility |
| `test-complete.sh` | ACTIVE_VALIDATOR | YES | Hook integration tests |
| `logs/operations.log` | ACTIVE_LOG | YES | Operational log (runtime) |

**Surface purity: CLEAN post-patch**

## ARCHIVED (moved this session)

| File | Classification | Moved to |
|---|---|---|
| `behavioral_analysis_report.md` | HISTORICAL_REPORT | `archived_from_clinerules/` |
| `observation_protocol_operational.md` | HISTORICAL_PROTOCOL | `archived_from_clinerules/` |
| `verdict_final_sealed.md` | HISTORICAL_VERDICT + SEALED_UNPROVEN | `archived_from_clinerules/` |

## Note on verdict_final_sealed.md

The file declared `SEALED` on 2026-01-04 based on 3 synthetic scenario harnesses.
Per TITANE∞ doctrine: `SEALED` requires natural operational proof. 
Correct verdict for that session's state: **STABLE** (coherent, validated synthetially, not yet naturally proven).
The overstatement is preserved in the archive — no retroactive modification of the original file content.
