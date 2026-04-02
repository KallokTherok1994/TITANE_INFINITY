# TEST MATRIX

## Desktop E2E Matrix

- `FAIL` historical: smoke x3 first cycle (`logs/smoke_x3_summary.log`: run1 exit=1, overall_exit=1)
- `PASS` current: smoke x3 rerun (`logs/smoke_x3b_summary.log`: run1/2/3 exit=0, overall_exit=0)
- `PASS` current: full x3 (`logs/full_x3_summary.log`: run1/2/3 exit=0, overall_exit=0)
- `PASS`: no-skips gate over produced logs (`logs/no_skips_gate.md`, `NO_SKIPS_PASS`)

## Gate Matrix

- `PASS`: `logs/g_frontend_no_web.log`
- `PASS`: `logs/g_network_one_door.log`

## Build Matrix

- `PASS`: build x3 via `logs/build_x3_summary.log` (run1/2/3 exit=0, overall_exit=0)

