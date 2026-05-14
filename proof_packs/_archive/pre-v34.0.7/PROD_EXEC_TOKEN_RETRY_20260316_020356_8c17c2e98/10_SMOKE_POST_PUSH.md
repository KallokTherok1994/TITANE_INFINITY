# 10 Smoke Post-Push

## Scope

- Post-push runtime smoke verification after `MAIN` sync at commit `5a8835c59`.
- Goal: confirm stable runtime keeps alive without fatal runtime errors.

## Runs

1. AppImage smoke script
- Command: `bash scripts/smoke/smoke_stable_appimage.sh`
- Result: `FAIL`
- Keepalive: `PASS` (`exit 124` after 90s)
- Observed marker: one line containing lowercase `error` inside an Ollama timeout warning:
  - `[WARN ...] Ollama offline or timeout ... error sending request for url ...`
- Interpretation: non-fatal warning false-positive for current grep rule.
- Log: `runtime/stable/logs/smoke-appimage-20260315-224941.log`

2. Installed binary smoke script
- Command: `bash scripts/smoke/smoke_stable_installed.sh`
- Result: `PASS`
- Keepalive: `PASS` (`exit 124` after 180s)
- Error scan: `PASS` (no fatal markers detected)
- UI init markers: detected
- Log: `proof_packs/PROD_EXEC_TOKEN_RETRY_20260316_020356_8c17c2e98/09_SMOKE_INSTALLED_20260315-225204.log`

## Verdict

- Runtime post-push evidence is sufficient via installed binary smoke PASS.
- AppImage smoke failure is classified as a script-level false-positive on warning text, not a crash/early-exit regression.
