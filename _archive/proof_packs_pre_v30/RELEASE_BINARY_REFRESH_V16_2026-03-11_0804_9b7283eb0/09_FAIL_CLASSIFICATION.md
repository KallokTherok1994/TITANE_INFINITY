# 09 Fail Classification

## Active Fail: FAIL_RUNTIME_STALE_BINARY

- **ID**: FAIL-V16-001
- **Session**: V16 RELEASE_BINARY_REFRESH
- **Classification**: FAIL_RUNTIME_STALE_BINARY
- **Severity**: HIGH — UI correctness proof invalidated by stale binary
- **Scope**: Deployed runtime

### Evidence

1. `/usr/bin/titane-infinity` mtime=2026-03-07 < V12/V13 fix dates (2026-03-11)
2. SHA16=da985ffeec4e1c51 differs from expected post-fix binary
3. deployment/latest has ONLY v26.4.0, not v27.2.0 AppImage
4. MANIFEST_v27.2.0.json tag_commit=02bce9c7c — NOT current HEAD (9b7283eb0)

### Fix Applied

- Vite rebuild: DONE 2026-03-11 08:08 ✓
- Cargo rebuild: IN PROGRESS 2026-03-11 08:09 →

### Resolution Status

FAIL_RUNTIME_STALE_BINARY → RESOLVED
- New binary SHA16=6582163646496a4f, mtime=2026-03-11 08:18 ✓
- WDIO x3 PASS (run1=0, run2=0, run3=0) ✓

## Secondary: WARN_DEPLOYMENT_ARTIFACT_GAP

- **ID**: WARN-V16-002
- **Classification**: WARN deployment artifacts out of date
- **Severity**: MEDIUM — deployment/latest not updated after V12/V13
- **Resolution**: Not addressed in V16 scope (new build binary only, no bundle+deploy)
- **Follow-up**: Requires `cargo tauri build --bundles deb,appimage` + `deployment/latest/` update

## Verdict

PRIMARY_FAIL_RESOLVED — WDIO x3 PASS with new binary; WARN_DEPLOYMENT_GAP logged for follow-up
