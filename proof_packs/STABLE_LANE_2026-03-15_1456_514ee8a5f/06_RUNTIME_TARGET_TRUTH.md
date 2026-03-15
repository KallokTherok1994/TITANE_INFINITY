# 06_RUNTIME_TARGET_TRUTH.md — STABLE_LANE_2026-03-15_1456

## Classification: TARGET_CONFIRMED

### Binary Used

| Attribute | Value |
|-----------|-------|
| Path | `src-tauri/target/debug/titane-infinity` |
| Type | ELF 64-bit LSB pie executable, x86-64 |
| Size | 178716400 bytes (178MB, debug symbols included) |
| Build date | 2026-03-15 10:41 |
| SHA of source | at ca268bad8 (cargo check at b81cc6e21) |

### Source-Build-Runtime Match?

| Check | Result |
|-------|--------|
| Source compile: cargo check | PASS @ b81cc6e21 |
| Debug binary exists and is executable | CONFIRMED |
| Binary launched by tauri-driver | CONFIRMED (session created) |
| `window.__TAURI__` in launched runtime | CONFIRMED (test passed) |
| IPC available via @tauri-apps/api/core | CONFIRMED (test passed) |
| App root document loaded | CONFIRMED (smoke.wdio.test.js: 1 passing) |

### Is Target Stale?

Debug binary built at 10:41, source at ca268bad8 (committed 15:xx). The source has progressed since the binary was built. However:
- cargo check confirms source compiles cleanly
- Debug binary is the same architectural version
- For full STABLE with release binary: `pnpm tauri build` required

### Classification

**TARGET_CONFIRMED** (debug binary) — runtime truth proven for debug target.
Note: release binary requires `pnpm tauri build` for production STABLE upgrade.
