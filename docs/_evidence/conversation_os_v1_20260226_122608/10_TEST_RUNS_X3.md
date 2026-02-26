# 10_TEST_RUNS_X3.md

Date (UTC): 2026-02-26

## Commandes exécutées
- Baseline:
	- `pnpm lint` => `exit=0`
	- `pnpm test` => `exit=0`
- Scans x3:
	- `reports/conversation_os_v1_next_run_scans_x3_20260226T124140Z.log`

## Résultats x3 (extraits)
- `FRONTEND_NO_WEB_PRODSCOPE`: `0 / 0 / 0`
- `BACKEND_HTTP_GOV_OUTSIDE_ALLOWLIST`: `0 / 0 / 0`
- `TYPES_TO_SERVICES`: `2 / 2 / 2`
- `SERVICES_TO_UI`: `5 / 5 / 5`
- `LEGACY_CHAT_SEND_MESSAGE_UI`: `8 / 8 / 8`

## Tentatives x3 runtime Rust
- Tentatives lancées mais non finalisées proprement à cause de contention `cargo` (verrou build partagé):
	- `reports/conversation_os_v1_next_run_x3_20260226T123434Z.log`
	- `reports/conversation_os_v1_next_run_x3_20260226T123458Z.log`
	- `reports/conversation_os_v1_next_run_x3_bg_20260226T123511Z.log`

## Verdict x3
- Scans structurels: **PASS**.
- Gates runtime nécessitant tests Rust x3 complets: **BLOCKED** dans ce run.

