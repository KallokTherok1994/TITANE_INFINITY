# UI_DESKTOP_FUNCTIONAL_FAILURE_TRIAGE_v56

**Date**: 2026-05-10

---

## Failures in v56 Functional Run

**Total test failures**: 0  
**Total spec failures**: 0  
**Suite result**: 5/5 specs PASS

## Pre-existing Non-blocking Gate Failure

| Gate | Failure | Classification |
|---|---|---|
| `guard:ipc-contract` | `oauth_facebook_initiate` absent from tauri.conf.json | PREEXISTING_IPC_GUARD_FAILURE — not introduced in v56 |

This is a known pre-existing issue. OAuth Facebook was planned but never added to the Tauri capabilities. Not a v56 regression.

## Historical Failure Triage (resolved before v56)

| Phase | Module | Failure | Resolution |
|---|---|---|---|
| v55 | MEMORY | `bodyHTML.includes('ErrorBoundary')` false-positive | Fixed: h2 title + testid check |
| v56 startup | Advanced spec | Same broad string matching pattern | Fixed in startup audit |

## Degraded States (Not Failures)

The following modules are `FUNCTIONAL_DEGRADED_EXPECTED` — this is the correct honest classification for AI agent surfaces that require live backends unavailable in E2E:

- ADAPTIVE, HYPER_CENTER, ORCHESTRATION_CENTER, REALITY_CENTER, SELFHEAL, SENTINEL, SINGULARITY, WATCHDOG

These are NOT failures. They render content, show degraded state UI, and behave correctly in the absence of live AI services.
