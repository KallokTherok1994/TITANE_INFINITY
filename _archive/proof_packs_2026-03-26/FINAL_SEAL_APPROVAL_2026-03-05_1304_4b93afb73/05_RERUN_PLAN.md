# RERUN PLAN

## Plan

1. Identify exact workflow name from `gh workflow list`.
2. Trigger rerun on exact ref (`MAIN`).
3. Poll max `20` attempts, sleep `15s`.
4. Accept only `status=completed` + `conclusion=success`.

## Executed commands

```bash
gh workflow list --all --json name,id,path,state
gh workflow run "GitGuardian Secret Scanning" --ref MAIN
gh run list --workflow "GitGuardian Secret Scanning" --limit 30 --json databaseId,headSha,status,conclusion,url,createdAt
```

Workflow resolved:

- Name: `GitGuardian Secret Scanning`
- Id: `223004385`
- Path: `.github/workflows/gitguardian.yml`

Execution status: `DONE`
