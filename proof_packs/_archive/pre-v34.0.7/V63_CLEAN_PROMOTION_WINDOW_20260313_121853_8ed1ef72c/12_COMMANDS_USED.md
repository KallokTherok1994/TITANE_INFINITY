# 12 - Commands Used

Core commands executed in V63:

```bash
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git rev-list --left-right --count origin/MAIN...HEAD
git status --porcelain=v1
git diff --name-only
git ls-files --others --exclude-standard
git stash push -u -- <targeted pathspec>
git switch -c v63_clean_promotion_window origin/MAIN
git stash pop stash@{0}
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm -s verify:registry
```

Conditional execution commands NOT run (HOLD):
- `git commit`
- `git push`
- `pnpm run build:production`
- `./mega-deploy.sh`
