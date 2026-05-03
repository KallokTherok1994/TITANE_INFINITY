# 06 CI FAILURE TRUTH

Target workflow: `Rust Tests (Docker)`

## Verified failing runs and exact failure signatures

1. Run `22778120902` (baseline failure)
- Step: `Run Cargo Check`
- Error: `feature edition2024 is required` (Cargo 1.83.0)
- Evidence: `raw_rust_docker_run_failed.log`, `raw_rust_docker_run_failed_hits.txt`

2. Run `22786897347`
- Step: `Run Cargo Check`
- Error: `rustc 1.85.1 is not supported` by `sysinfo/time` crates (need >= 1.88)
- Evidence: `raw_rust_docker_run_22786897347.log`

3. Run `22786981815`
- Step: `Run Cargo Check`
- Error: linker missing (`collect2: fatal error: cannot find 'ld'`)
- Evidence: `raw_rust_docker_run_22786981815.log`

4. Run `22787082843`
- Step: `Run Cargo Check`
- Error: `alsa-sys` missing system library (`alsa.pc` not found)
- Evidence: `raw_rust_docker_run_22787082843.log`

5. Run `22787193341`
- Step: `Run Cargo Check`
- Error: `resource path ../dist doesn't exist` (Tauri build script)
- Evidence: `raw_rust_docker_run_22787193341.log`

6. Run `22787313247` (latest)
- Step: `Run Cargo Check`
- Error class: Rust compile errors `E0433` in project code (`could not find commands in titane_infinity`)
- Evidence: `raw_rust_docker_run_22787313247.log`, `raw_rust_docker_run_22787313247_hits.txt`

Status: `FAIL` (workflow still red on latest head)

