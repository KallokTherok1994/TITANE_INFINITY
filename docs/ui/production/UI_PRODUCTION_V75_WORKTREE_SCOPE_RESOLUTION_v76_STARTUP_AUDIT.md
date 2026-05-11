# UI_PRODUCTION_V75_WORKTREE_SCOPE_RESOLUTION_v76_STARTUP_AUDIT

Date: 2026-05-11
Mode: DURABLE
Mission: TITANE UI_PRODUCTION_V75_WORKTREE_SCOPE_RESOLUTION_AND_REMOTE_CI_SEAL_v76

## Startup Git Truth
- HEAD: `1e78bb8a4a79d76f429ec7853eb41df4507ab161`
- Branch: `MAIN`
- Upstream: `origin/MAIN`
- Ahead/behind (`@{u}...HEAD`): `0 0`
- Remote MAIN (`ls-remote`): `1e78bb8a4a79d76f429ec7853eb41df4507ab161`

## Dirty Worktree at Startup (full list)
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-27-03-013Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-29-04-713Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-31-42-899Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-34-20-385Z.png`
- `D _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-desktop-ultra-smoke-wdio-tauri-launches-app-validates-ready-protocol-runs-smoke-navigation-and-no-silence-chat-2026-03-04T23-37-06-388Z.png`
- `M e2e/production/ui-production-route-proof.spec.ts`
- `M scripts/autoheal/autoheal_rules.jsonl`
- `M scripts/verify/verify-ui-production-route-proof.mjs`
- `M src-tauri/gen/android/buildSrc/build.gradle.kts`
- `M src-tauri/gen/android/buildSrc/src/main/java/com/titane/infinity/stable/kotlin/BuildTask.kt`
- `M src-tauri/gen/android/buildSrc/src/main/java/com/titane/infinity/stable/kotlin/RustPlugin.kt`
- `M src-tauri/src/agenda/types.rs`
- `M src-tauri/src/time_commands.rs`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-27-03-013Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-29-04-713Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-31-42-899Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-34-20-385Z.png`
- `?? _archive/proof_packs_pre_v30/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke/failure-ui-ultra-smoke-2026-03-04T23-37-06-388Z.png`
- `?? artifacts/ui-production/current-production-route-proof.jsonl`
- `?? artifacts/ui-production/v74-production-route-proof.jsonl`
- `?? docs/ui/production/UI_PRODUCTION_ARTIFACT_LIFECYCLE_AUDIT_v75.md`
- `?? docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_AND_ARTIFACT_LIFECYCLE_CERTIFICATION_v75.md`
- `?? docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_v75_STARTUP_AUDIT.md`
- `?? docs/ui/production/UI_PRODUCTION_REMOTE_CI_STATUS_v75.md`

## Required v75 Presence Checks
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_v75_STARTUP_AUDIT.md`: FOUND
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_STATUS_v75.md`: FOUND
- `docs/ui/production/UI_PRODUCTION_ARTIFACT_LIFECYCLE_AUDIT_v75.md`: FOUND
- `docs/ui/production/UI_PRODUCTION_REMOTE_CI_SEAL_AND_ARTIFACT_LIFECYCLE_CERTIFICATION_v75.md`: FOUND
- `e2e/production/ui-production-route-proof.spec.ts`: FOUND
- `scripts/verify/verify-ui-production-route-proof.mjs`: FOUND

## Startup Blockers
1. Dirty worktree required deterministic per-file classification before commit.
2. v75 local patch set was uncommitted.
3. Remote CI for current HEAD had known failed workflows and required post-push re-evaluation on corrected commit.
