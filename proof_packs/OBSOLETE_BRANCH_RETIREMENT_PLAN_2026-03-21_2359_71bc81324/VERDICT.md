# OBSOLETE BRANCH RETIREMENT PLAN

- Date: 2026-03-21
- Base evaluated: MAIN @ 71bc81324
- Verdict: PASS

## Branches to retire

- origin/copilot/prepare-copilot-execution
- origin/dependabot/npm_and_yarn/pnpm-minor-patch-ce61d3b616

## Why retire them

### origin/copilot/prepare-copilot-execution

- Divergence against current MAIN: `812 behind / 2 ahead`
- The branch is an old bootstrap/proof-infrastructure branch with wide surface additions under `checks/`, `templates/`, `docs/`, and bootstrap scripts.
- Its payload predates the current governed repository shape and overlaps with infrastructure that already exists in evolved form on MAIN.
- It also collides with paths already present and in active use, including `scripts/run_all.sh` and `scripts/run_all.ps1`.
- This is not a safe late merge candidate; it is a superseded historical branch.

### origin/dependabot/npm_and_yarn/pnpm-minor-patch-ce61d3b616

- Divergence against current MAIN: `773 behind / 1 ahead`
- The branch touches only `package.json` and `pnpm-lock.yaml`.
- The proposed dependency set is older than the dependency state now present on MAIN after safe integration.
- Merging it would reintroduce stale dependency movement rather than advance the graph.
- This is a superseded dependency branch, not a useful merge candidate.

## Explicit non-retirement

- `origin/dependabot/github_actions/actions/checkout-6` is not part of this retirement plan.
- Reason: it is still a potentially useful branch, but it needs semantic conflict resolution across workflows rather than deletion-by-default.

## Safe retirement commands

- Remove local tracking branches if created later:
  - `git branch -D copilot/prepare-copilot-execution`
  - `git branch -D dependabot/npm_and_yarn/pnpm-minor-patch-ce61d3b616`
- Remove remote branches intentionally:
  - `git push origin --delete copilot/prepare-copilot-execution`
  - `git push origin --delete dependabot/npm_and_yarn/pnpm-minor-patch-ce61d3b616`

## Preconditions before remote deletion

- Keep `origin/dependabot/github_actions/actions/checkout-6` untouched.
- Preserve the proof files created in this session.
- Confirm no open PR still targets either branch.
