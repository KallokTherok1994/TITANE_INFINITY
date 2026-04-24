# 03_ENV_REPORT

Date: 2026-03-14
Workspace: `/home/titane-os/Documents/GitHub/TITANE_INFINITY`
OS: Linux

## Toolchain

- Node.js: `v24.0.0`
- pnpm: `10.30.2`
- cargo: `1.94.0 (85eff7c80 2026-01-15)`
- rustc: `1.94.0 (4a4ef493e 2026-03-02)`

Proof:

- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/05_node_v.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/06_pnpm_v.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/07_cargo_v.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/08_rustc_v.txt`

## Repository State During Bootstrap

- Branch: `MAIN`
- HEAD short: `936d25f26`
- Branch tracking: `origin/MAIN` (per git status capture)

Proof:

- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/01_git_status.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/02_git_rev_short.txt`

## Scan Volume Snapshot

- `09_rg_admin_src.txt`: `9223` lines
- `10_rg_router_src.txt`: `1095` lines
- `11_rg_invoke_src.txt`: `18331` lines
- `12_rg_tauri_commands.txt`: `10726` lines
- `13_rg_provider_omega.txt`: `7928` lines
- `14_rg_audio.txt`: `96` lines
- `15_rg_boot_double.txt`: `666` lines
- `16_rg_storage_undefined.txt`: `5234` lines
- `17_rg_todo_stub.txt`: `2861` lines
- `18_rg_data_testid.txt`: `473` lines

Proof:

- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/19_scan_counts.txt`

## Execution Integrity

- Bootstrap exit codes: all required commands `0`
- Proof index: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/21_exit_codes_summary.txt`

Status:

- Environment capture complete: `PASS`
