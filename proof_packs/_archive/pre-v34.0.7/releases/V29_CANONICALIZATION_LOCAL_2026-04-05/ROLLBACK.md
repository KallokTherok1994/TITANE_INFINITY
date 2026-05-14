# ROLLBACK — V29_CANONICALIZATION_LOCAL_2026-04-05

## Fast rollback

```bash
git restore -- \
  README.md \
  RELEASE_ARTIFACTS_CHECKSUMS.txt \
  RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt \
  RELEASE_SURFACE_INVENTORY.md \
  index.html \
  launch-titane.sh \
  public/manifest.json \
  runtime/dev/tauri.conf.json \
  runtime/dev/tauri.network.conf.json \
  runtime/stable/tauri.conf.json \
  scripts/autoheal/autoheal_rules.jsonl \
  scripts/update-desktop-icon.sh \
  src-tauri/tauri.conf.json \
  titane-infinity.desktop
rm -f public/titane-icon.png public/titane-icon-512.png
```

## Launcher-only rollback

```bash
git restore -- launch-titane.sh scripts/update-desktop-icon.sh titane-infinity.desktop
bash scripts/update-desktop-icon.sh
```

## Metadata-only rollback

```bash
git restore -- index.html public/manifest.json README.md RELEASE_SURFACE_INVENTORY.md \
  RELEASE_ARTIFACTS_CHECKSUMS.txt RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt
rm -f public/titane-icon.png public/titane-icon-512.png
```
