# Prompt: Simple Fast Session

## Scope

Use PATH_SIMPLE for local, low-risk changes.

## Steps

1. Read only nearest path rules.
2. Touch minimal files.
3. Run targeted checks only.
4. AutoHeal gate (Rule 10 — mandatory even for simple sessions):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

5. Report concise proof and rollback.

## Exit criteria

- No contradiction detected.
- No global doctrine changes.
- `detect_recurrence.sh` exits 0.
