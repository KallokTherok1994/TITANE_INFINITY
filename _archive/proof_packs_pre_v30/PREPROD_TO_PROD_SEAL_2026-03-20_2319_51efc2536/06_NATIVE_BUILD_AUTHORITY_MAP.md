# 06 NATIVE DESKTOP BUILD AUTHORITY MAP
## Status: BLOCKED_ENV (Node v18 → G_PNPM_BUILD=FAIL → G_TAURI_BUILD_RELEASE=BLOCKED)

## Artifact path
src-tauri/target/release/titane-infinity (binary)
src-tauri/target/release/bundle/ (AppImage, .deb)

## Freshness
Last confirmed build: dist-28.0.0.tar.gz (stale, not HEAD bb41032e4)
Current binary NOT proven for HEAD

## Display
DISPLAY=:1 SET + Xvfb available → NOT a blocker once Node is resolved

## Stale artifact risk
dist-28.0.0.tar.gz is NOT the current HEAD build. Do not use as release artifact.

## Unlock path
1. Install Node >=22
2. pnpm install (engine-strict OK)
3. pnpm build (G_PNPM_BUILD gate)
4. pnpm exec tauri build --release (G_TAURI_BUILD_RELEASE gate)
