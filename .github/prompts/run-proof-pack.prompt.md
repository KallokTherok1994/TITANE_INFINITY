# Prompt: Run Proof Pack

## Scope

Produce a complete proof pack for one governed session.

## Inputs

- Session objective
- Commands executed
- Check outputs
- Gates summary

## Steps

1. Create proof pack directory with timestamp and sha.
2. Populate mandatory files.
3. Record commands and checks with exit codes.
4. Fill gates report and rollback.
5. Run AutoHeal gate (Rule 10 — mandatory):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

6. Append AutoHeal entry to the canonical AutoHeal registry (Rule 10 schema: id, date, scope, symptom, root_cause, fix, prevention_test, commands, files_changed, rollback — prevention_test must mention detect_recurrence).
7. Emit one unique final verdict.

## Output

- Complete proof-pack path.
- Gate table (all validators PASS/FAIL/BLOCKED).
- AutoHeal entry confirmation.
- Final verdict and next action.
