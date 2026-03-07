# Prompt: Audit Instructions

## Scope

Audit the instruction system only.

## Inputs

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `scripts/verify*.sh`, `scripts/map_refresh.sh`, `scripts/autoheal/*`

## Steps

1. Run bootstrap reality commands.
2. Build inventory by layer.
3. Detect contradictions and duplications.
4. Classify each issue: rewrite, move, delete, mechanize.
5. Produce gate table with PASS/FAIL/BLOCKED.

## Output

- Short findings list with file references.
- Action plan by file.
- Rollback commands.
