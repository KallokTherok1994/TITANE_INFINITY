# Local AGENTS - scripts

## Authority

Validation and tooling local discipline — scripts/, build tooling, CI gates.

## Rules

- Non-destructive behavior by default — validators must never modify source files.
- Exit codes must reflect actual status: 0 = PASS, non-zero = FAIL.
- Stable `PASS: <id>` / `FAIL: <id>` / `BLOCKED: <id>` output lines for machine parsing.
- Every new validator script: add to `scripts/verify_instructions.sh` or relevant gate suite.
- Every new gate: add corresponding test or proof of trigger/exit (Rule 16).
- Auto anti-regression: run `detect_recurrence.sh` after every script fix (Rule 10).
- New scripts touching `src/` or `src-tauri/` surfaces require mapping doc update (Rule 15).

## Chain-of-Thought Validation

1. Does the script exit 0 on PASS and non-zero on FAIL? Verify both paths.
2. Does it emit `PASS: <ID>` or `FAIL: <ID>` lines for machine parsing?
3. Does it clean up any temp files on failure?
4. Is it referenced (or skipped with justification) in `scripts/verify_instructions.sh`?
5. Is there an AutoHeal entry if the script was a fix (Rule 10)?

## Tooling (pnpm-only)

```bash
bash scripts/verify_instructions.sh
bash scripts/verify/scorecard-instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify-agent-tooling.sh
bash scripts/autoheal/detect_recurrence.sh
```

## AutoHeal Gate (Rule 10 — mandatory)

After every fix touching `scripts/`:

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

## Integration Patterns

- New validator: create `scripts/verify/verify-<name>.sh`, add `PASS/FAIL` output, register in `scripts/verify_instructions.sh` or the relevant gate, add probe test.
- New autoheal entry: ensure valid JSON with all required fields, `prevention_test` must mention `detect_recurrence`.
- New build script: add smoke test artifact check, add to CI workflow if needed.
- New gate: document trigger conditions, exit codes, and link to AutoHeal entry.

## Proofs

- Script outputs with exit codes.
- References to touched files.
- `scripts/verify_instructions.sh` still exits 0 after changes.

## Not in scope

- UI design or product content policy.
