# 04 — AUTHORITY MAP

## Single Active Authority: CONFIRMED

```
.github/copilot-instructions.md  ←  CANONICAL KERNEL (Rule 1 source of truth)
         ↓ mirrors
.clinerules/00-kernel.md         ←  CLINE OPERATIONALIZATION (reads Copilot, never redefines)
         ↓ applies to
.clinerules/hooks/*              ←  RUNTIME ENFORCEMENT (hook scripts)
         ↓ scope
AGENTS.md (per path)             ←  PATH COMPATIBILITY (docs/, e2e/, scripts/, src/, src-tauri/)
```

## Authority Uniqueness Check

| Surface | Source-of-Truth? | Competing with kernel? | Risk |
|---|---|---|---|
| `.github/copilot-instructions.md` | YES (canonical) | N/A | NONE |
| `.clinerules/00-kernel.md` | MIRROR only | NO (explicitly mirrors) | NONE |
| `.clinerules/20-proof-gates-verdicts.md` | RULE DETAIL | NO | NONE |
| `.clinerules/40-autoheal-rollback.md` | RULE DETAIL | NO | NONE |
| `AGENTS.md` (per path) | PATH COMPAT | NO | NONE |
| `.github/agents/*.agent.md` | AGENT ROLE DEFS | NO | NONE |
| `.github/prompts/*.prompt.md` | WORKFLOW GUIDES | NO | NONE |

## Verdict: G_AUTHORITY_UNIQUENESS = PASS
No competing authority detected. Single authority chain intact.
