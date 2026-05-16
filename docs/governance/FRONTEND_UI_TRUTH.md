# TITANE_INFINITY Frontend UI Truth

## UI truth vocabulary

- `DEV_VISIBLE` — an element is rendered in the local development UI only.
- `UI_INTEGRATED` — a surface is wired into the app shell and route graph.
- `DIST_BUILT` — the production build outputs exist and include the expected entry metadata.
- `STABLE_ARTIFACT_BUILT` — the packaged stable artifact exists and is fresher than the latest build output.
- `STABLE_WINDOW_CONFIRMED` — the installed launcher/binary or runtime window has been observed running the new artifact.
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

## PWA rule

Service worker and cache truth apply only to web/PWA deployment. They do not substitute for Tauri desktop artifact authority.

## Stoplines

- stale version in package or runtime metadata
- missing stable surface identity
- missing build metadata
- failing `dist` or AppImage/DEB freshness gates
- outdated launcher or installed artifact metadata
- stale service worker scope in web/PWA contexts
- missing E2E proof for new user-facing surfaces
