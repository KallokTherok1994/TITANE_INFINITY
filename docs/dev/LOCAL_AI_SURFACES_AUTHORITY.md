# LOCAL AI SURFACES AUTHORITY — TITANE_INFINITY

## Current canonical state

| Surface | Model | Scope | May affect product runtime? |
|---|---|---|---|
| TITANE Product Chat | gemma2:2b | Governed local conversation runtime | Yes, product runtime only |
| Ollama DEV MCP VS Code | qwen3.5:9b | Repo analysis / development agent | No |
| TOTAL_DEV Chat | qwen3.5:9b unless intentionally retained as TOTAL_DEV-only qwen2.5-coder | Integrated development assistant | No |
| TOTAL_DEV Git/Console/File | none | Governed diagnostics and local inspection | No |

## Boundary invariant

No DEV model may enter:

- src/config/ollamaDefaults.ts
- config/championChallenger.json
- src-tauri product runtime defaults
- chat_orchestrator product fallback
- product-facing recovery messages

## TOTAL_DEV invariant

TOTAL_DEV is not an unrestricted shell.
TOTAL_DEV is a governed cockpit.

Allowed capabilities must remain:

- explicit
- allowlisted
- logged
- reversible
- testable

## Truth standard

Documentation is not proof.
Runtime logs, validators, E2E output, and test output decide final verdict.

## Verdict vocabulary

- PASS: exact proof obtained for exact scope
- PARTIAL: static proof exists but runtime proof is incomplete
- BLOCKED_ENV: environment prevents proof
- BLOCKED_WEB: web research requested but no web access available
- FAIL: observed failure
- UNKNOWN: not inspected or not proven
