# TITANE Infinity v27.0.5 - Production Deployment Manifest

**Release Date:** 22 février 2026  
**Deployment Status:** ✅ LIVE  
**Authorization Token:** GO_FOR_PROD_DEPLOY__TITANE_INFINITY

## Artifact Registry

### AppImage (Linux Universal)
- **File:** TITANE-Infinity_27.0.5_amd64.AppImage
- **Size:** 89.2 MB
- **SHA256:** `90ff21ab844bc6050938938c148cea90840ff7772a22f7ef4f0c4a33f7d88cda`
- **Permissions:** 755 (executable)
- **Usage:** `./TITANE-Infinity_27.0.5_amd64.AppImage`

### DEB Package (Debian/Ubuntu)
- **File:** TITANE-Infinity_27.0.5_amd64.deb
- **Size:** 13.8 MB
- **SHA256:** `1cb08e973a43b6bf740dc35108524bbc240ba514780175fde53bbaa69dcb85be`
- **Install:** `sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb`
- **Binary Path:** `/usr/bin/titane-infinity`

### RPM Package (RedHat/Fedora)
- **File:** TITANE-Infinity-27.0.5-1.x86_64.rpm
- **Size:** 13.8 MB
- **SHA256:** `fbed6fe2ec55475afb08b60bcaa979843c2d0b1d66c9295f2d880e07dc9b44e3`
- **Install:** `sudo rpm -i TITANE-Infinity-27.0.5-1.x86_64.rpm`

## Deployment Checklist

- [x] Token validated (`GO_FOR_PROD_DEPLOY__TITANE_INFINITY`)
- [x] AppImage/DEB/RPM copied to `deployment/latest/`
- [x] `SHA256SUMS_v27.0.5.txt` generated
- [x] `SIZES_v27.0.5.txt` generated
- [x] Active manifest `MANIFEST.json` updated to v27.0.5

---

**Status:** ✅ READY FOR DISTRIBUTION
