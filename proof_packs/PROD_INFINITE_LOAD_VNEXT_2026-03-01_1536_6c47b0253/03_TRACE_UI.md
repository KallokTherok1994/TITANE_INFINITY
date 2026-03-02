# TRACE UI

## Files modified

- `src/main.tsx`
- `src/App.tsx`

## Added BOOT markers (timestamped logs)

- `BOOT:START`
- `BOOT:AFTER_STORE`
- `BOOT:AFTER_ROUTER`
- `BOOT:BEFORE_ORCHESTRATOR_INIT`
- `BOOT:AFTER_ORCHESTRATOR_INIT`
- `BOOT:READY`

## Watchdog anti-silence (20s)

- If `BOOT:READY` not reached within 20s in Tauri runtime:
	- render explicit fatal/fallback overlay (`BOOT_WATCHDOG_20S`)
	- show non-blocking restart button (`🔄 Relancer`)
	- preserve diagnostics access (boot state + UI logs)
- Prevents indefinite silent loading state at UI layer.

## Trace mechanism

- Global emitter added: `window.__TITANE_EMIT_BOOT_MARKER__`.
- Deduplicated marker emission via in-memory set.
- `BOOT:READY` sets `window.__TITANE_BOOT_READY__ = true`.

