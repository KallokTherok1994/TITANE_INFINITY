# TITANE∞ v31.2.7 — Build Release Network Report

## Verdict

PASS

## Scope

- Correction locale de typage sur la surface conversationnelle canonique
- Build Tauri release 31.2.7
- Publication locale dans `deployment/latest`
- Synchronisation post-build desktop locale
- Démarrage et preuve du serveur réseau canonique

## Proof Summary

- `corepack pnpm run check` : PASS
- `corepack pnpm exec tauri build --config src-tauri/tauri.conf.json` : PASS
- `bash scripts/post-build/update-desktop-icons.sh` : PASS avec `BLOCKED_SUDO_REQUIRED` sur les surfaces système
- `bash scripts/android/vite-network-server.sh` : PASS (`http://127.0.0.1:1420` répond HTTP 200)
- `bash scripts/autoheal/detect_recurrence.sh` : PASS
- `bash scripts/verify_instructions.sh` : PASS
- `corepack pnpm verify:registry` : PASS

## Release Truth

- AppImage : `Titan-Stable_31.2.7_amd64.AppImage`
  - size: `94484984`
  - sha256: `cca0b17f07bc9a71934d2f19d551bb2ccb270743b62dde5331063fabfc9abac6`
- DEB : `Titan-Stable_31.2.7_amd64.deb`
  - size: `21797182`
  - sha256: `925a4faee40c9213b73966d0973f7519c8d32bb2bd5c6009c713fc74f3b5a0b0`
- Binary : `titane-infinity`
  - size: `47470008`
  - sha256: `272b66159ec37a1e68afb3444f3768c75237bd64bf0aef8b2f668e1b118884ec`

## Constraints

- `scripts/post-build/update-desktop-icons.sh` a synchronisé le launcher local utilisateur et les caches, mais la réplication système vers `/usr/bin` et `/usr/share/applications` reste `BLOCKED_SUDO_REQUIRED` sans sudo non interactif.

## Rollback

- `git restore -- src/components/sections/ConversationSection.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl RELEASE_SURFACE_INVENTORY.md deployment/latest/MANIFEST.json deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt reports/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/GATE_REPORT.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/VERDICT.md proof_packs/TITANE_BUILD_RELEASE_NETWORK_31.2.7_2026-04-27/ROLLBACK.md`