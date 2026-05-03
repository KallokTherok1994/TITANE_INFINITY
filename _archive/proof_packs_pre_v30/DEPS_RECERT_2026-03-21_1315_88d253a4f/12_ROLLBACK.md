# Rollback Plan

**Date:** 2026-03-21  
**Scope:** Dependency update rounds 1-3

---

## Rollback Command (full round 1-3 revert)

To revert all dep update rounds to the state before round 1:

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Find the commit before round 1 dep updates (9b50cc67e was the patch/minor base)
# Round 1 is part of commit 9b50cc67e, round 2 = e9ee8efb8, round 3 = 60c11fdf1

# To revert rounds 2+3 only (keep round 1):
git revert --no-commit 60c11fdf1
git revert --no-commit e9ee8efb8
git commit -m "revert(deps): roll back rounds 2+3 dep updates

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Then reinstall:
source ~/.nvm/nvm.sh && nvm use 20 --silent
pnpm install
```

## Rollback Command (round 3 only)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git revert --no-commit 60c11fdf1
git commit -m "revert(deps): roll back round 3 (jsdom/eslint bump)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
source ~/.nvm/nvm.sh && nvm use 20 --silent && pnpm install
```

## Rollback Verification

After rollback, verify:
```bash
source ~/.nvm/nvm.sh && nvm use 20 --silent
pnpm vitest run --reporter=dot 2>&1 | tail -5
bash scripts/verify_instructions.sh 2>&1 | tail -3
bash scripts/autoheal/detect_recurrence.sh 2>&1 | tail -3
```

## Package.json Restore (emergency)

```bash
git restore package.json pnpm-lock.yaml
pnpm install
```

---

## Current Baseline (what to restore TO if rollback is needed from FUTURE changes)

- eslint: 9.39.4
- jsdom: 29.0.1
- vitest: 4.0.18 (pinned)
- @types/node: 25.5.0
- storybook: 10.3.1
- vite: 7.3.1 (DO NOT upgrade without vite8+plugin-react6 coordinated plan)
- @vitejs/plugin-react: 5.1.4 (DO NOT upgrade without vite 8)
