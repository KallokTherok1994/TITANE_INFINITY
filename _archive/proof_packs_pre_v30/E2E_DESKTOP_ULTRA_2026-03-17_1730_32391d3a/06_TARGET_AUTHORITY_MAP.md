# 06_TARGET_AUTHORITY_MAP.md

## Desktop E2E Target: Primary (Release Binary)

| Property | Value |
|----------|-------|
| Launcher | scripts/e2e/run-desktop-suite.js → scripts/e2e/tauri-wrapper.sh |
| Target artifact | src-tauri/target/release/titane-infinity |
| Target path | /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/titane-infinity |
| Size | 37,277,392 bytes |
| Build date | 2026-03-17 13:14:10 -0400 |
| HEAD at build | unknown (binary not stamped; build was ~4h before current HEAD) |
| Runtime marker | DISPLAY=:1 + tauri-driver + WebKitWebDriver |
| Build freshness | STALE_ARTIFACT_RISK — binary built at 13:14, current HEAD is 32391d3ab (17:30+) |
| Native driver dep | tauri-driver @ /home/titane-os/.cargo/bin/tauri-driver (PRESENT) |
| Environment dep | DISPLAY=:1 (env set), Xvfb must be running |
| IPC reachability | Proven in previous session (audio-tts x3 PASS at 16:20Z) |
| Proven | PARTIAL — binary present, drivers present, IPC proven in prior session |

## Desktop E2E Target: Fallback (AppImage)

| Property | Value |
|----------|-------|
| Launcher | wdio.desktop.conf.cjs APPIMAGE_FALLBACK_PATH |
| Target artifact | deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage |
| Target path | /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage |
| Version | v27.0.2 |
| HEAD at build | pre-32391d3ab (stale — v27.0.2 is multiple sessions behind) |
| Build freshness | STALE_ARTIFACT_RISK — do NOT use as certification target for current HEAD |
| Status | FALLBACK ONLY — not to be used as primary certification artifact |
| Proven | UNPROVEN for current HEAD |

## Driver Map

| Driver | Binary | Status |
|--------|--------|--------|
| tauri-driver | /home/titane-os/.cargo/bin/tauri-driver | PRESENT |
| WebKitWebDriver | /usr/bin/WebKitWebDriver | PRESENT |
| Xvfb | /usr/bin/Xvfb | PRESENT (not running at session start) |

## Build Freshness Risk Assessment

The release binary (src-tauri/target/release/titane-infinity) was built at 13:14.
Current HEAD (32391d3ab) includes commits made after 13:14:
- fix(guard): exclude devSudo diagnostic strings from Ollama direct-access guard
- feat(heal+telemetry+persona): wire autoHealEngine (e5515d71f)
- audit(agents): truth-align ecosystem (9b13edcd1)
- fix(ipc): register 13 qa_monitoring + reality_renderer commands (511be067c)
- fix(ipc): register time_commands (d818b0e5b)

**STALE_ARTIFACT_RISK: ACTIVE**
The binary does NOT include the IPC command registrations from FIX-009 through FIX-012.
Desktop E2E tests that invoke qa_monitoring, reality_renderer, or time_commands will fail against the stale binary.

## Certification Verdict for Target Authority

```
PRIMARY TARGET: STALE_ARTIFACT_RISK
  - Binary present, drivers present
  - Binary DOES NOT reflect current HEAD IPC registrations
  - Tests proven against binary state (not current HEAD)
  - For full PROVEN_RUNTIME: rebuild binary from current HEAD

FALLBACK TARGET: UNPROVEN (stale v27.0.2)

DESKTOP_AUTHORITY_VERDICT: STALE_ARTIFACT_RISK
```

## Required Action for Full Desktop Authority
```bash
# Rebuild binary from current HEAD:
pnpm run build:tauri:e2e
# Then re-run desktop E2E x3
pnpm run e2e:desktop:run
```
Note: `build:tauri:e2e` requires guard:ollama-proxy (Ollama must be running) and E2E build authorization.
