# Prompt: Audit Instructions

## Scope

Audit the instruction system only.

## Inputs

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `.github/prompts/*.prompt.md`
- `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`
- `scripts/verify*.sh`, `scripts/map_refresh.sh`, `scripts/autoheal/*`

## Steps

1. Run bootstrap reality commands.
2. Build inventory by layer.
3. Detect contradictions and duplications.
4. Classify each issue: rewrite, move, delete, mechanize.
5. Run all validators and record outputs:

```bash
bash scripts/verify_instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify_kernel_budget.sh
bash scripts/verify/scorecard-instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

6. Produce gate table with PASS/FAIL/BLOCKED.

## Output

- Short findings list with file references.
- Action plan by file.
- Gate table with all validator results.
- Rollback commands.
