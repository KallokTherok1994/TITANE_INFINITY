# GATES REPORT

- generated_at_utc: 2026-03-05T13:16:00Z

- `G_DISCOVERY_PROVED`: PASS
- `G_ONLINE_READY`: BLOCKED_PROVIDER_CONFIG
  - evidence: `10_PROVIDER_HEALTH_X3.log` + `logs/health_online_run*.log`
- `G_NO_UI_NETWORK_DIRECT`: PASS
  - evidence: no `fetch|axios|XMLHttpRequest|WebSocket` matches in `src/components src/pages src/ui src/hooks`
- `G_UNIT_X3_PASS`: PASS
  - evidence: `07_UNIT_X3.log` id `unit_chat_online_pack_final` run1..3 exit=0
- `G_HEALTHCHECK_X3_PASS`: FAIL
  - evidence: `10_PROVIDER_HEALTH_X3.log` run1..3 exit=1
- `G_E2E_ONLINE_SMOKE_X3_PASS`: BLOCKED_PROVIDER_CONFIG
- `G_E2E_ONLINE_FULL_X3_PASS`: BLOCKED_PROVIDER_CONFIG
- `G_NO_SKIPS`: PASS (no `SKIP:` and no `0 tests` in campaign logs)
- `G_AUTOFIX_CAPTURED`: PASS
  - evidence: `14_AUTOFIX_VALIDATOR.log` rerun section (post-stash)

## Stopline

- Active stopline: `BLOCKED_PROVIDER_CONFIG` because external provider keys are unset and health x3 fails.
- Final status cannot be `PASS` while any stopline remains active.

## Update 2026-03-05T13:39:36Z

- `G_AH_RULE_CAPTURED_FOR_EACH_FIX`: PASS
  - evidence: `node scripts/qa/check_autofix_autoheal_registry.mjs` shows `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
- `G_AH_RECURRENCE_GUARD_PASS`: PASS
  - evidence: `bash scripts/autoheal/detect_recurrence.sh` shows both PASS markers
- `G_HEALTHCHECK_X3_PASS`: FAIL
  - evidence: `10_PROVIDER_HEALTH_X3.log` latest id `provider_health` run1 exit=1 (`No external provider configured`)
- `G_ONLINE_READY`: BLOCKED_PROVIDER_CONFIG
  - evidence: `logs/provider_health_run1.log`

### Stopline (current)

- Active stopline remains `BLOCKED_PROVIDER_CONFIG` after semantics fix, because no provider key is visible in the campaign execution shell.

## Update 2026-03-05T13:43:33Z

- profile-reload retry executed (`~/.profile`, `~/.bash_profile`, `~/.bashrc`, `~/.zshrc`) then healthcheck re-run.
- result: FAIL (`No external provider configured`), evidence `logs/health_online_profile_reload_run1.log` + `10_PROVIDER_HEALTH_X3.log` entries at `13:43:21Z` and `13:43:33Z`.

## Update 2026-03-05T14:02:49Z

- `G_ONLINE_READY`: BLOCKED_SECRETS_DECRYPTION
  - evidence: `logs/governance_probe_envpass.log`, `logs/governance_probe_defaultpass.log`
  - marker: `Failed to decrypt secrets file: Decryption failed: aead::Error`
- `G_HEALTHCHECK_X3_PASS`: FAIL (unchanged)
  - no provider key available after secure-vault bootstrap in both passphrase probes.

### Stopline (current)

- Active stopline updated to `BLOCKED_SECRETS_DECRYPTION`.
- Rationale: provider keys may exist historically in governance, but current runtime cannot decrypt active vault with available passphrases, so provider bootstrap remains empty.

## Update 2026-03-05T14:27:26Z

- `G_E2E_ONLINE_SMOKE_X3_PASS`: PASS
  - evidence: `08_E2E_ONLINE_SMOKE_X3.log` id `e2e_online_smoke` run1..3 exit=0
- `G_E2E_ONLINE_FULL_X3_PASS`: FAIL
  - evidence: `09_E2E_ONLINE_FULL_X3.log` ids `e2e_online_full` run1 exit=1 and `e2e_online_full_retry` run1 exit=1
  - marker: `invalid session id` in full WDIO logs
- `G_ONLINE_READY`: BLOCKED_SECRETS_DECRYPTION (unchanged)
- `G_HEALTHCHECK_X3_PASS`: FAIL (unchanged)

### Stopline (current)

- Active stoplines:
  - `BLOCKED_SECRETS_DECRYPTION`
  - `FAIL_E2E_ONLINE_FULL_INVALID_SESSION`
