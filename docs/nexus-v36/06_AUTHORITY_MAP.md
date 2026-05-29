# GATE 6 — AUTHORITY MAP

**Project:** TITANE_INFINITY

---

## Layer Priority (from copilot-instructions.md)

```
L1 = .github/copilot-instructions.md       (Constitutional kernel — highest)
L2 = .github/instructions/**               (Path-scoped surface instructions)
L3 = AGENTS.md                             (Local agent definitions)
L4 = .github/agents/**                     (Custom agents)
L5 = .github/prompts/**                    (Prompt files)
L6 = Mechanical truth (validators, runtime output)

CLAUDE.md overrides all for Claude Code sessions.
.claude/rules/** are path-scoped Claude Code additions.
```

## Authority per topic

| Topic | Authority | Source |
|-------|-----------|--------|
| Proof-before-verdict | L1 Rule 2 | copilot-instructions.md |
| Stop-the-line | L1 Rule 8 | copilot-instructions.md |
| Product chat default (gemma2:2b) | L1 + L4 | copilot-instructions.md + ollama-dev-chat-boundary.agent.md |
| Dev model (qwen3.5:9b) | L2 + L4 | titane.instructions.md + ollama-dev-chat-boundary.agent.md |
| IPC whitelist | L2 + CLAUDE.md | titane.instructions.md + CLAUDE.md |
| CSS import ordering | CLAUDE.md | .claude/rules/frontend-runtime.md |
| Alias parity | CLAUDE.md | .claude/rules/frontend-runtime.md |
| Logger signature | CLAUDE.md | .claude/rules/frontend-runtime.md |
| AutoHeal | L1 Rule 10 + CLAUDE.md | Both |
| MCP boundary | L4 | ollama-dev-chat-boundary.agent.md |
| NEXUS phase lock | .titane-dev/ (this session) | nexus_phase_lock.md |
| Surface Decision Matrix | .titane-dev/ (this session) | 00_scope_sentinel.md |

## No Conflicting Authority Found

No two layers define contradictory rules for the same topic.
Lower layers (L2–L5) correctly extend without redefining L1 invariants.
CLAUDE.md and .claude/rules/ are additive and consistent with L1.
