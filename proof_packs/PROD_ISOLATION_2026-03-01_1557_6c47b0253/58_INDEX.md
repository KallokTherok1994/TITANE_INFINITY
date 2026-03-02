# INDEX

proof_pack: PROD_ISOLATION_2026-03-01_1557_6c47b0253
updated_at: 2026-03-02T00:41:30Z
scope: isolation + causal proof for production infinite-loading signal

## Core narrative
- Baseline: `00_BASELINE.md`
- Reproduction: `01_REPRO.md`
- Instrumentation: `02_INSTRUMENTATION.md`
- Root cause evolution: `03_ROOT_CAUSE.md`
- Applied fixes: `04_FIX.md`
- Gates: `06_GATES.md`
- Rollback: `07_ROLLBACK.md`
- Final verdict: `08_VERDICT.md`

## Runtime evidence
- Legacy x3 probe: `05_RUN_X3.log`, `11_RUN_X3_REBUILT.log`, `23_RUN_X3_BOOT_PROBE.log`, `41_RUN_X3_DOM_STAGE.log`
- Desktop same-context reference run: `42_DESKTOP_DIAGNOSTICS.log`, `43_DESKTOP_WDIO.log`, `44_DESKTOP_TAURI_DRIVER.log`
- Desktop timeout batch: `48_DESKTOP_TIMEOUT_RUN_1.log`, `48_DESKTOP_TIMEOUT_RUN_2.log`, `48_DESKTOP_TIMEOUT_RUN_3.log`
- Desktop timeout WDIO logs: `49_DESKTOP_TIMEOUT_RUN_1_WDIO.log`, `49_DESKTOP_TIMEOUT_RUN_2_WDIO.log`, `49_DESKTOP_TIMEOUT_RUN_3_WDIO.log`
- Desktop timeout tauri logs: `50_DESKTOP_TIMEOUT_RUN_1_TAURI.log`, `50_DESKTOP_TIMEOUT_RUN_2_TAURI.log`, `50_DESKTOP_TIMEOUT_RUN_3_TAURI.log`
- Strict x3 summary: `57_DESKTOP_X3_STRICT_SUMMARY.log`

## Final status (pack scope)
- Runtime same-context AppImage: PASS
- X3 strict (3 complete runs): PASS
- Seal: NON SCELLÉ (global sealing out of this pack scope)
