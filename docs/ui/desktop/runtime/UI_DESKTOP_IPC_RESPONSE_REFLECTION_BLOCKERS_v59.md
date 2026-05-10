# UI Desktop IPC Response — Blockers v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Active Blockers

### BLOCKER-1: 39 routes still at PROOF_DEPTH_BLOCKED_BY_RUNTIME

**Root Cause**: WebKitWebDriver in headless mode cannot invoke these IPC commands — the Tauri IPC bridge receives the call but `window.__TAURI__.core.invoke` returns `IPC_UNAVAILABLE` in the probe context for commands requiring runtime state (session tokens, active AI providers, full message loop).

**Affected Routes**: `/titane` (complex commands), `/time` (complex), `/admin` (config), `/orchestration-*`, `/experience`, `/creation`, `/evolution`, `/twins`, `/fusion`

**Next Action**: Provide runtime state fixtures or run probes in interactive mode (not headless).

---

### BLOCKER-2: Auth-required commands

**Commands**: `oauth_facebook_get_profile`, `cp_get_ai_config`

**Root Cause**: These commands require a valid OAuth session or admin credentials. Probe context has no auth token.

**Next Action**: Mock auth token injection in test fixture, or mark as permanently GUARDED_ONLY.

---

### BLOCKER-3: Real-time event commands

**Routes**: `/sentinel`, `/watchdog`

**Root Cause**: These surfaces publish via event streams (Tauri emit), not request/response IPC. `probeInvoke` pattern doesn't apply.

**Next Action**: Add event listener probe variant in `uiDesktopBackendProofDepth.js`.

---

### BLOCKER-4: Remote CI not yet proven

**Root Cause**: v59 probes ran on local Tauri binary. Remote CI environment may differ (different WebKit, different WebDriver version, different IPC timing).

**Next Action**: See `UI_DESKTOP_REMOTE_CI_READINESS_v59.md` for remote readiness plan.

---

## Resolved (v59)

| Previously Blocked | Resolution |
|---|---|
| `navigateAndWait` double-wrapped selector | Fixed by Python regex replace |
| v58 all BLOCKED_BY_RUNTIME | 11 promoted to UI_REFLECTS_BACKEND_RESULT |
| No proof-level verifier | `scripts/verify/verify-backend-proof-depth.mjs` created |
| No taxonomy | `UI_DESKTOP_IPC_RESPONSE_REFLECTION_TAXONOMY_v59.md` created |
