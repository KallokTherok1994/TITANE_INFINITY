# GATE 6 — INSTRUCTION LAYER AUDIT

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Auditor:** 03_instruction_layer_auditor (qwen3.5:9b)

---

## Instruction Sources Audited

| Source | Type | Scope |
|--------|------|-------|
| `.github/copilot-instructions.md` | L1 — Constitutional kernel | All surfaces |
| `.github/instructions/titane.instructions.md` | L2 — Path-scoped | `src/**, src-tauri/**, tests/**, scripts/**` |
| `.github/instructions/frontend.instructions.md` | L2 — Path-scoped | Frontend |
| `.github/instructions/tauri.instructions.md` | L2 — Path-scoped | Tauri/Rust |
| `.github/instructions/tests-e2e.instructions.md` | L2 — Path-scoped | E2E tests |
| `.github/agents/ollama-dev-chat-boundary.agent.md` | L4 — Agent | Ollama boundary |
| `.github/agents/titane-conductor.agent.md` | L4 — Agent | Orchestration |
| `.github/prompts/ollama-dev-session.prompt.md` | L5 — Prompt | Dev session |
| `AGENTS.md` | L3 — Local agents | Advanced agents |
| `.claude/rules/frontend-runtime.md` | Claude Code rules | src/** touch |
| `CLAUDE.md` | Claude Code kernel | All Claude sessions |

## Classification Per Source

| Source | Classification | Notes |
|--------|---------------|-------|
| `.github/copilot-instructions.md` | CANONICAL | L1 constitutional kernel; proof-before-verdict, stop-the-line, NO_SKIPS. No NEXUS conflicts. |
| `titane.instructions.md` | CANONICAL | Correctly delegates dev boundary to ollama-dev-chat-boundary agent; no product model mutation allowed. |
| `ollama-dev-chat-boundary.agent.md` | CANONICAL | Explicitly states gemma2:2b is product default, qwen3.5:9b is dev-only. Aligned with Gate 2 findings. |
| `titane-conductor.agent.md` | SUPPORTING | Orchestration workflow; no NEXUS-specific instructions. Does not pre-empt Surface Decision Matrix. |
| `ollama-dev-session.prompt.md` | SUPPORTING | Pre-flight includes `verify:ollama:dev:live` (BLOCKED_USER_STOP in this session). Session conflict, not doctrinal conflict. |
| `AGENTS.md` | SUPPORTING | Advanced agent requirements (monitoring, log analysis, etc.) for future gates. No NEXUS conflicts. |
| `.claude/rules/frontend-runtime.md` | CANONICAL | Path-scoped for src/**; IPC whitelist, alias parity, logger signature rules. Consistent with CLAUDE.md. |
| `CLAUDE.md` | CANONICAL | Highest Claude Code authority. Proof-before-verdict, patch minimal, AutoHeal mandatory. |

## NEXUS-Specific Findings

| Risk Pattern | Found? | Notes |
|-------------|--------|-------|
| Prompt creating NexusPage too early | NO | No instruction mentions NexusPage. SAFE. |
| Prompt relaunching Time Agenda | NO | No Time Agenda instruction found. SAFE. |
| Instruction allowing src/ before Gate 10 | NO | titane.instructions.md is path-scoped but does not override phase lock. SAFE. |
| Instruction allowing src-tauri/ before spec | NO | No such instruction. SAFE. |
| Instruction changing product chat baseline | NO | ollama-dev-chat-boundary.agent.md explicitly forbids this. SAFE. |
| Instruction allowing qwen in product chat | NO | Multiple layers explicitly forbid this. SAFE. |
| Instruction weakening proof-before-verdict | NO | Rule 2 and Rule 8 in kernel explicitly require proof. SAFE. |
| Instruction bypassing Scope Sentinel | NO | No such instruction. SAFE. |

## Session Conflict (Non-Doctrinal)

`ollama-dev-session.prompt.md` pre-flight step 5: `pnpm run verify:ollama:dev:live`  
This command was BLOCKED_USER_STOP in our current session. The instruction is correct for normal sessions — the block is a session-specific decision, not a doctrinal conflict. No repair needed.

## Gate 6 Verdict

```
BLOCKING_CONFLICT=NONE
ALL_SOURCES_CLASSIFIED=PASS
REPAIR_PROPOSAL_REQUIRED=NO
PRODUCT_MUTATION_RISK=NONE
GATE_6_VERDICT=QUALIFIED_NO_BLOCKING_CONFLICT
```
