# Prompt: Simple Fast Session

## Scope

Use PATH_SIMPLE for local, low-risk changes.

## Steps

1. Read only nearest path rules.
2. If Explore is unavailable because of quota, continue immediately with canonical local discovery via search_subagent or direct workspace search tools; record the quota as external truth and do not block a simple session on that condition alone.
3. Touch minimal files.
4. Run targeted checks only.
5. AutoHeal gate (Rule 10 — mandatory even for simple sessions):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

6. Report concise proof and rollback.

## Exit criteria

- No contradiction detected.
- No global doctrine changes.
- `detect_recurrence.sh` exits 0.
