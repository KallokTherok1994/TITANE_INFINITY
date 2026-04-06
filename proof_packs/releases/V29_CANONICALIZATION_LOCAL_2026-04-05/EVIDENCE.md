# EVIDENCE — V29_CANONICALIZATION_LOCAL_2026-04-05

## Files changed

```text
README.md
RELEASE_ARTIFACTS_CHECKSUMS.txt
RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt
RELEASE_SURFACE_INVENTORY.md
index.html
launch-titane.sh
public/manifest.json
runtime/dev/tauri.conf.json
runtime/dev/tauri.network.conf.json
runtime/stable/tauri.conf.json
scripts/autoheal/autoheal_rules.jsonl
scripts/update-desktop-icon.sh
src-tauri/tauri.conf.json
titane-infinity.desktop
public/titane-icon.png
public/titane-icon-512.png
```

## Diff summary

```text
14 files changed, 64 insertions(+), 43 deletions(-)
+ 2 canonical public icons added
```

## Artifact truth (from `deployment/latest/`)

### Names
- `Titan-Stable_29.0.0_amd64.AppImage`
- `Titan-Stable_29.0.0_amd64.deb`

### Sizes
- `Titan-Stable_29.0.0_amd64.AppImage`: `90356216 bytes (87M)`
- `Titan-Stable_29.0.0_amd64.deb`: `17597148 bytes (17M)`

### SHA256
- `12ed61d6581f7d16d626a8da73dbba8c37b8f56b9f562deca878898170a60a84  Titan-Stable_29.0.0_amd64.AppImage`
- `2bcfc64e57f5f234a6fa43dd810e8240ba1a37c61faee934f8e136b83f04f880  Titan-Stable_29.0.0_amd64.deb`

## Final launcher

```text
Name=TITANE∞ v29.0.0
Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/launch-titane.sh
Icon=/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/icons/128x128.png
```

## Final surface decisions

- `BUILD_MATRIX = APPIMAGE+DEB`
- `LAUNCHER_MODE = GENERATED_DYNAMIC`
- `DEV_POLICY = SYNC_TO_29_0_0_DEV`
- `ICON_POLICY = KEEP_CURRENT_ICONS`
