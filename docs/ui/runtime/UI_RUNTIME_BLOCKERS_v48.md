# UI Runtime Blockers — v48 (Section F4)

**Mission**: `TITANE_UI_BACKEND_RUNTIME_PROOF_EXECUTION_v48`
**Generated**: 2026-05-10

---

## F4.1 — Blocker Registry

### BLOCKER-1: `/dev` Badge — Browser Mode ErrorBoundary
| Field | Value |
|---|---|
| ID | `BLOCKER-v48-DEV-ERRORBOUNDARY` |
| Class | `BLOCKED_BY_UI_FAILURE` |
| Scope | Browser lane only |
| Affected | `/dev` route — `surface-truth-badge-partial` not reachable in browser |
| Root cause | `useQAMonitoring()` + `useOneCore()` call Tauri IPC → throw in browser → `<ErrorBoundary context="DevCenter">` fires |
| Badge in code | ✅ YES — 3 locations in DevPage.tsx (lines 819, 831, 854) |
| Impact | 1 test soft-classified as `BADGE_PROOF=DESKTOP_ONLY` instead of hard fail |
| Resolution path | Desktop Tauri rebuild + `pnpm run e2e:desktop` → badge proven in Tauri runtime |
| Workaround applied | `badgeRequiresDesktopRuntime: true` flag in test spec — honest classification |
| Severity | LOW — badge is in code, not missing |

---

### BLOCKER-2: OAuth Capability Allowlist
| Field | Value |
|---|---|
| ID | `BLOCKER-v48-OAUTH-CAPABILITY-ALLOWLIST` |
| Class | `BLOCKED_BY_PREEXISTING_TEST_FAILURE` |
| Scope | `tauri.conf.json` capabilities section |
| Affected | `oauth_facebook_initiate` (+ 3 other OAuth commands potentially) |
| Root cause | OAuth commands registered in Rust + security.ts + main.rs but missing from tauri.conf.json capabilities array |
| Pre-existing | ✅ YES — verified by stashing all v48 changes, same failure reproduced |
| Impact | 1 IPC contract test fails (`guard:ipc-contract`) |
| Resolution path | Add `oauth_facebook_initiate` (and other missing oauth) to `tauri.conf.json` capabilities |
| Severity | MEDIUM — security-relevant but pre-existing, no regression introduced |

---

### BLOCKER-3: Desktop E2E — WORKSPACE_AHEAD_OF_RUNTIME
| Field | Value |
|---|---|
| ID | `BLOCKER-v48-DESKTOP-WORKSPACE-AHEAD` |
| Class | `BLOCKED_BY_WORKSPACE_AHEAD_OF_RUNTIME` |
| Scope | Desktop Tauri E2E lane |
| Affected | `pnpm run e2e:desktop` — exits code 32 |
| Root cause | `src/pages/DevPage.tsx` modified in v48 → native binary policy detects workspace ahead of installed binary |
| Resolution path | Run `pnpm run build:tauri` → rebuild Tauri binary with DevPage changes → re-run e2e:desktop |
| Severity | LOW — expected after source modification, not a test issue |

---

### BLOCKER-4: Remote Gateway — Infrastructure Not Available
| Field | Value |
|---|---|
| ID | `BLOCKER-v48-REMOTE-GATEWAY` |
| Class | `BLOCKED_BY_REMOTE_GATEWAY` |
| Scope | Lane 7 — remote strict E2E |
| Affected | `e2e/remote-gateway.spec.ts` with `TITANE_E2E_REMOTE_STRICT=1` |
| Root cause | Remote gateway infrastructure not running in this session |
| Resolution path | Start remote gateway + API keys → re-run Lane 7 |
| Severity | LOW — expected for offline session |

---

### BLOCKER-5: Android E2E — Device Not Connected
| Field | Value |
|---|---|
| ID | `BLOCKER-v48-ANDROID-DEVICE` |
| Class | `BLOCKED_BY_ANDROID_DEVICE` |
| Scope | Lane 8 — Android E2E |
| Affected | `pnpm run test:e2e:android:browser` |
| Root cause | No Android device connected (Samsung Galaxy S25 Ultra or emulator) |
| Resolution path | Connect device or start emulator → set `TITANE_E2E_ANDROID_DEVICE=1` → re-run |
| Severity | LOW — expected for non-device session |

---

## F4.2 — Blocker Summary

| Blocker | Class | Severity | In-scope v48 | Resolution |
|---|---|---|---|---|
| `/dev` ErrorBoundary browser | `BLOCKED_BY_UI_FAILURE` | LOW | ✅ Documented | Desktop rebuild |
| OAuth capability allowlist | `BLOCKED_BY_PREEXISTING_TEST_FAILURE` | MEDIUM | ✅ Documented | Separate patch |
| Desktop workspace-ahead | `BLOCKED_BY_WORKSPACE_AHEAD_OF_RUNTIME` | LOW | ✅ Documented | Rebuild after commit |
| Remote gateway | `BLOCKED_BY_REMOTE_GATEWAY` | LOW | ✅ Documented | Infrastructure |
| Android device | `BLOCKED_BY_ANDROID_DEVICE` | LOW | ✅ Documented | Connect device |

**Regression check**: 0 new regressions introduced by v48. All blockers are pre-existing or expected environment limitations.
