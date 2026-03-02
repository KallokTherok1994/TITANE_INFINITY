# INSTRUMENTATION ANTI-SILENCE

## UI BOOT markers (added)

- `BOOT:START`
- `BOOT:AFTER_ROUTER`
- `BOOT:AFTER_STORE`
- `BOOT:BEFORE_ORCHESTRATOR`
- `BOOT:AFTER_ORCHESTRATOR`
- `BOOT:READY`

## Watchdog 20s

- File: `src/main.tsx`
- Rule: if `BOOT:READY` not reached in 20s (Tauri runtime), force visible fallback (`BOOT timeout (>20s)`) and show restart button.
- Prevents silent infinite spinner state.

## IPC traces

- File: `src/lib/security.ts`
- Added:
	- `IPC:START <cmd> <id>`
	- `IPC:END <cmd> <id> ok|error`
	- `IPC:TIMEOUT <cmd> <id>` (on timeout classification)

## Rust traces

- File: `src-tauri/src/runtime_config.rs`
- Added:
	- `CMD:START get_runtime_config`
	- `CMD:END get_runtime_config ok`

## Post-instrumentation sanity

- `TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest` => PASS (5/5), rerun after timeout-log patch => PASS (5/5)

## Runtime validation (source build, Tauri dev smoke)

- Command: `./scripts/launch/deploy_full_local_dev.sh --smoke 30`
- Evidence logs: `runtime/dev/logs/tauri.log` + `dev_runtime_boot_trace.log`
- Observed markers sequence:
	- `BOOT:START`
	- `BOOT:AFTER_STORE`
	- `CMD:START get_runtime_config`
	- `CMD:END get_runtime_config ok`
	- `BOOT:AFTER_ROUTER`
	- `BOOT:BEFORE_ORCHESTRATOR`
	- `BOOT:AFTER_ORCHESTRATOR`
	- `BOOT:READY`
- Timing proof: `BOOT:START` at `21:27:17.853Z` and `BOOT:READY` at `21:27:18.362Z` (≈0.51s, <20s).

---

## Boot Probe prod (runtime packagé) — 2026-03-01T22:24:37Z

- Backend patch minimal: commande `boot_marker_log(marker)` + sonde activable `TITANE_PROBE_BOOT_MARKERS=1` injectée via `on_page_load`.
- Sonde: après 22s dans la WebView main, écrit `BOOT:READY` ou `BOOT:NOT_READY_22S` via `__TAURI_INTERNALS__.invoke('boot_marker_log', { marker })`.
- Preuves associées:
	- `21_BUILD_PRODUCTION_BOOT_PROBE.log`
	- `22_ARTIFACT_SELECTED_BOOT_PROBE.log`
	- `23_RUN_X3_BOOT_PROBE.log`
	- `boot_probe_run_1.log`, `boot_probe_run_2.log`, `boot_probe_run_3.log`

---

## Desktop WebView same-context probe — 2026-03-02T00:05:52Z

- Objectif: lever l’ambiguïté de contexte injecté `on_page_load` en observant l’app depuis la WebView réelle (WDIO + tauri-driver).
- Binaire ciblé: `src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage`.
- Résultat WDIO: `Spec Files: 7 passed, 7 total (100% completed) in 00:00:43`.
- Résultat runtime backend: `page_load` présent, appels conversation IPC exécutés avec succès (`OFFLINE_SIM=1`), réponses non silencieuses.

Preuves append-only:
- `42_DESKTOP_DIAGNOSTICS.log`
- `43_DESKTOP_WDIO.log`
- `44_DESKTOP_TAURI_DRIVER.log`

