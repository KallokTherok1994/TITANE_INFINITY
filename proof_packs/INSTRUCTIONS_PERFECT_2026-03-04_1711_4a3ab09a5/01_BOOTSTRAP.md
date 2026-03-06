]633;E;{   echo "# 01 — BOOTSTRAP"\x3b   echo\x3b   echo "- Date: $(date -Is)"\x3b   echo "- Pack: $PACK_DIR"\x3b   echo\x3b   echo '```bash'\x3b   echo '$ git status --porcelain=v1'\x3b   git status --porcelain=v1\x3b   echo\x3b   echo '$ git rev-parse --short HEAD'\x3b   git rev-parse --short HEAD\x3b   echo\x3b   echo '$ git log -20 --oneline'\x3b   git log -20 --oneline\x3b   echo\x3b   echo '$ ls -la'\x3b   ls -la\x3b   echo\x3b   echo '$ find .github -maxdepth 4 -type f -print || true'\x3b   find .github -maxdepth 4 -type f -print || true\x3b   echo\x3b   echo '$ find . -maxdepth 3 -type f \\( -name "*copilot*" -o -name "*.instructions.md" -o -name "*.mermaid" -o -name "*instructions*" \\) -print'\x3b   find . -maxdepth 3 -type f \\( -name "*copilot*" -o -name "*.instructions.md" -o -name "*.mermaid" -o -name "*instructions*" \\) -print\x3b   echo\x3b   echo '$ rg -n "applyTo:" .github/instructions || true'\x3b   rg -n "applyTo:" .github/instructions || true\x3b   echo '```'\x3b } >> "$PACK_DIR/01_BOOTSTRAP.md";2c644913-a59a-4bfe-aa0a-44954f161c53]633;C# 01 — BOOTSTRAP

- Date: 2026-03-04T17:11:50-05:00
- Pack: proof_packs/INSTRUCTIONS_PERFECT_2026-03-04_1711_4a3ab09a5

