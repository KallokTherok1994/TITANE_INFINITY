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

## Output
- Winner layer rationale.
- Minimal patch list.
- Rollback commands.
