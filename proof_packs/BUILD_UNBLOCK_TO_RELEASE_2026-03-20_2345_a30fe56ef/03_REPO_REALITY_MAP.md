# 03 REPO REALITY MAP
HEAD: a30fe56ef (2026-03-20 23:32 EDT)
Branch: MAIN

## Dirty workspace (classified)
Pre-existing staged (other agents): registry/, CHANGELOG.md sections, README.md, proof_packs (prior sessions)
Pre-existing unstaged: none noted at build time
This session: RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt (updated with 4 fresh checksums)

## Artifact locations
dist/ — frontend build (fresh, this session)
src-tauri/target/release/titane-infinity — binary (41M, 2026-03-20 23:44:12)
src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.5.0_amd64.AppImage — 90M
src-tauri/target/release/bundle/deb/TITANE-Infinity_28.5.0_amd64.deb — 21M
src-tauri/target/release/bundle/rpm/TITANE-Infinity-28.5.0-1.x86_64.rpm — 21M

## Stale artifacts (do NOT use as release proof)
dist-28.0.0.tar.gz — stale archive, predates current HEAD
src-tauri/target/release/bundle/deb/TITANE-Infinity_28.0.0_amd64.deb — prior version

## Workflow locations
.github/workflows/ — 25 workflows present; release-unified.yml runs tauri build
