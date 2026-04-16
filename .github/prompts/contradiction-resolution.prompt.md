# Prompt: Contradiction Resolution

## Scope

Resolve doctrine conflicts across layers using canonical precedence.

## Inputs

- Conflicting files/rules
- `governance/layer_priority.yaml`
- Runtime proof and validator outputs

## Steps

1. Identify the highest-priority applicable layer.
2. Apply minimal fix in lower layers only.
3. If unresolved, classify `BLOCKED_DOCTRINE`.
4. AutoHeal gate (Rule 10 — mandatory after any modification):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

5. Append AutoHeal entry to canonical AutoHeal registry if any file was patched.

## Output

- Winner layer rationale.
- Minimal patch list.
- AutoHeal entry confirmation.
- Rollback commands.
