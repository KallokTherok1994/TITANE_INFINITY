# Gates Report

| Gate | Status | Evidence |
|---|---|---|
| MAIN_SYNC_FF_ONLY | FAIL | `03_PRECHECKS.md` (`git pull --ff-only origin MAIN` rejected due local changes) |
| BOOTSTRAP_GIT_CLEAN_REQUIRED | FAIL | `01_BOOTSTRAP.md` (`git status` shows modified/untracked files) |
| G_RING_INTEGRITY_RUST | BLOCKED | Not executed because fail-fast stop |
| G_ONE_DOOR | BLOCKED | Not executed because fail-fast stop |
| G_UI_NO_WEB | BLOCKED | Not executed because fail-fast stop |
| G_IPC_CANONICAL | BLOCKED | Not executed because fail-fast stop |
| G_TIMEOUTS | BLOCKED | Not executed because fail-fast stop |
| LINT_X3 | BLOCKED | `10_LINT_X3.log` intentionally not run |
| FORMAT_X3 | BLOCKED | `11_FORMAT_X3.log` intentionally not run |
| TYPECHECK_X3 | BLOCKED | `12_TYPECHECK_X3.log` intentionally not run |
| TESTS_X3 | BLOCKED | `13_TESTS_X3.log` intentionally not run |
| CARGO_TESTS_X3 | BLOCKED | `14_CARGO_TESTS_X3.log` intentionally not run |
| BUILD_X3 | BLOCKED | `15_BUILD_X3.log` intentionally not run |
| E2E_X3 | BLOCKED | `16_E2E_X3.log` intentionally not run |
| GITGUARDIAN | BLOCKED | `07_GITGUARDIAN_REPORT.md` |
| CI_APPROVAL | BLOCKED | `08_CI_APPROVAL_REPORT.md` |
