# Gates Report

- generated_at_utc: 2026-03-05T12:42:10Z

## Executed Gates

- `G_DISCOVERY_MAP_PRESENT`: PASS (`02_DISCOVERY_MAP.md`)
- `G_COMMANDS_USED_PRESENT`: PASS (`04_COMMANDS_USED.md`)
- `G_CHAT_MAP_PRESENT`: PASS (`docs/MAP_UI_CHAT.md`)
- `G_CHAT_COVERAGE_JSON_PRESENT`: PASS (`reports/UI_CHAT_COVERAGE.json`)
- `G_UNIT_X3_PASS`: PASS (`08_TESTS_X3.log`, `unit_chat` run1..run3 exit=0)
- `G_E2E_FULL_X3_PASS`: PASS (`E2E_RUNS_X3.log`, `e2e_full_fix` run1..run3 exit=0)
- `G_SMOKE_X3_PASS`: PASS (`E2E_RUNS_X3.log`, `e2e_smoke_fix3` run1..run3 exit=0)
- `G_AH_RULE_CAPTURED_FOR_EACH_FIX`: PASS (`scripts/autoheal/autoheal_rules.jsonl`, IDs 0021..0023)
- `G_AH_RECURRENCE_GUARD_PASS`: PASS (`bash scripts/autoheal/detect_recurrence.sh`)
- `G_VERIFY_INSTRUCTIONS_PASS`: PASS (`bash scripts/verify_instructions.sh`)

## Stabilization Trace

- Initial failing attempts captured and remediated:
  - `e2e_full` run2 failed (`invalid session id`)
  - `e2e_smoke_fix` run1 failed (`page activation failed for optimization`)
  - `e2e_smoke_fix2` run2 failed (`invalid session id`)
- Final passing campaigns:
  - `e2e_full_fix` 3/3 PASS
  - `e2e_smoke_fix3` 3/3 PASS
