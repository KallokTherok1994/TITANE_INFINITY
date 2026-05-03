# RUNS ACTION REQUIRED

Target SHA: `4b93afb738316284ac529243fa23b799c2b2734d`
Target branch: `MAIN`

Command:

```bash
gh run list --limit 50 --json databaseId,headSha,conclusion,status,event,workflowName,displayTitle,createdAt,url
```

Current-SHA runs observed:

| workflowName | runId | status | conclusion | url | reason |
|---|---:|---|---|---|---|
| GitGuardian Secret Scanning | 22729896781 | completed | success | https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22729896781 | workflow_dispatch rerun |
| GitGuardian Secret Scanning | 22729883211 | completed | cancelled | https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22729883211 | previous dispatch replaced |
| Codespaces Prebuilds | 22729879457 | in_progress |  | https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22729879457 | unrelated prebuild run |

Filter rule applied:

- `headSha == target SHA`
- status/conclusion contains `action_required|waiting`

Filtered result:

```json
[]
```

Conclusion: no `action_required` gate on exact SHA.
