# GATE REPORT

MODE=DURABLE
DATE=2026-05-15T10:26:57-04:00

## Build and Release Execution

1. Version bump applique: 35.1.5 -> 35.1.6 via `node scripts/bump-version.mjs` puis `node scripts/sync-versions.mjs`.
2. Rebuild frontend execute: `corepack pnpm run build` PASS (vite build + post-build).
3. Build release Linux execute: `corepack pnpm run build:tauri` PASS.
4. Bundles produits:
	- `src-tauri/target/release/bundle/appimage/titane-infinity_35.1.6_amd64.AppImage`
	- `src-tauri/target/release/bundle/deb/titane-infinity_35.1.6_amd64.deb`
	- `src-tauri/target/release/bundle/rpm/titane-infinity-35.1.6-1.x86_64.rpm`
5. Verification Android artifacts: `corepack pnpm run android:artifact:check` PASS (apk_count=1, aab_count=1).

## Deployment Latest Synchronization

1. Sync execute: `bash scripts/post-build/update-deployment-latest.sh` PASS.
2. Drift legacy nettoye: artefacts v35.1.1 supprimes de `deployment/latest/`.
3. RPM v35.1.6 ajoute explicitement a `deployment/latest/`.
4. Fichiers canoniques regeneres: `MANIFEST.json`, `SHA256SUMS.txt`, `SIZES.txt`, `VERSION.txt`.

## Desktop Install and Icons

1. Refresh user launcher/icons execute via `bash scripts/post-build/update-desktop-icons.sh` PASS partiel.
2. Installation locale fallback execute via `bash scripts/install-appimage.sh` PASS (`~/.local/bin/titane-infinity-appimage`).
3. Verite systeme actuelle:
	- `dpkg -s titane-infinity` => `Version: 34.0.12`
	- `~/.local/share/applications/titane-infinity.desktop` et `/usr/share/applications/titane-infinity.desktop` pointent sur `/usr/bin/titane-infinity`.
4. Blocage critique restant: installation DEB systeme v35.1.6 impossible sans sudo interactif (`sudo: il est necessaire de saisir un mot de passe`).

## Classification

- Verdict provisoire: `BLOCKED_APPROVAL`
- Raison: elevation privilegiee requise pour installer le binaire systeme et synchroniser les launchers systemes vers v35.1.6.