```bash
$ git status --porcelain=v1
 M .github/copilot-instructions.md
 M .github/copilot-setup-checklist.md
 M .github/copilot-workflow.mermaid
 M .github/instructions/tests-e2e.instructions.md
 M .github/instructions/titane.instructions.md
 M src-tauri/src/conversation_engine/commands.rs
 M src-tauri/src/services/db_service.rs
 M src-tauri/tauri.conf.json
 M src/__tests__/architecture/engine-isolation.test.ts
 D src/engines/cognitive/cognitiveLayoutIntegrations.ts
 M titane-infinity.desktop
?? SESSION_COMPLETE_SUPERPROMPT_vMAX_2026-03-04.md
?? docs/tests/TEST_MATRIX.md
?? proof_packs/.instructions_perfect_pack_path
?? proof_packs/FIXPACK_2026-03-04_2205_4a3ab09a5/
?? proof_packs/INSTRUCTIONS_PERFECT_2026-03-04_1711_4a3ab09a5/
?? proof_packs/TESTS_PERFECT_2026-03-04_2138_4a3ab09a5/
?? proof_packs/TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/
?? proof_packs/ULTRA_TESTS_2026-03-04_2151_4a3ab09a5/
?? registry/autofix-autoheal-rules.jsonl
?? scripts/qa/
?? src/services/cognitive/cognitiveLayoutIntegrations.ts

$ git rev-parse --short HEAD
4a3ab09a5

$ git log -20 --oneline
4a3ab09a5 chore(runtime): update diagnostics snapshots
d09165a62 docs(proofs): add seal and UI autofix proof packs
79f0cbbbf feat(ui-e2e): harden testids and whitelist sync gates
7556c5fa9 fix(launch): avoid stale prod artifact causing infinite loading
98262da88 chore(governance): add remediation proof-pack and tauri e2e wrapper
843b00530 chore(reports): add remaining generated reports
71ed38daa chore(repo): cleanup artifacts and stabilize local tts runtime
443aa9610 Merge pull request #164 from KallokTherok1994/copilot/audit-repository-contents
b88039910 Merge branch 'MAIN' into copilot/audit-repository-contents
925e3af58 docs(proofs): add SCELLEMENT_06 continuity pack
bf85a5adf chore(seal): SCELLEMENT_05 auto-fix, x3 tests, real build x3, final verdict
25404d1e9 fix: add registry ui-043 entry, update VERDICT with CI analysis, Prettier verified PASS
7eb4096fa fix(memory): inject storage port and seal ORCH_PERFECTION proof pack
36a5f85d4 feat: Final Audit Master Fix Plan + minimal auto-fixes (data-testid, PROD guard, MANIFEST version)
925340186 docs(91_reports): finalize broken-link cleanup batch-3
a0a4eeb31 feat: UI Interactive Cartography Proof-Pack — Audit complet TITANE∞ v27.2.0
b2d273e45 docs(links): fix relative paths in 90_release deployment docs
a9067a46a docs(links): fix canonical index relative paths
d85e8dc4b docs(changelog): add 2026-03-03 maintenance sync entry
29ece191d docs(readme): align version/status and governance notes with v27.2.0

$ ls -la
total 6867040
-rw-rw-r--   1 titane-os titane-os      33688 févr. 18 21:34 -
drwxrwxr-x  56 titane-os titane-os      36864 mars   4 17:10 .
drwxrwxr-x   9 titane-os titane-os       4096 févr. 28 11:13 ..
drwxr-xr-x   4 titane-os titane-os       4096 janv. 16 09:44 actions-runner
-rwxrwxr-x   1 titane-os titane-os       4746 févr.  3 07:20 analyze-bundle.sh
-rwxrwxr-x   1 titane-os titane-os       6976 févr.  2 08:36 analyze-ui.sh
drwxrwxr-x   3 titane-os titane-os       4096 janv. 26 21:05 .archive
drwxrwxr-x   8 titane-os titane-os       4096 mars   1 12:28 _archive
drwxrwxr-x   8 titane-os titane-os       4096 mars   3 08:02 .archive_cleanup
drwxrwxr-x   2 titane-os titane-os       4096 déc.  18 15:25 .backup_20251218_152527
-rw-rw-r--   1 titane-os titane-os       6983 févr. 13 18:21 baseline_measurements_real_w1.json
-rw-rw-r--   1 titane-os titane-os       3303 févr. 13 18:21 baseline_metrics_w1.json
-rw-rw-r--   1 titane-os titane-os      28303 janv. 16 15:31 build_log.txt
-rw-rw-r--   1 titane-os titane-os      47523 févr. 14 14:10 build_prod_hotfix_final.log
-rw-rw-r--   1 titane-os titane-os        790 févr. 14 14:07 build_prod_hotfix.log
-rw-rw-r--   1 titane-os titane-os      49258 févr. 12 19:27 build_production_attempt_2_1770941958.log
-rw-rw-r--   1 titane-os titane-os       1721 févr. 12 19:18 build_production_full_1770941835.log
-rw-rw-r--   1 titane-os titane-os      26542 févr.  4 16:56 build-tauri-vomega2.log
-rw-rw-r--   1 titane-os titane-os      28505 févr. 21 10:30 build_tdz_fix.log
-rw-rw-r--   1 titane-os titane-os      25680 févr.  4 17:43 build-v27.0.1-final.log
-rw-rw-r--   1 titane-os titane-os      25680 févr.  4 17:37 build-v27.0.1-rebundle.log
-rw-rw-r--   1 titane-os titane-os      18257 janv. 30 20:22 build-v34-baseline.log
-rw-rw-r--   1 titane-os titane-os      14562 févr. 14 14:16 CAMPAIGN_COMPLETE_v27.0.2.txt
drwxrwxr-x   2 titane-os titane-os       4096 févr. 22 09:03 .cargo
-rw-rw-r--   1 titane-os titane-os       2790 févr.  2 14:22 check-tauri-backend.sh
-rwxrwxr-x   1 titane-os titane-os       1420 janv. 30 12:01 check_tauri_build_status.sh
-rwxrwxr-x   1 titane-os titane-os       2153 janv. 12 20:02 check-tunnel-access.sh
drwx------   2 titane-os titane-os       4096 janv. 10 20:09 .claude
-rw-rw-r--   1 titane-os titane-os        103 mars   3 19:58 cleanup_deleted_dirs.log
-rw-rw-r--   1 titane-os titane-os         91 mars   3 19:52 CLEANUP_DISK_02_archive.log
-rw-rw-r--   1 titane-os titane-os        484 mars   3 20:05 cleanup_disk_after.log
-rw-rw-r--   1 titane-os titane-os       1712 mars   3 20:27 CLEANUP_DISK_REPORT.md
-rw-rw-r--   1 titane-os titane-os       2286 janv.  3 01:19 cliff.toml
drwxrwxr-x   2 titane-os titane-os       4096 mars   1 12:28 .cline
drwxrwxr-x   4 titane-os titane-os       4096 janv.  4 20:05 .clinerules
drwxrwxr-x   2 titane-os titane-os       4096 déc.   9 10:57 config
drwxrwxr-x   2 titane-os titane-os       4096 mars   1 12:28 .congratulations
-rw-rw-r--   1 titane-os titane-os       6612 janv.  2 18:31 CONSOLE_ERRORS_FIXED.txt
drwxrwxr-x   4 titane-os titane-os       4096 mars   4 17:10 coverage
-rw-rw-r--   1 titane-os titane-os       7514 janv.  1 14:10 coverage-rust-generation.log
-rw-rw-r--   1 titane-os titane-os        960 janv.  2 18:06 .current-server-info
-rw-rw-r--   1 titane-os titane-os        221 janv. 15 18:14 .current-server-info.example
drwxrwxr-x   2 titane-os titane-os       4096 janv.  4 20:05 dashboard
drwxrwxr-x   4 titane-os titane-os       4096 févr. 25 08:02 data
-rwxrwxr-x   1 titane-os titane-os      11510 févr. 22 21:42 DAY1_GONO_SUMMARY.sh
-rw-rw-r--   1 titane-os titane-os      11211 févr.  2 08:42 DEEP_ANALYSIS_EXECUTIVE_SUMMARY_v37.0.0.txt
drwxrwxr-x  12 titane-os titane-os       4096 mars   1 12:28 deployment
drwxrwxr-x  14 titane-os titane-os       4096 janv. 18 15:10 .deployment_backups
-rwxrwxr-x   1 titane-os titane-os       8331 févr. 24 07:04 DEPLOYMENT_DISTRIBUTION_v27.2.0.sh
-rw-rw-r--   1 titane-os titane-os       6041 févr. 21 22:35 DEPLOYMENT_READINESS_v27.0.3.txt
-rw-rw-r--   1 titane-os titane-os      17002 févr. 14 14:13 DEPLOYMENT_READY_v27.0.2.txt
-rw-rw-r--   1 titane-os titane-os       5517 janv. 16 16:33 dev_output.log
-rw-rw-r--   1 titane-os titane-os      13052 janv. 16 15:32 dev_tauri_clean_log.txt
-rw-rw-r--   1 titane-os titane-os       4293 janv. 16 15:34 dev_tauri_fixed_log.txt
-rw-rw-r--   1 titane-os titane-os      17434 janv. 16 15:30 dev_tauri_log.txt
-rw-rw-r--   1 titane-os titane-os       1203 janv. 16 15:32 dev_tauri_npm_log.txt
-rw-rw-r--   1 titane-os titane-os       8040 janv. 26 20:45 dev_tauri_session.log
drwxrwxr-x   3 titane-os titane-os       4096 déc.   9 10:57 .disabled
drwxrwxr-x   4 titane-os titane-os       4096 mars   4 17:10 dist
drwxrwxr-x   3 titane-os titane-os       4096 févr. 24 07:04 distribution
drwxrwxr-x   2 titane-os titane-os       4096 janv.  4 21:26 dist_stub
drwxrwxr-x  71 titane-os titane-os      20480 mars   3 20:06 docs
drwxrwxr-x   8 titane-os titane-os       4096 févr. 23 10:23 e2e
-rw-rw-r--   1 titane-os titane-os       6363 févr.  7 15:52 .env
-rw-rw-r--   1 titane-os titane-os        397 janv. 15 18:14 .env.deploy.example
-rw-rw-r--   1 titane-os titane-os       6672 févr. 23 19:58 .env.example
-rw-rw-r--   1 titane-os titane-os       1290 janv. 15 18:14 .env.gpg.example
-rw-rw-r--   1 titane-os titane-os        346 févr.  2 14:14 .env.local
-rw-rw-r--   1 titane-os titane-os       2141 janv. 15 18:14 .env.ollama.example
-rw-rw-r--   1 titane-os titane-os       1560 févr.  8 10:27 eslint.config.js
-rw-rw-r--   1 titane-os titane-os        340 déc.   9 10:57 .eslint-overrides.json
-rw-rw-r--   1 titane-os titane-os       9174 févr.  1 08:30 .eslintrc.cjs
-rw-rw-r--   1 titane-os titane-os       6674 déc.   9 18:44 figma-tokens.json
-rw-rw-r--   1 titane-os titane-os       1285 janv. 17 01:32 FILE_INDEX.csv
-rw-rw-r--   1 titane-os titane-os      11385 févr. 14 13:45 FINAL_DEPLOYMENT_STATUS_v27.0.2.txt
-rw-rw-r--   1 titane-os titane-os       1442 janv. 16 16:38 final_dev.log
-rw-rw-r--   1 titane-os titane-os       5366 janv. 31 08:11 FINAL_STATUS_SNAPSHOT.txt
-rw-rw-r--   1 titane-os titane-os      22385 janv. 16 15:35 final_test_log.txt
-rw-rw-r--   1 titane-os titane-os       4183 févr.  2 18:56 final-validation.sh
-rw-rw-r--   1 titane-os titane-os      10285 janv. 16 15:37 final_verification_log.txt
-rwxrwxr-x   1 titane-os titane-os       3847 janv. 17 08:47 fix-typescript-errors.sh
-rwxrwxr-x   1 titane-os titane-os        875 janv.  2 18:18 force-browser-reload.sh
-rwxrwxr-x   1 titane-os titane-os       1869 janv.  4 10:11 force-menu-reload.sh
-rw-rw-r--   1 titane-os titane-os       1350 janv. 16 16:37 full_dev.log
-rw-rw-r--   1 titane-os titane-os      20118 déc.  11 13:35 GATEWAY_IMPLEMENTATION_PLAN.rs
drwxrwxr-x  11 titane-os titane-os       4096 mars   4 17:11 .git
-rw-rw-r--   1 titane-os titane-os       3360 janv. 19 15:24 .gitattributes
-rw-rw-r--   1 titane-os titane-os        638 janv.  2 17:50 .gitattributes-security
-rw-rw-r--   1 titane-os titane-os       1760 janv. 16 15:49 .gitguardian.yml
drwxrwxr-x   9 titane-os titane-os       4096 mars   1 12:00 .github
-rw-rw-r--   1 titane-os titane-os       2966 mars   3 20:27 .gitignore
-rw-rw-r--   1 titane-os titane-os        231 janv. 18 07:05 .gitignore.additions
-rw-rw-r--   1 titane-os titane-os        936 janv. 15 18:25 .gitleaks.toml
drwxrwxr-x   3 titane-os titane-os       4096 janv. 30 09:30 .husky
-rw-rw-r--   1 titane-os titane-os      10581 mars   2 15:43 index.html
drwxrwxr-x   3 titane-os titane-os       4096 janv.  4 09:42 installer
drwxrwxr-x   3 titane-os titane-os       4096 déc.   9 10:57 installer_gui
-rw-rw-r--   1 titane-os titane-os        335 janv. 16 15:29 install_log.txt
-rwxrwxr-x   1 titane-os titane-os       2007 mars   4 12:52 launch-titane.sh
drwxrwxr-x   6 titane-os titane-os       4096 mars   1 12:28 legacy
drwxrwxr-x   4 titane-os titane-os       4096 mars   4 13:16 logs
-rw-rw-r--   1 titane-os titane-os      13458 janv. 18 15:02 mega_deploy_dry_run.log
-rw-rw-r--   1 titane-os titane-os       4726 janv. 18 15:11 mega_deploy_final2.log
-rw-rw-r--   1 titane-os titane-os       4754 janv. 18 15:04 mega_deploy_production.log
-rwxrwxr-x   1 titane-os titane-os      26248 janv. 18 12:49 mega-deploy.sh
drwxrwxr-x   2 titane-os titane-os       4096 mars   4 12:55 memory
-rw-rw-r--   1 titane-os titane-os      11073 janv. 16 15:39 minimal_config_test_log.txt
-rw-rw-r--   1 titane-os titane-os       9382 janv. 18 15:13 MISSION_COMPLETE.txt
-rw-rw-r--   1 titane-os titane-os       6071 janv. 19 15:24 Modelfile
drwxrwxr-x   2 titane-os titane-os       4096 janv. 28 17:20 monitoring-logs
-rwxrwxr-x   1 titane-os titane-os      12685 janv. 28 11:29 monitoring.sh
drwxrwxr-x  22 titane-os titane-os       4096 mars   4 13:42 node_modules
-rw-rw-r--   1 titane-os titane-os        109 janv. 19 15:24 .npmrc
-rw-rw-r--   1 titane-os titane-os          3 janv.  4 00:57 .nvmrc
-rw-rw-r--   1 titane-os titane-os       3816 févr.  3 07:14 optimize-workspace.sh
drwxrwxr-x   3 titane-os titane-os       4096 mars   3 08:02 orchestration
-rw-rw-r--   1 titane-os titane-os       6763 févr.  5 01:40 P1_BUILD_PROOF.txt
-rw-rw-r--   1 titane-os titane-os      16892 mars   4 12:55 package.json
-rw-rw-r--   1 titane-os titane-os        946 déc.   9 10:57 package.ui.json
drwxrwxr-x   2 titane-os titane-os       4096 janv. 18 19:55 .performance-results
-rw-rw-r--   1 titane-os titane-os       8737 févr.  4 08:41 PHASE2_COMPLETED.txt
-rw-rw-r--   1 titane-os titane-os       1598 févr.  2 17:43 phase2-execution.log
-rw-rw-r--   1 titane-os titane-os      10492 févr.  5 08:58 PHASE_C1_COMPLETION_REPORT.ts
drwxrwxr-x   2 titane-os titane-os       4096 mars   1 12:28 plans
-rw-rw-r--   1 titane-os titane-os       3291 mars   1 15:06 playwright.config.ts
-rw-rw-r--   1 titane-os titane-os       2551 févr. 11 07:23 playwright.config.ts.backup-1770812583
-rw-rw-r--   1 titane-os titane-os        370 janv. 16 18:12 playwright.global-setup.ts
-rw-rw-r--   1 titane-os titane-os       1353 janv.  1 23:26 pnpm-alias.sh
-rwxrwxr-x   1 titane-os titane-os        245 janv. 19 15:24 pnpm-local.sh
-rw-rw-r--   1 titane-os titane-os     550848 févr. 25 08:47 pnpm-lock.yaml
-rw-rw-r--   1 titane-os titane-os        183 janv. 30 09:39 postcss.config.js
-rw-rw-r--   1 titane-os titane-os       1726 févr. 28 16:32 .prettierignore
-rw-rw-r--   1 titane-os titane-os        222 déc.   9 10:57 .prettierrc
-rw-rw-r--   1 titane-os titane-os      12204 févr.  2 08:37 PROJECT_SNAPSHOT_v37.0.0.txt
drwxrwxr-x  16 titane-os titane-os       4096 mars   4 17:11 proof_packs
drwxrwxr-x   2 titane-os titane-os       4096 févr. 24 18:16 public
-rwxrwxr-x   1 titane-os titane-os       1142 janv. 18 07:05 push_corrections.sh
-rw-rw-r--   1 titane-os titane-os       3528 janv. 16 21:40 quantum_system_test_20260116_214045.log
-rw-rw-r--   1 titane-os titane-os      13549 janv. 28 11:06 QUICK_START_TESTING.sh
-rw-rw-r--   1 titane-os titane-os      29579 mars   3 15:00 README.md
drwxrwxr-x   2 titane-os titane-os       4096 mars   4 17:05 registry
-rw-rw-r--   1 titane-os titane-os        963 févr.  5 08:51 REGISTRY_APPEND_CHAT_MEM.jsonl
-rw-rw-r--   1 titane-os titane-os        841 févr.  5 08:41 REGISTRY_APPEND.jsonl
drwxrwxr-x   3 titane-os titane-os       4096 mars   3 08:02 release
-rw-rw-r--   1 titane-os titane-os        280 févr.  5 15:27 RELEASE_ARTIFACTS_CHECKSUMS.txt
-rw-rw-r--   1 titane-os titane-os       6894 févr. 21 22:33 RELEASE_v27.0.3_SEALED.txt
drwxrwxr-x 130 titane-os titane-os     249856 mars   4 17:10 reports
-rw-rw-r--   1 titane-os titane-os       1451 févr.  2 14:22 restart-clean.sh
-rwxrwxr-x   1 titane-os titane-os       1506 févr.  2 14:29 restart-complete-fix.sh
-rwxrwxr-x   1 titane-os titane-os       2642 janv. 19 15:24 run
-rw-rw-r--   1 titane-os titane-os       6499 févr. 13 18:21 run_baseline_measurements.rs
drwxrwxr-x  30 titane-os titane-os       4096 mars   3 08:02 runs
drwxrwxr-x   7 titane-os titane-os       4096 mars   3 22:04 runtime
drwxrwxr-x  50 titane-os titane-os      12288 mars   4 13:02 scripts
-rw-rw-r--   1 titane-os titane-os    1147793 mars   4 12:55 .seal_bootstrap_capture.md
-rw-rw-r--   1 titane-os titane-os         35 mars   4 12:55 .seal_bootstrap_ids
-rw-rw-r--   1 titane-os titane-os         48 mars   4 12:55 .seal_proof_dir
-rw-rw-r--   1 titane-os titane-os          8 janv.  5 17:26 .server.pid
-rw-rw-r--   1 titane-os titane-os          0 janv.  5 21:39 service
-rw-rw-r--   1 titane-os titane-os      11677 mars   4 16:58 SESSION_COMPLETE_SUPERPROMPT_vMAX_2026-03-04.md
-rw-rw-r--   1 titane-os titane-os       5799 févr.  2 18:38 SESSION_COMPLETE.txt
-rwxrwxr-x   1 titane-os titane-os      14229 janv.  4 20:05 setup-dev.sh
-rw-rw-r--   1 titane-os titane-os       6740 janv.  2 18:37 SINGULARITYBRIDGE_DISABLED.txt
-rw-rw-r--   1 titane-os titane-os       7486 févr. 21 10:31 smoke_dev_tdz_fix.log
drwxrwxr-x  45 titane-os titane-os       4096 mars   4 12:55 src
drwxrwxr-x  19 titane-os titane-os       4096 mars   4 13:19 src-tauri
-rw-rw-r--   1 titane-os titane-os       5831 janv.  2 18:18 STANDARDS_MODE_VERIFICATION.txt
-rw-rw-r--   1 titane-os titane-os          0 janv.  5 21:39 start
-rwxrwxr-x   1 titane-os titane-os       2338 janv. 12 20:02 start-with-ollama.sh
-rw-rw-r--   1 titane-os titane-os          0 janv.  5 21:39 status
-rwxrwxr-x   1 titane-os titane-os       3035 janv.  2 17:30 stop-http-server.sh
drwxrwxr-x   2 titane-os titane-os       4096 déc.   9 10:57 .storybook
-rw-rw-r--   1 titane-os titane-os      14366 janv. 19 16:13 tailwind.config.ts
-rw-rw-r--   1 titane-os titane-os          0 déc.   9 10:57 tauri
-rw-rw-r--   1 titane-os titane-os       6334 févr. 23 06:42 tauri.base.json
-rw-rw-r--   1 titane-os titane-os     155205 janv. 17 19:56 tauri-build-final.log
-rw-rw-r--   1 titane-os titane-os        219 févr.  5 20:52 tauri_build_gstreamer.log
-rw-rw-r--   1 titane-os titane-os      24157 févr.  6 09:45 tauri_build_icon_refresh.log
-rw-rw-r--   1 titane-os titane-os        280 janv. 17 19:43 tauri-build.log
-rw-rw-r--   1 titane-os titane-os      23881 févr.  6 10:31 tauri_build_ollama_bundle.log
-rw-rw-r--   1 titane-os titane-os        280 janv. 18 07:49 tauri-build-output.log
-rw-rw-r--   1 titane-os titane-os        949 févr.  5 16:13 tauri_build_prod_FINAL.log
-rw-rw-r--   1 titane-os titane-os       2860 févr.  5 16:10 tauri_build_prod_FULL.log
-rw-rw-r--   1 titane-os titane-os       3548 févr.  5 16:08 tauri_build_prod.log
-rw-rw-r--   1 titane-os titane-os       1326 févr.  5 16:12 tauri_build_prod_v2.log
-rw-rw-r--   1 titane-os titane-os        269 févr.  5 19:38 tauri_build_sc_get_env.log
-rw-rw-r--   1 titane-os titane-os       5236 févr.  3 14:29 tauri-dev.log
-rw-rw-r--   1 titane-os titane-os      18080 janv. 16 15:43 tauri_test_clean_config.txt
-rw-rw-r--   1 titane-os titane-os       2563 janv.  4 20:05 test_chat_backend.py
-rw-rw-r--   1 titane-os titane-os       3768 févr.  3 08:05 test-chat-direct.mjs
-rwxrwxr-x   1 titane-os titane-os       2750 févr.  2 17:01 test-chat-system.sh
-rwxrwxr-x   1 titane-os titane-os       3710 févr.  3 07:12 test-chat-ui-auto.sh
-rw-rw-r--   1 titane-os titane-os       4354 févr.  3 08:05 test-chat-ui.html
-rwxrwxr-x   1 titane-os titane-os       1508 janv.  4 00:16 test-copilot-whitelist.sh
-rw-rw-r--   1 titane-os titane-os       5460 janv. 13 07:51 test-evo-integration.sh
-rwxrwxr-x   1 titane-os titane-os        900 déc.  16 21:06 test-evo-validation.sh
-rw-rw-r--   1 titane-os titane-os        468 janv. 17 00:30 test_finetuned.py
-rwxrwxr-x   1 titane-os titane-os       2438 janv.  2 18:31 test-mime-types.sh
-rw-rw-r--   1 titane-os titane-os       1158 févr.  2 14:17 test-ollama-chat.sh
-rw-rw-r--   1 titane-os titane-os       3956 janv. 16 15:49 test-ollama-connection.js
-rwxrwxr-x   1 titane-os titane-os       5606 févr.  2 14:15 test-ollama-connection.sh
-rw-rw-r--   1 titane-os titane-os      12446 déc.   9 10:57 test_persona_engine.rs
-rwxrwxr-x   1 titane-os titane-os       9410 janv. 16 21:47 test-quantum-integration.sh
-rw-rw-r--   1 titane-os titane-os       1366 janv. 28 11:05 TEST_REPORT_2026-01-28_11-05-08.txt
-rw-rw-r--   1 titane-os titane-os    8898959 janv. 26 21:15 test_results_20260126_211255.log
drwxrwxr-x  20 titane-os titane-os       4096 févr.  2 11:45 tests
-rwxrwxr-x   1 titane-os titane-os      15697 janv. 28 11:05 test-sprint6-phase3.sh
-rw-rw-r--   1 titane-os titane-os       2670 févr.  3 08:05 test-tauri-detection-fix.ts
-rwxrwxr-x   1 titane-os titane-os       1761 févr.  2 14:25 test-tauri-detection.sh
-rw-rw-r--   1 titane-os titane-os       1894 janv. 16 15:49 test-titane-ollama.mjs
-rw-rw-r--   1 titane-os titane-os       1371 déc.   9 18:45 test-uilogger.mjs
-rw-rw-r--   1 titane-os titane-os      64044 déc.   9 10:57 test.wav
lrwxrwxrwx   1 titane-os titane-os          9 janv. 19 15:24 titane -> titane.sh
-rw-rw-r--   1 titane-os titane-os      25985 déc.   9 10:57 titane-app-icon.png
-rw-rw-r--   1 titane-os titane-os        280 févr. 14 14:08 TITANE_ARTIFACTS_SHA256_v27.0.2_HOTFIX.txt
-rwxrwxr-x   1 titane-os titane-os       1311 mars   2 17:54 TITANE_INFINITY
-rw-rw-r--   1 titane-os titane-os          0 déc.   9 10:57 titane-infinity@16.2.3
-rw-rw-r--   1 titane-os titane-os          0 déc.   9 10:57 titane-infinity@9.0.0
-rwxrwxr-x   1 titane-os titane-os        854 mars   4 17:10 titane-infinity.desktop
-rw-rw-r--   1 titane-os titane-os   98228899 janv.  4 20:05 TITANE_INFINITY-main.zip
drwxrwxr-x   2 titane-os titane-os       4096 déc.   9 10:57 titane_local_training
-rw-rw-r--   1 titane-os titane-os 6920077312 févr. 23 07:46 TITANE_OMEGA_BACKUP_20260223T122631Z.tar.gz
-rw-rw-r--   1 titane-os titane-os       1160 janv.  2 17:50 .titane-security-config.json
-rwxrwxr-x   1 titane-os titane-os      30294 janv. 19 16:51 titane.sh
-rwxrwxr-x   1 titane-os titane-os      41090 janv. 19 15:24 titane.sh.new
drwxrwxr-x   2 titane-os titane-os       4096 janv.  4 22:15 .tmp
-rw-rw-r--   1 titane-os titane-os        159 janv. 19 15:24 tmp_import_useChat.mjs
drwxrwxr-x   3 titane-os titane-os       4096 janv.  4 01:17 .tools
drwxrwxr-x   2 titane-os titane-os       4096 févr. 27 12:37 tools
-rwxrwxr-x   1 titane-os titane-os       7287 déc.  15 21:37 transformation-start.sh
-rw-rw-r--   1 titane-os titane-os       2568 févr. 14 13:05 tsconfig.json
-rw-rw-r--   1 titane-os titane-os        256 déc.   9 10:57 tsconfig.node.json
-rw-rw-r--   1 titane-os titane-os        476 janv. 27 16:50 tsconfig.test.json
drwxrwxr-x   4 titane-os titane-os       4096 mars   3 20:27 tts-service
-rw-rw-r--   1 titane-os titane-os        210 janv. 15 18:14 .tunnel-access.example.txt
-rw-rw-r--   1 titane-os titane-os       3820 janv. 13 07:51 .tunnel-access.txt
-rw-rw-r--   1 titane-os titane-os       7909 janv.  2 18:35 TUNNEL_ISSUES.txt
-rw-rw-r--   1 titane-os titane-os       1002 déc.   9 18:45 typedoc.json
-rw-rw-r--   1 titane-os titane-os       6475 févr. 22 21:15 V24_QUICK_WINS_FINAL_VERDICT.txt
-rwxrwxr-x   1 titane-os titane-os       4179 févr. 22 21:30 V26_INFRASTRUCTURE_READY.sh
-rwxrwxr-x   1 titane-os titane-os       2722 janv.  2 18:19 validate-standards-mode.sh
drwxrwxr-x   7 titane-os titane-os       4096 mars   3 20:16 .venv
-rwxrwxr-x   1 titane-os titane-os       2838 janv.  4 17:13 verify-copilot-fix.sh
-rwxrwxr-x   1 titane-os titane-os       2104 déc.  16 21:09 verify-evo-final.sh
-rw-rw-r--   1 titane-os titane-os       3730 janv. 12 20:02 verify-ollama.sh
-rwxrwxr-x   1 titane-os titane-os       4703 déc.  16 21:18 verify-time-fusion.sh
-rw-rw-r--   1 titane-os titane-os          0 déc.   9 10:57 vite
-rw-rw-r--   1 titane-os titane-os       1163 janv. 16 15:41 vite_clean_test.txt
-rw-rw-r--   1 titane-os titane-os      23539 mars   4 12:55 vite.config.ts
-rw-rw-r--   1 titane-os titane-os        108 janv. 16 15:32 vite_direct_log.txt
-rw-rw-r--   1 titane-os titane-os      16576 janv. 16 15:40 vite_minimal_test.txt
-rw-rw-r--   1 titane-os titane-os       1624 janv. 16 15:40 vite_no_tsconfig_test.txt
-rw-rw-r--   1 titane-os titane-os       1624 janv. 16 15:39 vite_standalone_test2.txt
-rw-rw-r--   1 titane-os titane-os       1624 janv. 16 15:39 vite_standalone_test.txt
-rw-rw-r--   1 titane-os titane-os       1866 mars   4 12:55 vitest.browser.config.ts
-rw-rw-r--   1 titane-os titane-os       7198 févr. 13 23:13 vitest.config.ts
-rw-rw-r--   1 titane-os titane-os       1932 févr. 17 20:46 vitest.integration.config.ts
-rw-rw-r--   1 titane-os titane-os       2981 janv. 29 22:39 vitest.unit.config.ts
-rw-rw-r--   1 titane-os titane-os     412963 janv. 27 11:46 vitest_validation_20260127_114458.log
-rw-rw-r--   1 titane-os titane-os        141 déc.   9 18:45 vitest.workspace.ts
drwxrwxr-x   2 titane-os titane-os       4096 févr. 25 19:49 .vscode
-rw-rw-r--   1 titane-os titane-os        711 déc.   9 10:57 .vscodeignore
-rw-rw-r--   1 titane-os titane-os       4795 févr. 28 10:59 wdio.desktop.conf.cjs

$ find .github -maxdepth 4 -type f -print || true
.github/WORKFLOW_MONITORING.md
.github/agents/implement-subagent.agent.md
.github/agents/review-subagent.agent.md
.github/agents/audit-subagent.agent.md
.github/agents/titane-conductor.agent.md
.github/copilot-agents.md
.github/skills/README.md
.github/skills/architecture-check/.gitkeep
.github/skills/architecture-check/instructions.md
.github/dependabot.yml
.github/workflows/global-distribution-monitor.yml
.github/workflows/capability-qualification.yml
.github/workflows/docs-deploy.yml
.github/workflows/cosmic-consciousness-synchronization.yml
.github/workflows/constitution-audit.yml
.github/workflows/universal-omniscience.yml
.github/workflows/rust-docker.yml
.github/workflows/performance.yml
.github/workflows/archive/README.md
.github/workflows/archive/ci-cd.yml
.github/workflows/archive/titane_ci.yml
.github/workflows/archive/ci.yml
.github/workflows/archive/release.yml
.github/workflows/codeql.yml
.github/workflows/changelog.yml
.github/workflows/secret-scan-gitleaks.yml
.github/workflows/deploy-v27-production.yml
.github/workflows/p3-stable-build.yml
.github/workflows/mermaid.yml
.github/workflows/release-certification-final.yml
.github/workflows/perfection-maintenance.yml
.github/workflows/consciousness-matrix.yml
.github/workflows/p6-capability-qualification.yml
.github/workflows/omniscient-programming-interface.yml
.github/workflows/release-deployment.yml
.github/workflows/ultimate-transcendence-synthesis.yml
.github/workflows/stable-build.yml
.github/workflows/multiversal-orchestrator.yml
.github/workflows/release-unified.yml
.github/workflows/source-reality-fusion.yml
.github/workflows/ai-system-optimization.yml
.github/workflows/quantum-evolution.yml
.github/workflows/p0-surface-guard.yml
.github/workflows/production-monitoring.yml
.github/workflows/mermaid-verify.yml
.github/workflows/gitguardian.yml
.github/workflows/infinite-dimensional-transcendence.yml
.github/workflows/final-state-beyond-all-states.yml
.github/workflows/reality-architect-mastery.yml
.github/workflows/registry-guard.yml
.github/workflows/p0-1-secrets-guard.yml
.github/workflows/p4-constitution-audit.yml
.github/workflows/p2-contract-guard.yml
.github/workflows/p3-build-guard.yml
.github/workflows/ci-unified.yml
.github/workflows/dependabot-auto-review.yml
.github/workflows/p5-runtime-governance.yml
.github/REGLE_CRITIQUE_DEPLOIEMENT.md
.github/copilot-instructions.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/ISSUE_TEMPLATE/documentation.md
.github/ISSUE_TEMPLATE/01-doc-gap.md
.github/ISSUE_TEMPLATE/03-help-question.md
.github/ISSUE_TEMPLATE/02-api-issue.md
.github/ISSUE_TEMPLATE/04-doc-feature.md
.github/ISSUE_TEMPLATE/bug_report.md
.github/dependabot-reviewers.txt
.github/copilot-agents/agents/ai-ml-engineer.agent.md
.github/copilot-agents/agents/security.agent.md
.github/copilot-agents/agents/data-scientist.agent.md
.github/copilot-agents/agents/architecture.agent.md
.github/copilot-agents/agents/code-reviewer.agent.md
.github/copilot-agents/agents/devops.agent.md
.github/copilot-agents/architect.agent.md
.github/copilot-agents/dependency-guardian.agent.md
.github/copilot-agents/guardian.agent.md
.github/copilot-agents/agent-factory.agent.md
.github/copilot-agents/orchestrator.agent.md
.github/copilot-routing.json
.github/copilot-workflow.mermaid
.github/copilot-setup-checklist.md
.github/instructions/titane.instructions.md
.github/instructions/tests-e2e.instructions.md
.github/instructions/frontend.instructions.md
.github/instructions/tauri.instructions.md
.github/instructions/docs-registry.instructions.md
.github/PULL_REQUEST_TEMPLATE.md
.github/copilot-xs/README.md
.github/copilot-xs/cargo-audit-ignores.txt
.github/copilot-xs/scripts/precommit.js
.github/copilot-xs/scripts/agent-status.js
.github/copilot-xs/scripts/gitguardian-precommit.js
.github/copilot-xs/scripts/.gitkeep
.github/copilot-xs/scripts/security-scan.js
.github/copilot-xs/scripts/validate.js

$ find . -maxdepth 3 -type f \( -name "*copilot*" -o -name "*.instructions.md" -o -name "*.mermaid" -o -name "*instructions*" \) -print
./verify-copilot-fix.sh
./.github/copilot-agents.md
./.github/copilot-instructions.md
./.github/copilot-routing.json
./.github/copilot-workflow.mermaid
./.github/copilot-setup-checklist.md
./.github/instructions/titane.instructions.md
./.github/instructions/tests-e2e.instructions.md
./.github/instructions/frontend.instructions.md
./.github/instructions/tauri.instructions.md
./.github/instructions/docs-registry.instructions.md
./proof_packs/.instructions_perfect_pack_path
./test-copilot-whitelist.sh
./docs/audit/71_copilot_module_issue.md
./docs/.copilot-instructions.md
./docs/01_misc/.copilot-rules-permanent.md
./docs/01_misc/custom-instructions.md
./docs/01_misc/ROLLBACK__reports_instructions-seal_20260214-011649_ROLLBACK.md.md
./docs/01_misc/VERDICT__reports_instructions-seal_20260214-011649_VERDICT.md.md
./scripts/init-copilot-xs.sh
./scripts/test/run_copilot_xs_test_logged.sh
./scripts/verify/verify-copilot-instructions.sh
./.vscode/copilot-xs-entry.json

$ rg -n "applyTo:" .github/instructions || true
.github/instructions/docs-registry.instructions.md:2:applyTo: 'docs/**, reports/**'
.github/instructions/tauri.instructions.md:2:applyTo: 'src-tauri/**, tauri*.json, runtime/**'
.github/instructions/frontend.instructions.md:2:applyTo: 'src/**'
.github/instructions/tests-e2e.instructions.md:2:applyTo: 'e2e/**, scripts/e2e/**, wdio*.conf*'
```
