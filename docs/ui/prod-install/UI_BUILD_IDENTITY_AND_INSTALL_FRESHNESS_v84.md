# UI_BUILD_IDENTITY_AND_INSTALL_FRESHNESS v84

**Date**: 2026-05-12T13:30:09Z  
**Source**: TITANE_INFINITY production build v33.0.17

---

## Build Identity

| Field | Value |
|-------|-------|
| Source version | `33.0.17` (package.json) |
| Cargo.toml version | `33.0.17` |
| tauri.conf.json version | `33.0.17` |
| index.html (4 strings) | `33.0.17` (patched v85) |
| Runtime `__APP_VERSION__` | `33.0.17` (Vite define inject) |
| Footer display | `TITANE∞ V33.0.17` |

## Installed Freshness

| Field | Value |
|-------|-------|
| `/usr/bin/titane-infinity` SHA256 | `13b2e3c33e0c74e4a83f0ba9072e6c91e56395ff58c0c8f107d13127f59730c2` |
| `deployment/latest` AppImage SHA256 | `6356181854dbef7b4a29fa1764df519e218ebd0c720ab47eecb6d16d793ce4e0` |
| `deployment/latest` DEB SHA256 | `78dbc164aa3c9d7129e7ab221f2c7ad40d090ccef63e3fad665d4f45e56d82b4` |
| `deployment/latest/VERSION.txt` | `33.0.17` |
| `dpkg -s titane-infinity` | `Version: 33.0.17 / Status: install ok installed` |

## Version Alignment Verdict

All 4 source version strings, built binary SHA, deployed artifact, and installed binary
are **fully aligned** at version `33.0.17`.

**BUILD_IDENTITY_STATUS**: `PASS — no drift detected`

## Known Limitations

- `data-testid="runtime-build-identity"` not yet present in footer/debug panel
  (tracked for future addition per mission v84 scope — not blocking)
- `SurfaceTruthBadge variant="PARTIAL"` in TIME page is **honest** — snapshot backend
  returns "degraded" on fresh install when no snapshots directory exists yet
