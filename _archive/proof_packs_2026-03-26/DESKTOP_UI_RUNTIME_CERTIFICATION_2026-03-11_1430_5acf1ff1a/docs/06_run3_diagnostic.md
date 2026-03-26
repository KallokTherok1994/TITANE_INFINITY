# 06 — RUN3 DIAGNOSTIC PROGRESSIF

## Spec v3 (ESM, sans browser.url() initial, checkpoints 5/10/16/22s)
- exit=0, 7/7 passes (tous collect-only, pas d'assert bloquant)
- Duree: 26.3s

## Checkpoints
| CP | elapsed | entry_ts | splash_display | classesCount | visibleBtns |
|----|---------|----------|----------------|--------------|-------------|
| 1  | +5s     | false    | flex           | 2            | 0           |
| 2  | +10s    | false    | flex           | 2            | 0           |
| 3  | +16s    | false    | flex           | 2            | 0           |
| 4  | +22s    | false    | flex           | 2            | 0           |

## Verdict interne run3
CRITICAL_BOOT_NOT_STARTED — entry.ts never ran

## Artefacts generes
- artifacts/run3/run3_cert_metrics.json
- artifacts/run3/screens/*.png (4 checkpoints + S6 + CP5)
- artifacts/run3/wdio.log
- artifacts/run3/tauri_driver.log
