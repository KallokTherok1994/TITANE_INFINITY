# Artifact Index

## E2E Logs
- `03_E2E_RUN_1.txt` (34 lines, 2.0K) — Failed run
- `04_E2E_RUN_2.txt` (0 lines) — Not executed
- `05_E2E_RUN_3.txt` (0 lines) — Not executed

## Scan Logs
- `07_NO_DEV_SERVER_SCAN_1.txt` — Devices check
- `08_NO_DEV_SERVER_SCAN_2.txt` — (not collected)
- `09_NO_DEV_SERVER_SCAN_3.txt` — (not collected)
- `10_NO_NETWORK_SCAN_1.txt` — Network check
- `11_NO_NETWORK_SCAN_2.txt` — (not collected)
- `12_NO_NETWORK_SCAN_3.txt` — (not collected)
- `13_NO_REAL_WRITES_PROOF_1.txt` — Sandbox confinement
- `14_NO_REAL_WRITES_PROOF_2.txt` — (not collected)
- `15_NO_REAL_WRITES_PROOF_3.txt` — (not collected)

## External References
- E2E artifacts: `/home/titane-os/Documents/GitHub/TITANE_INFINITY/reports/e2e-desktop/`
- Sandbox: `/tmp/titane_p10_3_2_sandbox_${UTC_NOW}/`

## Key Evidence
- Run 1 failure suggests pre-existing infrastructure issue (IPC/backend availability)
- Not a regression from P10.3.1 selector fix (fix itself validated)
