# _archive/root_scripts_2026-04-03/ — Archive Manifest

**Created:** 2026-04-03  
**Wave:** V29 Wave 3 — Structure Cleanup / Root Script Archive  
**Session:** V29_WAVE_EXECUTION_2026-04-03_ad0e53d9  

---

## Purpose

This directory contains 43 historical development/test utility scripts and data files  
that were previously at the repository root with no active CI or script callers.

They are preserved for historical reference. They were NOT deleted because their  
content may be referenced in documentation or provide historical context.

---

## Why These Were Archived

These files accumulated at the root from development sessions v20–v26 era (late 2025 to early 2026).  
Their only references were in historical discovery documents (e.g., `docs/01_misc/02_DISCOVER_RAW.md`  
which is a raw `ls -la` snapshot from February 2026) or other archived documentation.

**Zero active callers** in:
- `.github/workflows/` (active, non-archived)
- `scripts/**/*.sh`
- `src/**`, `src-tauri/**`

---

## What Remains at Root (KEPT — Active Callers)

| Script | Active Caller(s) |
|--------|-----------------|
| `titane.sh` | `scripts/deployment/deploy-fix-complete.sh`, `scripts/audit/05-deployment-audit.sh`, `scripts/audit/07-quality-gates.sh`, `scripts/test-final-integration.sh`, `scripts/install-all.sh`, `scripts/validate_production.sh` |
| `launch-titane.sh` | `.github/workflows/global-distribution-monitor.yml`, `scripts/validate_production.sh` |
| `pnpm-local.sh` | `scripts/verify/verify-preprod.sh`, `scripts/install/setup-local-tools.sh` |

---

## Archived Files

### Test Scripts (v20–v26 era)
- `test-audio-fixes.sh`
- `test-chat-system.sh`
- `test-chat-ui-auto.sh`
- `test-copilot-whitelist.sh`
- `test-evo-integration.sh`
- `test-evo-validation.sh`
- `test-mime-types.sh`
- `test-ollama-chat.sh`
- `test-ollama-connection.sh`
- `test-quantum-integration.sh`
- `test-sprint6-phase3.sh`
- `test-tauri-detection.sh`

### Verification Scripts (superseded)
- `verify-copilot-fix.sh`
- `verify-evo-final.sh`
- `verify-ollama.sh`
- `verify-time-fusion.sh`

### Analysis / Diagnostic Scripts
- `analyze-bundle.sh`
- `analyze-ui.sh`
- `check-tauri-backend.sh`
- `check-tunnel-access.sh`
- `check_tauri_build_status.sh`
- `fix-typescript-errors.sh`
- `force-browser-reload.sh`
- `force-menu-reload.sh`
- `final-validation.sh`

### Operations / Maintenance Scripts
- `QUICK_START_TESTING.sh`
- `mega-deploy.sh`
- `monitoring.sh`
- `optimize-workspace.sh`
- `pnpm-alias.sh`
- `push_corrections.sh`
- `restart-clean.sh`
- `restart-complete-fix.sh`
- `setup-dev.sh`
- `start-with-ollama.sh`
- `stop-http-server.sh`
- `validate-standards-mode.sh`

### Data / Test Files
- `baseline_measurements_real_w1.json` — W1 baseline measurement data
- `baseline_metrics_w1.json` — W1 baseline metrics data
- `figma-tokens.json` — Figma design tokens (superseded, no active imports)
- `test-chat-ui.html` — Historical chat UI test page
- `test-tauri-detection-fix.ts` — Historical Tauri detection fix script
- `TUNNEL_ISSUES.txt` — VS Code Dev Tunnels issue log from Jan 2026

---

## How to Find / Restore

```bash
# List all archived scripts
ls _archive/root_scripts_2026-04-03/

# Restore a specific script to root if needed
git mv _archive/root_scripts_2026-04-03/script-name.sh .

# View history
git log --follow _archive/root_scripts_2026-04-03/script-name.sh
```

---

## Rollback

```bash
git revert HEAD --no-edit
```

---

## Wave 4 Additions (2026-04-03)

The following files were appended to this archive in Wave 4 (same session):

### Root Test Scripts (orphaned — only proof_pack/docs historical refs)
- `test-chat-direct.mjs` — Historical Ollama/chat test script (v20.5.x era)
- `test-ollama-connection.js` — Historical Ollama connection test (v26 era)
- `test-titane-ollama.mjs` — Historical Titane-Ollama integration test
- `test_chat_backend.py` — Historical Python chat backend test
- `test_finetuned.py` — Historical fine-tuned model test

References: only `proof_packs/*/01_BOOTSTRAP.md` (session snapshots) and `docs/01_misc/02_DISCOVER_RAW.md` (raw ls -la snapshot).

---

## Wave 4 Separate Archives

See also:
- `_archive/super_prompts_2026-04-03/` — 1 super-prompt file (zero external refs)
- `_archive/dist_stub_2026-04-03/` — 1 dist stub HTML file (zero external refs)
