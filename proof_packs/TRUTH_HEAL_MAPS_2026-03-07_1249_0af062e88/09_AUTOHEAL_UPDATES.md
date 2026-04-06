Status: PASS

Append-only updates applied:
- `scripts/autoheal/autoheal_rules.jsonl`: appended `AH-2026-03-07-0084`.
- `registry/autofix-autoheal-rules.jsonl`: appended `AH-0020`.

New entries coverage:
- Active tracked files listed by validator fail output are included in latest signature capture.
- Rollback commands included in both entries.

Validation after append:
- `node scripts/qa/check_autofix_autoheal_registry.mjs` -> PASS.
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS.
- `bash scripts/verify_instructions.sh` -> PASS.

Schema notes:
- Operational canonical path remains `scripts/autoheal/autoheal_rules.jsonl`.
- `registry/autofix-autoheal-rules.jsonl` remains supporting mirror with richer schema.
