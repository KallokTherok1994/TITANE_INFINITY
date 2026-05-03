# 05 SCOPE AND LOCKS

## Scope

Final governed certification cycle only.

Allowed actions in scope:

- establish repo truth
- isolate execution truthfully
- run post-merge verification
- fix proven machine-fixable compile blockers only
- produce proof pack
- decide BUILD_GO and DEPLOY_GO honestly

Disallowed actions during this cycle:

- mutate original dirty workspace
- refactor product scope
- force prod build or deploy on narrative confidence
- commit unrelated local dirt

## Active locks

- One execution authority: fresh isolated worktree on `028580016`
- One blocker at a time policy respected
- Stop-the-line currently active on failing Rust lib test and E2E authorization gate
