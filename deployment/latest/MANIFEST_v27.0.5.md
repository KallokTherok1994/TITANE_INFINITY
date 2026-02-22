# TITANE Infinity v27.0.5 - Production Deployment Manifest

**Release Date:** 22 février 2026  
**Deployment Status:** ✅ LIVE  
**Authorization Token:** GO_FOR_PROD_DEPLOY__TITANE_INFINITY

## Artifact Registry

### AppImage (Linux Universal)
- **File:** TITANE-Infinity_27.0.5_amd64.AppImage
- **Size:** 89.2 MB
- **SHA256:** `37463c478138c2d39bfc2ebae3de571cfcc0cb1a754af2582a0ee7d8ea5b72be`
- **Permissions:** 755 (executable)
- **Usage:** `./TITANE-Infinity_27.0.5_amd64.AppImage`

### DEB Package (Debian/Ubuntu)
- **File:** TITANE-Infinity_27.0.5_amd64.deb
- **Size:** 13.8 MB
- **SHA256:** `e9d44ff4c04ca447bac6fb270e55ffc6c00c18bc4c8f3529d9a2d3c2bcb8474d`
- **Install:** `sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb`
- **Binary Path:** `/usr/bin/titane-infinity`

### RPM Package (RedHat/Fedora)
- **File:** TITANE-Infinity-27.0.5-1.x86_64.rpm
- **Size:** 13.8 MB
- **SHA256:** `98fc3f16a6b3ef88839757a10d2a898bddc97370590cfa0a2b600ebb99dd701d`
- **Install:** `sudo rpm -i TITANE-Infinity-27.0.5-1.x86_64.rpm`

## Deployment Checklist

- [x] Token validated (`GO_FOR_PROD_DEPLOY__TITANE_INFINITY`)
- [x] AppImage/DEB/RPM copied to `deployment/latest/`
- [x] `SHA256SUMS_v27.0.5.txt` generated
- [x] `SIZES_v27.0.5.txt` generated
- [x] Active manifest `MANIFEST.json` updated to v27.0.5

---

**Status:** ✅ READY FOR DISTRIBUTION
