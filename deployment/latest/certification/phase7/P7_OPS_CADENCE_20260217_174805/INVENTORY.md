# P7 Artifacts Inventory

**Date:** 2026-02-17T17:48:00Z  
**Total Found:** 53 files (AppImage + DEB versions)

---

## Latest Stable Release (27.0.0)

### AppImage
- **Path:** runtime/stable/Titan-Stable_27.0.0_amd64.AppImage
- **Size:** 82M
- **Type:** ELF 64-bit executable
- **Status:** ✅ Field Smoke PASS (P6)
- **Purpose:** Standalone launcher (no installation required)

### DEB Package
- **Path:** runtime/stable/Titan-Stable_27.0.0_amd64.deb
- **Size:** 9.9M
- **Package:** titan-stable v27.0.0
- **Architecture:** amd64
- **Status:** ✅ Field Smoke PASS (P7)
- **Purpose:** System package (installable via apt)

---

## Alternative Deployment Points

### Deployment Latest
- deployment/latest/TITANE-Infinity_27.0.2_amd64.deb (27.0.2 variant)
- deployment/latest/Titan-Stable_27.0.0_amd64.AppImage (27.0.0 variant)

### Archive/PRODUCTION
- deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.deb
- deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.AppImage

### Version History (Other Installed)
- v26.2.0 (DEB + AppImage)
- v26.4.0 (DEB + AppImage)
- v27.0.1 (DEB + AppImage)
- v27.0.2 (DEB + AppImage)

---

## Checksums (27.0.0-stable)

### AppImage
```
d5c0e6945dca8142659daec7b2f766a53c56498383dfb19951c0cc8549d56e9f
```

### DEB
```
e0c380592300d9b68e4c94b2ac11174654836c7fd3702bc20d544f899e20f656
```

---

## Field Smoke Status

| Artifact | Type | Extraction | Execution | Ports | Verdict |
|----------|------|-----------|-----------|-------|---------|
| Titan-Stable_27.0.0_amd64.AppImage | ELF | N/A | ✅ PASS | ✅ Clean | ✅ PASS |
| Titan-Stable_27.0.0_amd64.deb | Debian | ✅ OK | ✅ PASS | ✅ Clean | ✅ PASS |

---

## Distribution Readiness

- ✅ Both formats tested (AppImage + DEB)
- ✅ No dev server ports detected
- ✅ Production logs confirmed
- ✅ Ready for beta field distribution

---

## Storage Recommendations

| Location | Artifact | Purpose | Retention |
|----------|----------|---------|-----------|
| runtime/stable/ | Latest 27.0.0 | Distribution | Always |
| deployment/latest/ | Multiple versions | Fallback | Keep (append-only) |
| deployment/v27.0.0-PRODUCTION/ | Archive 27.0.0 | Rollback reference | Forever |

---

**Inventory Complete:** Ready for Release Distribution Pack (RELEASE_DISTRIBUTION_PACK.md)
