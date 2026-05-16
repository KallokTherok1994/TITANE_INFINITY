# Rollback Instructions — Frontend UI/UX Redesign Seal

## Backup branch
`backup/frontend-before-ui-redesign` (commit cee8f189d)

## Current branch
`MAIN`

## To restore frontend to pre-redesign state

```bash
# Option 1: checkout the backup branch (read-only inspection)
git checkout backup/frontend-before-ui-redesign

# Option 2: revert to backup state on MAIN (destructive — confirm before running)
git checkout MAIN
git revert <seal-commit-hash>..HEAD
```

## To revert the seal commit specifically

After getting the seal commit hash from `git log --oneline`:

```bash
git revert <seal-commit-hash>
```

## Key files to revert if partial rollback needed

- `tailwind.config.ts` — restores hardcoded hex values
- `src/styles/css-vars.css` — removes light mode token block
- `src/features/design-center/providers/UIThemeProvider.tsx` — removes colorMode
- `src/styles/animations.css` — restores 500ms transitions
- `src/services/knowledge_governance/KnowledgeGovernanceContract.ts` — remove biodiversity

## Note
The backup branch `backup/frontend-before-ui-redesign` was created before the redesign and represents the complete pre-redesign frontend state.
