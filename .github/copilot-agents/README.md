# .github/copilot-agents/ — COPILOT-XS System (Legacy Surface)

## Status: LEGACY — Not the governed agent surface

This directory is part of the **copilot-xs** system (generic Copilot workflow helpers).

## Canonical governed agent surface

The **canonical TITANE-governed agents** live in:

```
.github/agents/
```

Those agents are registered in `.github/copilot-routing.json` and enforced by the kernel at `.github/copilot-instructions.md`.

## This directory

| File                           | Purpose                        | Authority       |
| ------------------------------ | ------------------------------ | --------------- |
| `agent-factory.agent.md`       | Generic agent factory doc      | copilot-xs only |
| `architect.agent.md`           | Generic arch guidance doc      | copilot-xs only |
| `guardian.agent.md`            | Generic quality doc            | copilot-xs only |
| `orchestrator.agent.md`        | Generic gate doc               | copilot-xs only |
| `dependency-guardian.agent.md` | Generic dep guidance doc       | copilot-xs only |
| `agents/`                      | Role-based generic specialists | copilot-xs only |

## Rule

If a name appears in both `.github/agents/` and here, the `.github/agents/` version governs.
This directory has no execution authority over TITANE runtime decisions.
