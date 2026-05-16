# TITANE_INFINITY Frontend UI Truth

## UI truth vocabulary

- `DEV_VISIBLE` — an element is rendered in the local development UI only.
- `UI_INTEGRATED` — a surface is wired into the app shell and route graph.
- `DIST_BUILT` — the production build outputs exist and include the expected entry metadata.
- `STABLE_ARTIFACT_BUILT` — the packaged stable artifact exists and is fresher than the latest build output.
- `STABLE_PROCESS_STARTED` — the stable AppImage process launched and is running; no DOM/window proof yet.
- `STABLE_WINDOW_OBSERVED` — a window with the correct version title was confirmed via wmctrl or equivalent.
- `STABLE_WINDOW_CONFIRMED` — SurfaceTruth/DOM inspection confirmed app version, buildTimestamp, and runtime identity.
- `SURFACE_TRUTH_CONFIRMED` — WDIO/DOM proof read actual `data-app-version`, `data-build-timestamp`, and `data-surface-truth` from the stable runtime.
- `SURFACE_TRUTH_BLOCKED_OLLAMA` — E2E harness present but Ollama AI backend unavailable; DOM inspection not run.
- `SURFACE_TRUTH_HARNESS_MISSING` — no DOM inspection harness available; window observation only.
- `INSTALLED_LAUNCHER_FRESH` — the menu/.desktop Exec target points to the current-version artifact (`/usr/bin` updated to match).
- `USER_LOCAL_LAUNCHER_FRESH` — the user-local `.desktop` Exec points to the fresh stable AppImage directly; system install (`/usr/bin`) remains stale.
- `INSTALLED_LAUNCHER_STALE` — the menu/.desktop Exec still points to an older artifact or binary version.
- `SYSTEM_INSTALL_STALE` — `/usr/bin/titane-infinity` was not updated; requires sudo DEB install.
- `BLOCKED_SUDO_REQUIRED` — updating the system launcher or /usr/bin requires sudo and cannot proceed without it.
- `WEB_PWA_CONFIRMED` — the PWA service worker/cache state has been verified for web deployment only.
- `ANDROID_DEVICE_CONFIRMED` — a real Android device has been validated with installed artifact truth.
- `BLOCKED_RUNTIME_TRUTH` — runtime truth is not provable with local artifacts or test evidence.
- `BLOCKED_ENV` — the local environment cannot support the required proof step.

## Truth levels

- Visible is not proven.
- Dev visible is not the same as dist built.
- Dist built is not the same as stable artifact launched.
- Stable artifact built is not the same as installed/active runtime.

## Required truth artifacts

A UI truth claim requires all of the following when applicable:

- **source truth** — the source code and route/component declarations exist.
- **surface truth** — the rendered surface exposes a stable identity such as `data-surface-truth` or `SurfaceRoot`.
- **build truth** — production build metadata is emitted and matches package version.
- **artifact truth** — packaged stable artifacts exist and are fresh compared to build outputs.
- **runtime/window truth** — the active runtime or launcher has been confirmed to reflect the new artifact.

## SurfaceRoot rule

Every canonical user-visible surface should expose stable surface identity.
If a page or shell is touched, prefer `SurfaceRoot` or a `data-surface-truth` anchor at that surface boundary.

## Build truth rule

Production builds must emit enough metadata to compare `appVersion`, `buildTimestamp`, `mainEntry`, `runtimeTarget`, and `viteBase` when possible.

## Artifact freshness vs. metadata freshness

**Metadata freshness is NOT artifact truth.**
- Metadata files like `runtime/stable/manifest.json` or `tauri.conf.json` are configuration, not binaries.
- Stable artifact truth requires the actual AppImage/DEB file to be newer than `dist/build-truth.json` and `dist/index.html`.
- Touching or refreshing metadata files without rebuilding AppImage/DEB does not prove artifact freshness.
- The `gate-stable-artifact-freshness.sh` validator checks the mtime of actual `.AppImage` and `.deb` binaries, not config files.

## Stable truth rule

Stable desktop proof requires launching the new artifact directly or proving installed launcher/binary freshness; if local artifact proof is unavailable, classify the proof lane `BLOCKED_ENV`.

These three lanes are independent and must be classified separately:
- **artifact truth** (`gate-stable-artifact-freshness.sh`) — AppImage/DEB mtime vs. dist outputs.
- **direct runtime/window truth** (`gate-stable-window-truth.sh`) — process launched and window observed.
- **installed launcher truth** (`gate-stable-launcher-truth.sh`) — menu/.desktop Exec target and /usr/bin version alignment.

`STABLE_WINDOW_CONFIRMED` requires all three lanes proven. A fresh artifact with a stale installed launcher is classified `INSTALLED_LAUNCHER_STALE`, not PASS.

`USER_LOCAL_LAUNCHER_FRESH` is an accepted partial alternative to `INSTALLED_LAUNCHER_FRESH` when:
- sudo is unavailable for global DEB install, and
- the user-local `.desktop` Exec target has been updated to point directly to the fresh stable AppImage, and
- `SYSTEM_INSTALL_STALE + BLOCKED_SUDO_REQUIRED` are explicitly declared in the proof report.

## PWA rule

Service worker and cache truth apply only to web/PWA deployment. They do not substitute for Tauri desktop artifact authority.

## UI data truth classification

Page sections must be classified as one of the following:

- `LIVE` — data sourced exclusively from live Tauri IPC, hooks, or real backend.
- `ACTIVE_PARTIAL` — mix of live and hardcoded/curated data; curated sections must be disclosed.
- `SIMULATED_UI` — entirely hardcoded/example data with no live service connection.
- `CURATED` — example/template data, clearly labeled with `CuratedDataBanner` or equivalent.

Rules:
- Hardcoded data displayed to the user must be labeled with `CuratedDataBanner` or a visible disclosure.
- No hardcoded metric presented as live data without disclosure.
- `SIMULATED_UI` sections must be upgraded or clearly disclosed before claiming a page is `LIVE`.

## Module Context Registry rule

Every canonical user-visible page must publish a `ModuleContextSnapshot` to `moduleContextRegistry` when its data loads. The chat reads module context from the registry — never from DOM scraping.

- Snapshots must be prompt-safe: no secrets, no API keys, no raw tokens.
- Snapshots must declare their status (`live`, `partial`, `degraded`, `curated`, etc.).
- Snapshots must declare their primary data source.
- Freshness must be tracked (`lastUpdated` timestamp).
- See `src/services/modules/moduleContextTypes.ts` for the contract.

## Stale UI repair policy

When a page has layout or data truth issues:
1. **Disclose first** — add `CuratedDataBanner` or `EmptyStateTruth` with honest reason.
2. **Repair** — connect real service when available.
3. **Blue-green rebuild** — only when architecture is too broken to repair safely.
4. **Never delete** a page until a tested replacement exists with equal or better runtime proof.

## Stoplines

- stale version in package or runtime metadata
- missing stable surface identity
- missing build metadata
- failing `dist` or AppImage/DEB freshness gates
- outdated launcher or installed artifact metadata
- stale service worker scope in web/PWA contexts
- missing E2E proof for new user-facing surfaces
- hardcoded data presented as live without `CuratedDataBanner` disclosure
- module context snapshot not published for canonical pages
