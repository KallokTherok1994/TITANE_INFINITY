# UI_PRODUCTION_V75_WORKTREE_SCOPE_CLASSIFICATION_v76

Date: 2026-05-11
Mode: DURABLE

## Classification Rules Applied
Allowed classes:
- COMMIT_V75_ROUTE_PROOF_LIFECYCLE
- COMMIT_V75_ANDROID_BUILDSRC_REPAIR
- COMMIT_V75_RUSTFMT_CI_REPAIR
- COMMIT_V75_WINDOWS_PATH_LENGTH_RENAME
- COMMIT_V75_DOCS_CERTIFICATION
- COMMIT_V75_AUTOHEAL
- DO_NOT_COMMIT_GENERATED_BINARY
- RESTORE_UNRELATED
- NEEDS_BLOCKER_REPORT

## File-by-File Classification

### COMMIT_V75_ROUTE_PROOF_LIFECYCLE
- `e2e/production/ui-production-route-proof.spec.ts`
  - Diff: default artifact path changed from v73 to `current-production-route-proof.jsonl`; env override `TITANE_UI_PRODUCTION_ARTIFACT` added.
- `scripts/verify/verify-ui-production-route-proof.mjs`
  - Diff: same lifecycle logic and env override.
- `artifacts/ui-production/v74-production-route-proof.jsonl`
  - Versioned proof artifact generated and verified.
- `artifacts/ui-production/current-production-route-proof.jsonl`
  - Default lifecycle artifact generated and verified.

### COMMIT_V75_ANDROID_BUILDSRC_REPAIR
- `src-tauri/gen/android/buildSrc/build.gradle.kts`
  - Diff: `implementationClass` now fully qualified.
- `src-tauri/gen/android/buildSrc/src/main/java/com/titane/infinity/stable/kotlin/BuildTask.kt`
  - Diff: package declaration added.
- `src-tauri/gen/android/buildSrc/src/main/java/com/titane/infinity/stable/kotlin/RustPlugin.kt`
  - Diff: package declaration added.

### COMMIT_V75_RUSTFMT_CI_REPAIR
- `src-tauri/src/agenda/types.rs`
  - Diff is formatting-only (line wrap/indent), no semantic mutation.
- `src-tauri/src/time_commands.rs`
  - Diff is formatting/import ordering only, no semantic mutation.

### COMMIT_V75_WINDOWS_PATH_LENGTH_RENAME
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-27-03-013Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-29-04-713Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-31-42-899Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-34-20-385Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-37-06-388Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-27-03-013Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-29-04-713Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-31-42-899Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-34-20-385Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-37-06-388Z.png`
  - Classification rationale: deterministic rename set reducing path length for Windows checkout.

### COMMIT_V75_DOCS_CERTIFICATION
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_v75_STARTUP_AUDIT.md`
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_STATUS_v75.md`
- `docs/ui/production/UI_PRODUCTION_ARTIFACT_LIFECYCLE_AUDIT_v75.md`
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_AND_ARTIFACT_LIFECYCLE_CERTIFICATION_v75.md`
- `docs/ui/production/UI_PRODUCTION_V75_WORKTREE_SCOPE_RESOLUTION_v76_STARTUP_AUDIT.md`
- `docs/ui/production/UI_PRODUCTION_V75_WORKTREE_SCOPE_CLASSIFICATION_v76.md`
- `docs/ui/production/UI_PRODUCTION_V75_WORKTREE_SCOPE_RESOLUTION_CERTIFICATION_v76.md`

### COMMIT_V75_AUTOHEAL
- `scripts/autoheal/autoheal_rules.jsonl`
  - Full-schema v75 entry present with `detect_recurrence` in prevention test.

## No Current Candidates
- DO_NOT_COMMIT_GENERATED_BINARY: none in current dirty set.
- RESTORE_UNRELATED: none after diff analysis.
- NEEDS_BLOCKER_REPORT: none (all dirty files map to v75/v76 scope).

## Classification Verdict
- `CLASSIFICATION_COMPLETE_ALL_DIRTY_FILES_MAPPED_TO_V75_V76_SCOPE`
