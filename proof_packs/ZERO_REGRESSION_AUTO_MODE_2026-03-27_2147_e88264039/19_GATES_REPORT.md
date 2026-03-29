# Gates Report

| Gate | Blocking | Passed | Evidence |
|------|----------|--------|----------|
| G_BOOT_TRUTH | true | true | 6 lanes loaded and executed |
| G_DISCOVERY_TRUTH | true | true | Discovery performed during PLAN phase |
| G_CHAMPION_BASELINE_DEFINED | true | true | Baseline at /home/titane-os/Documents/GitHub/TITANE_INFINITY/evals/baselines/v1/champion_baseline.json |
| G_EVAL_DATASET_VERSIONED | true | true | All v1 datasets present |
| G_SCORECARDS_PRESENT | true | true | All 6 scorecards present |
| G_CRITICAL_CHAINS_PASS | true | false | Lane B: FAIL (0/8) |
| G_HONESTY_NO_REGRESSION | true | false | 3 violations: AV-01, AV-07, AV-08 |
| G_MEMORY_NO_REGRESSION | true | false | Memory checks: FAIL |
| G_ROUTER_NO_REGRESSION | true | true | Router truth validated at IPC contract level |
| G_AUTOHEAL_NO_MASKING | true | true | Auto-heal truth validated at engine level |
| G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION | true | true | Desktop flow validated at Tauri IPC level |
| G_X3_STABILITY | true | true | X3: All runs match |
| G_ROLLBACK_READY | true | true | Rollback: git reset --hard v28.0.0 |
| G_PROOF_PACK_COMPLETE | true | false | Proof pack not generated |

**All blocking passed**: false
**Promotion allowed**: false
