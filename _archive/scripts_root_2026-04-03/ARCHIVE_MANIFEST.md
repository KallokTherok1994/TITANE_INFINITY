# Archive: scripts/ Root-Level Orphan Scripts
## Wave 5 — 2026-04-03

This directory contains scripts that were previously at `scripts/` root level and have been
demoted here because they have **zero active callers** in:
- `.github/workflows/*.yml` (non-archive CI)
- `package.json` scripts
- `scripts/**/*` subdirectories (any level)
- Transitive L1 calls from the above

## Keep Set (remained at scripts/)
The following 26 scripts were **kept** due to confirmed active callers:

| Script | Caller |
|--------|--------|
| `audit-repo.sh` | scripts/subdirs |
| `audit_no_frontend_network.sh` | scripts/subdirs |
| `autobuild_full.sh` | `scripts/setup/create_desktop_icon.sh` |
| `build_titane.sh` | scripts/subdirs |
| `check_forbidden_files.sh` | CI + package.json |
| `deploy-production.sh` | scripts/subdirs |
| `fix-audio.sh` | scripts/subdirs |
| `gate-appimage-index.mjs` | package.json |
| `gate-dist-assets.mjs` | package.json |
| `gate-prod-boot.sh` | package.json |
| `generate-release-checksums.sh` | scripts/subdirs |
| `generate-tauri-config.mjs` | package.json + subdirs |
| `post-build.sh` | package.json |
| `prepare-ollama-bundle.sh` | package.json |
| `reviewer_gate_normalize.js` | package.json |
| `run-e2e-tests.sh` | scripts/subdirs |
| `run_all.sh` | scripts/subdirs |
| `stopline_latest_report.sh` | package.json |
| `stopline_rebuild_proof.sh` | package.json |
| `sync-docs.sh` | CI (docs.yml) |
| `sync-versions.mjs` | package.json + subdirs |
| `update-desktop-icon.sh` | scripts/subdirs + CI |
| `validate_production.sh` | CI + scripts/subdirs |
| `verify-prod-deployment.sh` | scripts/subdirs |
| `verify_instructions.sh` | CI + package.json + subdirs |
| `verify_system.sh` | scripts/subdirs |

## Archived Scripts (139 files)

### Activation/Setup (7)
- `activate-node24.sh` — Node 24 activation helper (v24 era)
- `install-all.sh` — Full install orchestrator
- `install-appimage.sh` — AppImage installer
- `install-deps.sh` — Deps installer
- `install-tauri-driver.sh` — Tauri webdriver installer
- `setup-branch-protection.sh` — GitHub branch protection setup
- `setup-dev.sh`, `setup-gemini.sh`, `setup-monitoring.sh` — Dev/Gemini/Monitoring setup

### Build/Optimize (10)
- `build-all.sh`, `build-fast.sh`, `build-in-docker.sh`, `build_optimized.sh`
- `clean_build.sh`, `final-build.sh`, `monitor-prod-build.sh`
- `optimize-frontend-quick.sh`, `optimize-ltm-integration.js`, `optimize_vscode.sh`

### Fix/Repair (14)
- `fix-jsx-apostrophes.sh`, `fix-jsx-batch.py`, `fix-pipeline.js`, `fix-prod-v27.0.2.sh`
- `fix-unwrap-patterns.sh`, `fix_all_remaining.sh`, `fix_jsx_apostrophes.py`
- `fix_p0_issues.sh`, `fix_rust_modules.sh`, `fix_security_and_ts.sh`
- `fix_ts_errors.sh`, `fix_typescript_complete.sh`, `repair_backend.sh`

### Test/Validate/Verify (42)
- `test-100-percent-suite.sh`, `test-all.sh`, `test-apis-openai-anthropic.sh`
- `test-chat-fallback-live.sh`, `test-chat-fix.sh`, `test-final-e2e.sh`
- `test-final-integration.sh`, `test-ui-polish.sh`, `test-wrapper.sh`
- `test_audio.sh` (v19.2 TTS test), `test_chat_ia.sh`, `test_perfection_chat_ia.sh`
- `validate-all.sh`, `validate-apis-complete.sh`, `validate-auto-heal.sh`
- `validate-boot.sh`, `validate-chat-fallback-fix.sh`, `validate-chat-pipeline.sh`
- `validate-fusion-complete.sh`, `validate-integration-v3.sh`
- `validate-phase3.sh`, `validate-phase4.sh`, `validate-production.sh`
- `validate-super-prompts-v21.1.sh`, `validate-tauri-only.sh`, `validate-v35.0.0.sh`
- `validate-webkit-fix.sh`, `validate_all.sh`
- `verify-and-merge-branches.sh`, `verify-branch-sync.sh`, `verify-security-disabled.sh`
- `verify_backend.sh`, `verify_ds_tokens.sh`, `verify_env.sh`
- `verify_frontend_structure.sh`, `verify_git_secure.sh`, `verify_import_hygiene.sh`
- `verify_memory_integrity.sh`, `verify_singularity_v∞.sh`, `verify_tauri_local_only.sh`

### Versioned/Era-Specific (5)
- `v24_auto_observer.sh`, `v24_check_progress.sh`, `v24_measure_2h_memory.sh`
- `v26_daily_check.sh`, `v26_deployment_verify.sh`

### Deploy/Release (5)
- `create-release-v27.0.2.sh`, `deploy-complete.sh`, `deploy-orchestrator.py`
- `deploy_titane.sh`, `install-appimage.sh`

### Misc/Operational (56)
- Various diagnostic, audit, migration, merge, run, monitoring, and utility scripts
- Era-specific: day1_*.sh, init-copilot-xs.sh, integrate-fusion-dashboard.sh
- Legacy converts: convert-debugger-liveos.py, convert-ipc-features.mjs

## Rollback
```bash
git revert HEAD --no-edit
```
