# 06_MOVES_EXECUTED.md — Déplacements exécutés

**Opération**: `git mv` (historique préservé)  
**Date**: 2026-03-22 | **SHA**: b9aae0cc8

## Groupe 1: RELEASE_v28.{6..80}.0_SEALED.txt → _archive/01_root_reports/releases/

75 fichiers déplacés (v28.6.0 à v28.80.0)

```bash
for v in $(seq 6 80); do
  git mv "RELEASE_v28.${v}.0_SEALED.txt" "_archive/01_root_reports/releases/RELEASE_v28.${v}.0_SEALED.txt"
done
# Résultat: 75/75 fichiers déplacés ✓
```

## Groupe 2: RELEASE_ARTIFACTS_CHECKSUMS_28.{6..80}.0.txt → _archive/01_root_reports/releases/

75 fichiers déplacés (v28.6.0 à v28.80.0)

```bash
for v in $(seq 6 80); do
  git mv "RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt" "_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt"
done
# Résultat: 75/75 fichiers déplacés ✓
```

## Vérification post-déplacement

```
ls _archive/01_root_reports/releases/ | wc -l → 150 ✓
ls RELEASE_v28.*_SEALED.txt | wc -l → 4 restants (v28.0.0, v28.5.0, v28.81.0, v28.82.0) ✓
ls RELEASE_ARTIFACTS_CHECKSUMS*.txt | wc -l → 4 restants ✓
```

## Fichiers racine conservés après déplacement

```
RELEASE_v27.0.3_SEALED.txt
RELEASE_v28.0.0_SEALED.txt
RELEASE_v28.5.0_SEALED.txt
RELEASE_v28.81.0_SEALED.txt
RELEASE_v28.82.0_SEALED.txt
RELEASE_ARTIFACTS_CHECKSUMS.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt
```

---
## PHASE 2 — Root Residue Cleanup (2026-03-22)

### Batch A: Log/Transient files → _archive/04_transient_snapshots/
| Source | Destination | Class | Reason |
|--------|-------------|-------|--------|
| build_log.txt | _archive/04_transient_snapshots/ | G GENERATED_TRANSIENT | Jan 16 vite/tauri session log, not referenced |
| dev_tauri_clean_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 dev session log |
| dev_tauri_fixed_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 dev session log |
| dev_tauri_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 dev session log |
| dev_tauri_npm_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 dev session log |
| final_test_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 test session log |
| final_verification_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 verification log |
| install_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 install log (335 bytes) |
| minimal_config_test_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 config test log |
| tauri_test_clean_config.txt | _archive/04_transient_snapshots/ | G | Jan 16 tauri test config log |
| vite_clean_test.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log |
| vite_direct_log.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log (108 bytes) |
| vite_minimal_test.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log |
| vite_no_tsconfig_test.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log |
| vite_standalone_test.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log |
| vite_standalone_test2.txt | _archive/04_transient_snapshots/ | G | Jan 16 vite test log (duplicate) |

Rollback batch A: `for f in build_log.txt dev_tauri_clean_log.txt dev_tauri_fixed_log.txt dev_tauri_log.txt dev_tauri_npm_log.txt final_test_log.txt final_verification_log.txt install_log.txt minimal_config_test_log.txt tauri_test_clean_config.txt vite_clean_test.txt vite_direct_log.txt vite_minimal_test.txt vite_no_tsconfig_test.txt vite_standalone_test.txt vite_standalone_test2.txt; do git mv _archive/04_transient_snapshots/$f $f; done && git commit -m "chore(rollback): restore transient log files"`

