# FIX PLAN (APPLIED)

## Principal fix (single focal point)

- Enforce anti-silence boot contract in UI bootstrap:
	- explicit BOOT markers
	- hard 20s watchdog
	- non-blocking fallback + restart action

## Complementary observability fix

- IPC trace ID start/end and timeout categorization (`IPC_TIMEOUT`).
- Backend command trace on boot-critical `get_runtime_config`.

## Files changed (VNEXT scope)

- `src/main.tsx`
- `src/App.tsx`
- `src/lib/security.ts`
- `src-tauri/src/runtime_config.rs`
- `package.json` (stabilized `test:e2e:vitest` shell invocation)

## Why minimal

- No capability expansion.
- No architecture rewrite.
- No broad command migration.
- Focused on deterministic diagnosis + bounded UX behavior.

## How proven

- Source-level validation: no type errors in changed files.
- Artifact-level run x3 captured with measurable counters (`page_load_main`, `boot_ready`, `fallback`).
- Build validation blocked by strict missing PROD tokens.

## Post-fix command verification

- `TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest` => `Test Files 1 passed (1), Tests 5 passed (5)`.
- IPC traces visible during run (`IPC:START ...`, `IPC:END ... ok`).

