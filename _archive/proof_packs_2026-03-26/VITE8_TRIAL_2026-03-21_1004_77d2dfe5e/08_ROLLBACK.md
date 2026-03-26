# Rollback Plan

## If rollback needed after merge to MAIN

### Revert the merge commit
```bash
git revert 77d2dfe5e --no-commit
git commit -m "revert(build): rollback vite 8 migration — champion vite 7 restored"
```

### Or hard reset (destructive — only if no one else has pulled)
```bash
git reset --hard fd850f423
git push origin MAIN --force-with-lease
```

### Restore packages
```bash
pnpm add -D vite@^7.3.1 @vitejs/plugin-react@^5.1.4
```

## Delete trial branch (already done post-merge)
```bash
git branch -D trial/vite8-migration
```

## Champion baseline (pre-migration)
- Commit: fd850f423
- vite: 7.3.1
- @vitejs/plugin-react: 5.1.4
