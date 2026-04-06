# 02 OFFICIAL WEB RESEARCH NOTES

## Source: Tauri 2.x frontendDist docs
- `frontendDist` (tauri.conf.json) specifies frontend asset location
- In production bundles: frontend assets are EMBEDDED into the AppImage/DEB binary
- Consequence: the installed `/usr/bin/titane-infinity` (DEB v27.2.0, March 7) embeds the pre-V13-fix frontend
- See: https://tauri.app/reference/config/#frontendDist

## Source: WebdriverIO + tauri-driver binary selection
- tauri-wrapper.sh implements priority order: TAURI_BINARY_PATH > AppImage > release/debug > system /usr/bin
- Since no AppImage in runtime/stable/ or deployment/latest/builds/, fallback = /usr/bin/titane-infinity
- The installed binary is v27.2.0 from March 7 (pre-V13 commit March 11)
- This is the authoritative binary for E2E testing

## Source: React Router v7 duplicate route behavior
- Duplicate `path` in Routes block → first match wins (no crash, but second route unreachable)
- V13 removed the duplicate — correct, minimal, safe patch
- See: https://reactrouter.com/en/main/components/routes

## Conclusion
- Binary stale vs source: YES (binary March 7, source fix March 11)
- Observable failure: NONE (duplicate route was unreachable path, first match still valid)
- Tests: PASS with stale binary → binary staleness is a maintenance concern, not a P0 defect
