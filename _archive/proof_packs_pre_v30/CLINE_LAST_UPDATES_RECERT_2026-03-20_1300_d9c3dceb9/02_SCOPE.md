# 02 — SCOPE

## Latest CLINE-Touched Active Surfaces

### Commit 5919275be (Jan 4, 2026): "SEALED: Constitutional Cline-Copilot Alignment + Hook Hardening"
Primary CLINE session that introduced:
- `.clinerules/hooks/TaskStart` (hardened, 7-line minimal)
- `.clinerules/hooks/PostToolUse` (hardened, AutoHeal integration)
- `.clinerules/00-kernel.md` (Copilot mirror)
- `.clinerules/20-proof-gates-verdicts.md`
- `.clinerules/40-autoheal-rollback.md`
- `.clinerules/behavioral_analysis_report.md` (proof artifact — SHOULD NOT remain in active surface)
- `.clinerules/observation_protocol_operational.md` (protocol artifact — SHOULD NOT remain)
- `.clinerules/verdict_final_sealed.md` (verdict artifact — SHOULD NOT remain)

### Recent operational commits (CLINE co-authoring, Mar 2026)
- Multiple AH-2026-03-XX entries in `scripts/autoheal/autoheal_rules.jsonl`
- All correctly placed (not in `.clinerules/`)

## Scope Classification

| Surface | Type | In Scope |
|---|---|---|
| `.clinerules/hooks/**` | ACTIVE_HOOKs | YES |
| `.clinerules/00-kernel.md` | ACTIVE_RULE | YES |
| `.clinerules/20-proof-gates-verdicts.md` | ACTIVE_RULE | YES |
| `.clinerules/40-autoheal-rollback.md` | ACTIVE_RULE | YES |
| `.clinerules/behavioral_analysis_report.md` | HISTORICAL_REPORT | YES (was polluting) |
| `.clinerules/observation_protocol_operational.md` | HISTORICAL_PROTOCOL | YES (was polluting) |
| `.clinerules/verdict_final_sealed.md` | HISTORICAL_VERDICT | YES (was polluting) |
| `.github/copilot-instructions.md` | CANONICAL_KERNEL | YES (authority check) |
| `scripts/autoheal/autoheal_rules.jsonl` | ACTIVE_DATA | IN_SCOPE |
