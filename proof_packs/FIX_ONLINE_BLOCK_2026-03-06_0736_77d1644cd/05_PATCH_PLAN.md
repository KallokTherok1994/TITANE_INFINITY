# Patch Plan

## Strategy selected
- Case B (file is not active in runtime).

## Planned edits
1. Edit `src/config/offline-first.ts`
- Add loud LEGACY warning header.
- Neutralize blocking defaults (`localFirst` no longer true by default).
- Remove direct UI web ping from `checkInternetConnection()` and replace with a non-web local capability check (`navigator.onLine`) to avoid outbound UI HTTP.

2. Add `src/__tests__/architecture/no_offline_first_runtime_import.test.ts`
- Enforce guardrail: no runtime import of `src/config/offline-first.ts` outside explicitly deprecated legacy files.
- This prevents accidental reactivation in production paths.

## Why this is minimal
- 1 existing source file edited + 1 test file added.
- No new package dependency.
- No API surface expansion.

## Rollback per edit
- `git restore -- src/config/offline-first.ts`
- `git restore -- src/__tests__/architecture/no_offline_first_runtime_import.test.ts`

