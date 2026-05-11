# UI_ANDROID_BUILDSRC_REPAIR_v74

Date: 2026-05-11
Mode: DURABLE

## Scope
- Repair Android build failure in mock debug pipeline.
- Target area: `src-tauri/gen/android/app/build.gradle.kts`.

## Reproduction
- Command: `pnpm run android:build:mock:debug`
- Initial result: FAIL
- Error: `Unresolved reference: BuildConfig` in generated `Logger.kt` during `:app:compileUniversalDebugKotlin`.

## Root Cause
- Android generated Kotlin package used `com.titane.infinity`, while module Gradle namespace/applicationId were set to `com.titane.infinity.stable`.
- `BuildConfig` was generated in stable namespace, but referenced from non-stable package.

## Fix Applied
- Updated `src-tauri/gen/android/app/build.gradle.kts`:
  - `namespace = "com.titane.infinity"`
  - `applicationId = "com.titane.infinity"`

## Verification Evidence
- Command: `pnpm run android:build:mock:debug`
- Final result: PASS (`EXIT:0`)
- Produced artifacts:
  - `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`
  - `src-tauri/gen/android/app/build/outputs/bundle/universalDebug/app-universal-debug.aab`

## Classification
- Verdict: PASS
- Risk after fix: low for BuildConfig resolution; medium for package-id dependent deploy flows.
- Residual risk: downstream tooling that explicitly expects `.stable` package naming must be revalidated.

## Rollback
- Revert `src-tauri/gen/android/app/build.gradle.kts` namespace/applicationId values to previous `.stable` values.
