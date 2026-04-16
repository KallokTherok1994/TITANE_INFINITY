# Prompt: Heavy Runtime Session

## Scope

Use PATH_HEAVY for instruction architecture, runtime, IPC, E2E, release, or contradiction tasks.

## Steps

1. Full bootstrap reality capture.
2. Layer analysis and conflict checks.
3. Broader validator run:

```bash
bash scripts/verify_instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify-agent-tooling.sh
bash scripts/verify/scorecard-instructions.sh
```

4. Complete proof-pack discipline.
5. AutoHeal gate (Rule 10 — mandatory):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
```

6. Append AutoHeal entry to the canonical AutoHeal registry for every code modification (Rule 10).
7. Final unique verdict.

## Exit criteria

- All applicable gates resolved as PASS/FAIL/BLOCKED.
- `detect_recurrence.sh` exits 0.
- Rollback documented.
