# Rollback — Instruction System Alignment 2026-05-06

## Status: NOT NEEDED

No mutations were applied during this session. VERDICT is CLEAN.

## If Needed (Hypothetical)

Since no files were modified during this session, no rollback is required.

Should any future patch be applied to the instruction system, the rollback commands would be:

```bash
git restore -- .github/copilot-instructions.md
git restore -- .github/instructions/
git restore -- .github/agents/
git restore -- .github/prompts/
git restore -- AGENTS.md src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md
git restore -- governance/
git restore -- scripts/verify/
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

If a commit was made:
```bash
git revert <commit_sha>
```

## HEAD SHA at Session Start

`8072a53a0d4f9e32a2f54cb187bcd5e7377f48bd`
