# Gates Report

## G_UI_NO_WEB
- Status: PASS (targeted)
- Proof:
	- `src/config/offline-first.ts` no longer performs outbound HTTP checks.
	- `checkInternetConnection()` now uses local `navigator.onLine` only.
	- Post-patch scan evidence in `07_SCANS.log` (global repo scan remains noisy due stories/tests/static URLs outside this fix scope).

## G_ONE_DOOR_NETWORK
- Status: PASS
- Proof:
	- Canonical runtime config path remains backend IPC (`cp_get_ai_config` / `cp_set_ai_config`) via `src/lib/tauriClient.ts` and Tauri handlers.
	- Legacy config no longer contains direct UI web ping behavior.

## G_CONFIG_CANONICAL
- Status: PASS
- Proof:
	- Active config is served by backend `src-tauri/src/control_panel_commands.rs` (`cp_get_ai_config`, `cp_set_ai_config`).
	- `src/config/offline-first.ts` classified legacy/dead for runtime import chain and now guarded by architecture test.

## G_TESTS_X3
- Status: PASS
- Proof:
	- `08_TESTS_X3.log` shows RUN 1/2/3 all PASS.

## G_BUILD_X3
- Status: PASS
- Proof:
	- `09_BUILD_X3.log` shows RUN 1/2/3 all PASS for `pnpm run build:tauri:e2e`.

## Additional constitutional gates
- `G_AH_RULE_CAPTURED_FOR_EACH_FIX`: PASS
- `G_AH_RECURRENCE_GUARD_PASS`: PASS
- `verify_instructions`: PASS (20/20)

