# 10 REMOTE RERUN STATUS

## Targeted workflow dispatches (Rust Tests (Docker))

- `22786897347` (head `186fe020c`) -> `FAIL` (rustc 1.85.1 unsupported)
- `22786981815` (head `13578aa5d`) -> `FAIL` (missing linker `ld`)
- `22787082843` (head `68bcc6eb9`) -> `FAIL` (missing `alsa.pc`)
- `22787193341` (head `4f5f073da`) -> `FAIL` (`../dist` missing)
- `22787313247` (head `47779f2df`) -> `FAIL` (Rust compile `E0433` in project code)

Evidence:

- `raw_rust_docker_dispatch_*.txt`
- `raw_rust_docker_dispatch_*_runs.json`
- `raw_rust_docker_run_*_poll.json`
- `raw_rust_docker_run_*_hits.txt`
- `raw_gh_run_list_branch_final.json`

Status: `FAIL` (latest targeted rerun still failing)