### Batch B: Historical campaign/session .txt → _archive/01_root_reports/
| Source | Destination | Class | Reason |
|--------|-------------|-------|--------|
| CAMPAIGN_COMPLETE_v27.0.2.txt | _archive/01_root_reports/ | E HISTORICAL_ARCHIVE_USEFUL | v27 campaign report, not live-referenced |
| MISSION_COMPLETE.txt | _archive/01_root_reports/ | E | Jan 18 session summary, referenced only in inventory snapshots |
| SESSION_COMPLETE.txt | _archive/01_root_reports/ | E | Feb 2 session summary |
| PHASE2_COMPLETED.txt | _archive/01_root_reports/ | E | E2E phase completion report |
| SINGULARITYBRIDGE_DISABLED.txt | _archive/01_root_reports/ | E | Jan 2 disable record |
| STANDARDS_MODE_VERIFICATION.txt | _archive/01_root_reports/ | E | Jan 2 verification record |
| CONSOLE_ERRORS_FIXED.txt | _archive/01_root_reports/ | E | Jan 2 fix record |
| FINAL_STATUS_SNAPSHOT.txt | _archive/01_root_reports/ | E | Jan 31 snapshot |
| DEPLOYMENT_READINESS_v27.0.3.txt | _archive/01_root_reports/ | E | v27 deployment readiness |
| DEPLOYMENT_READY_v27.0.2.txt | _archive/01_root_reports/ | E | v27 deployment ready |
| FINAL_DEPLOYMENT_STATUS_v27.0.2.txt | _archive/01_root_reports/ | E | v27 final deployment status |
| P1_BUILD_PROOF.txt | _archive/01_root_reports/ | B SEALED_PROOF | Feb 5 P1 build proof (referenced in REPORTS_INDEX_SESSION_2.md as historical) |
| DEEP_ANALYSIS_EXECUTIVE_SUMMARY_v37.0.0.txt | _archive/01_root_reports/ | E | Feb 2 analysis report (v37 label is aspirational session artifact, not release) |
| PROJECT_SNAPSHOT_v37.0.0.txt | _archive/01_root_reports/ | E | Feb 2 project snapshot (same v37 session) |
| TEST_REPORT_2026-01-28_11-05-08.txt | _archive/01_root_reports/ | E | Jan 28 test report (referenced only in historical indexes) |
| V24_QUICK_WINS_FINAL_VERDICT.txt | _archive/01_root_reports/ | E | Feb 22 v24 lab measurement results |
| V26_COMMIT_MANIFEST.txt | _archive/01_root_reports/ | E | Mar 11 v26 commit manifest |
| SESSION_COMPLETE_SUPERPROMPT_vMAX_2026-03-04.md | _archive/01_root_reports/ | E | Mar 4 session summary markdown |

Rollback batch B: `for f in CAMPAIGN_COMPLETE_v27.0.2.txt MISSION_COMPLETE.txt SESSION_COMPLETE.txt PHASE2_COMPLETED.txt SINGULARITYBRIDGE_DISABLED.txt STANDARDS_MODE_VERIFICATION.txt CONSOLE_ERRORS_FIXED.txt FINAL_STATUS_SNAPSHOT.txt DEPLOYMENT_READINESS_v27.0.3.txt DEPLOYMENT_READY_v27.0.2.txt FINAL_DEPLOYMENT_STATUS_v27.0.2.txt P1_BUILD_PROOF.txt DEEP_ANALYSIS_EXECUTIVE_SUMMARY_v37.0.0.txt PROJECT_SNAPSHOT_v37.0.0.txt TEST_REPORT_2026-01-28_11-05-08.txt V24_QUICK_WINS_FINAL_VERDICT.txt V26_COMMIT_MANIFEST.txt; do git mv _archive/01_root_reports/$f $f; done && git mv _archive/01_root_reports/SESSION_COMPLETE_SUPERPROMPT_vMAX_2026-03-04.md SESSION_COMPLETE_SUPERPROMPT_vMAX_2026-03-04.md && git commit -m "chore(rollback): restore historical txt files from archive"`

### Batch C: Obsolete root .sh → _archive/05_migration_notes/
| Source | Destination | Class | Reason |
|--------|-------------|-------|--------|
| DEPLOYMENT_DISTRIBUTION_v27.2.0.sh | _archive/05_migration_notes/ | H LOCAL_RESIDUE | v27 one-time deployment script |
| V26_INFRASTRUCTURE_READY.sh | _archive/05_migration_notes/ | H | v26 one-time infra check script |
| DAY1_GONO_SUMMARY.sh | _archive/05_migration_notes/ | H | One-time day-1 go/no-go event script (Feb 22) |
| transformation-start.sh | _archive/05_migration_notes/ | H | Dec 15 one-time migration script, obsolete |

Rollback batch C: `for f in DEPLOYMENT_DISTRIBUTION_v27.2.0.sh V26_INFRASTRUCTURE_READY.sh DAY1_GONO_SUMMARY.sh transformation-start.sh; do git mv _archive/05_migration_notes/$f $f; done && git commit -m "chore(rollback): restore archived shell scripts"`
