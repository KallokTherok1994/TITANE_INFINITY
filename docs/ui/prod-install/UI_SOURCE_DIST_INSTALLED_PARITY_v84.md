# UI_SOURCE_DIST_INSTALLED_PARITY v84

**Date**: 2026-05-12T13:30:09Z

---

## Source → Dist → Deployment → Installed Chain

| Stage | Version | SHA256 (first 32 chars) | Status |
|-------|---------|------------------------|--------|
| `package.json` | 33.0.17 | N/A (source) | ✅ CANONICAL |
| `src-tauri/tauri.conf.json` | 33.0.17 | N/A (source) | ✅ ALIGNED |
| `src-tauri/Cargo.toml` | 33.0.17 | N/A (source) | ✅ ALIGNED |
| `index.html` (4 strings) | 33.0.17 | N/A (source) | ✅ ALIGNED |
| AppImage (build output) | 33.0.17 | `6356181854dbef7b4a29fa17...` | ✅ |
| DEB (build output) | 33.0.17 | `78dbc164aa3c9d7129e7ab22...` | ✅ |
| `deployment/latest/VERSION.txt` | 33.0.17 | — | ✅ |
| `deployment/latest` AppImage | 33.0.17 | `6356181854dbef7b4a29fa17...` | ✅ MATCHES BUILD |
| `deployment/latest` DEB | 33.0.17 | `78dbc164aa3c9d7129e7ab22...` | ✅ MATCHES BUILD |
| `/usr/bin/titane-infinity` | 33.0.17 | `13b2e3c33e0c74e4a83f0ba90...` | ✅ INSTALLED |
| `dpkg -s titane-infinity` | `Version: 33.0.17` | — | ✅ |

## Version Sync Pipeline

`bump-version.mjs` → `package.json` → `sync-versions.mjs` →
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/tauri.base.json`
- `tauri.base.json`
- `runtime/stable/tauri.conf.json`
- `runtime/stable/manifest.json`
- `index.html` (4 patterns — section 7 fix, AH-v85)
- `RELEASE_SURFACE_INVENTORY.md` (manual update)

**Post-bump Prettier run required** (new requirement found in v84 — CI fix):
```bash
pnpm prettier --write runtime/stable/manifest.json runtime/stable/tauri.conf.json \
  scripts/sync-versions.mjs src-tauri/tauri.base.json src-tauri/tauri.conf.json tauri.base.json
```

## VERDICT

**PARITY**: `FULL_PARITY_CONFIRMED` — Source, dist, deployment/latest, and installed are all 
aligned at version 33.0.17. No drift between any stage.

**IMPORTANT FINDING**: The `bump-version.mjs` pipeline must run Prettier after writing files 
to prevent CI format:check failure. This is tracked as AH-v84-PRETTIER-BUMP-PIPELINE.
