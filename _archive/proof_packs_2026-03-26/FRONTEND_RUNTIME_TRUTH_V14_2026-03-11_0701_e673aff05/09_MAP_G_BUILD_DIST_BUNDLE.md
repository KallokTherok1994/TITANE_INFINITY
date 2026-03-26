# 09 MAP G - BUILD / DIST / BUNDLE

## Build config (tauri.conf.json)
- beforeBuildCommand: "corepack pnpm exec vite build"
- frontendDist: "../dist"
- resources: ["../dist"]
- targets: "all" (AppImage + DEB)

## Build chain
- pnpm exec vite build → dist/
- tauri bundle → embeds dist/ into AppImage/DEB

## dist/ state
- dist/ NOT present in V14 worktree (no local build in this session)
- V14 is analysis-only session, no new build triggered

## Installed binary
- /usr/bin/titane-infinity: v27.2.0, DEB, installed 2026-03-07
- Binary date: BEFORE V13 fix (March 11) → embeds pre-fix frontend
- Size: 30,335,704 bytes

## Consequence
- Binary stale: YES (by ~4 days)
- Observable impact: MINIMAL (duplicate route fix doesn't break functionality)
- WDIO tests run against this binary → PASS

## AppImage availability
- runtime/stable/: contains only manifests (no AppImage)
- deployment/latest/builds/: contains hashes + verification, no AppImage binary

## Status: STALE_BINARY (P2 — maintenance, non-blocking)
