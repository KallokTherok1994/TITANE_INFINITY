# BUILD ARTIFACTS REPORT — v27.0.0-PRODUCTION

**Date**: 2026-02-04 11:52 UTC  
**Build Duration**: ~6 minutes (Vite: 16s, Cargo: 4m53s, Bundle: 2m)  
**Status**: ✅ **BUILD SUCCESSFUL**

---

## AUTHORIZATION

**Request**: Kevin Thibault explicit "Build production artifacts" (2026-02-04 11:40 UTC)  
**GO Signed**: 2026-02-04 11:35 UTC (v27.0.0-PRODUCTION @ 3baa87d4)  
**Baseline**: v27.0.0-CONSTITUTION @ efc497b4

---

## ARTIFACTS GENERATED

### 1. DEB Package (Debian/Ubuntu)

**File**: `TITANE-Infinity_27.0.0_amd64.deb`  
**Size**: 9.6 MB  
**SHA256**: `2b812e9cb34b0ed5605e286a589a15194f76fd0e275db75072931d20ec6e2e63`

**Install**:

```bash
sudo dpkg -i TITANE-Infinity_27.0.0_amd64.deb
```

---

### 2. RPM Package (Fedora/Red Hat)

**File**: `TITANE-Infinity-27.0.0-1.x86_64.rpm`  
**Size**: 9.6 MB  
**SHA256**: `aa2f569460ddd0220e3047cb4ff7c2b1e5b621024b376b6137069b9c9ba46e7d`

**Install**:

```bash
sudo rpm -i TITANE-Infinity-27.0.0-1.x86_64.rpm
```

---

### 3. AppImage (Universal Linux)

**File**: `TITANE-Infinity_27.0.0_amd64.AppImage`  
**Size**: 82 MB  
**SHA256**: `69dd84310b3b4294032e4a40c095cbf816582d2b6f61b5fdcca43e125a754e0c`

**Run**:

```bash
chmod +x TITANE-Infinity_27.0.0_amd64.AppImage
./TITANE-Infinity_27.0.0_amd64.AppImage
```

---

### 4. Binary (Raw Executable)

**File**: `titane-infinity`  
**Size**: 22 MB  
**SHA256**: `650a5c8b30654de47f15c76990e584d3edec8ca0496cbdf7fb91bdd47a2090e1`

**Run**:

```bash
chmod +x titane-infinity
./titane-infinity
```

---

## BUILD PROCESS

### Phase 1: Frontend Build (Vite)

**Command**: `pnpm exec vite build`  
**Duration**: 16.45s  
**Output**: `dist/` (192 KB CSS, 3.9 MB JS compressed)

**Key Metrics**:

- 3435 modules transformed
- Workbox: 100 files precached (3952 KB)
- Compression: gzip + brotli
- Largest chunks:
  - `react-vendor-DaW5AQ_k.js`: 545 KB (171 KB gzipped)
  - `onnxruntime-DvPL2jGu.js`: 545 KB (130 KB gzipped)
  - `devtools-sudo-D-64fS8L.js`: 361 KB (98 KB gzipped)

**Warnings** (non-blocking):

- 9 circular chunk warnings (expected in complex dependency graphs)
- 1 dynamic import warning (RealTimeCharts.tsx)

---

### Phase 2: Rust Backend Build (Cargo)

**Command**: `cargo build --release`  
**Duration**: 4m 53s  
**Target**: `src-tauri/target/release/titane-infinity`

**Profile**: release (optimized)  
**Binary Size**: 22 MB (stripped, optimized)

---

### Phase 3: Bundle Generation (Tauri CLI)

**Bundles Created**: 3 (DEB, RPM, AppImage)  
**Duration**: ~2 minutes

**Process**:

1. Binary patching for each format
2. DEB: dpkg-deb packaging
3. RPM: rpmbuild packaging
4. AppImage: linuxdeploy + squashfs

---

## BUILD LOGS

**Full Log**: `deployment/v27.0.0-PRODUCTION/logs/build.log`  
**Size**: Available in deployment directory  
**Content**: Complete stdout/stderr capture from `pnpm tauri build`

---

## VERIFICATION

### SHA256 Checksums

**File**: `deployment/v27.0.0-PRODUCTION/SHA256SUMS.txt`

```
2b812e9cb34b0ed5605e286a589a15194f76fd0e275db75072931d20ec6e2e63  TITANE-Infinity_27.0.0_amd64.deb
aa2f569460ddd0220e3047cb4ff7c2b1e5b621024b376b6137069b9c9ba46e7d  TITANE-Infinity-27.0.0-1.x86_64.rpm
69dd84310b3b4294032e4a40c095cbf816582d2b6f61b5fdcca43e125a754e0c  TITANE-Infinity_27.0.0_amd64.AppImage
650a5c8b30654de47f15c76990e584d3edec8ca0496cbdf7fb91bdd47a2090e1  titane-infinity
```

**Verify**:

```bash
cd deployment/v27.0.0-PRODUCTION
sha256sum -c SHA256SUMS.txt
```

---

## DEPLOYMENT DIRECTORY STRUCTURE

```
deployment/v27.0.0-PRODUCTION/
├── TITANE-Infinity_27.0.0_amd64.deb         (9.6 MB)
├── TITANE-Infinity-27.0.0-1.x86_64.rpm      (9.6 MB)
├── TITANE-Infinity_27.0.0_amd64.AppImage    (82 MB)
├── titane-infinity                          (22 MB)
├── SHA256SUMS.txt                           (hashfile)
└── logs/
    └── build.log                            (full build log)
```

**Total Size**: ~123 MB (all artifacts combined)

---

## REGISTRY ENTRY

**Entry ID**: `repo-production-002`  
**Category**: production  
**Scope**: build  
**Change Type**: artifacts  
**Status**: completed

**JSON**:

```json
{
  "id": "repo-production-002",
  "ts": "2026-02-04T11:52:00Z",
  "category": "production",
  "scope": "build",
  "change_type": "artifacts",
  "summary": "Build artifacts generated for v27.0.0-PRODUCTION",
  "reason": "Kevin explicit request 'Build production artifacts'. Tauri build completed successfully with DEB (9.6M), RPM (9.6M), AppImage (82M), and binary (22M)",
  "files_changed": [
    "deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.deb",
    "deployment/v27.0.0-PRODUCTION/TITANE-Infinity-27.0.0-1.x86_64.rpm",
    "deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.AppImage",
    "deployment/v27.0.0-PRODUCTION/titane-infinity",
    "deployment/v27.0.0-PRODUCTION/SHA256SUMS.txt",
    "deployment/v27.0.0-PRODUCTION/logs/build.log"
  ],
  "tests_run": ["N/A - production build"],
  "proofs": ["Build log captured, SHA256 hashes computed, all artifacts verified"],
  "risk_level": "LOW",
  "rollback": "Delete deployment/v27.0.0-PRODUCTION/ directory",
  "status": "completed"
}
```

---

## BASELINE VALIDATION

**Constitutional Lock**: v27.0.0-CONSTITUTION @ efc497b4 ✅  
**Production Tag**: v27.0.0-PRODUCTION @ 3baa87d4 ✅  
**Tests**: 0 failures, 47 passing, 27 skips (READY) ✅  
**Invariants**: 10/10 locked ✅

**Build Source**: Commit `3baa87d4` (production GO signed)

---

## DISTRIBUTION READINESS

**Status**: ✅ **ARTIFACTS READY FOR DISTRIBUTION**

**Next Steps** (when Kevin authorizes):

1. Upload artifacts to distribution platform (GitHub Releases, CDN, etc.)
2. Publish release notes
3. Update documentation with installation instructions
4. Announce to users

**Note**: Distribution requires separate explicit authorization from Kevin Thibault.

---

## TECHNICAL NOTES

### Circular Chunk Warnings

**Impact**: Low (cosmetic, not functional)  
**Affected**: 9 module pairs (onnxruntime, service-ai, ui-layout, etc.)  
**Resolution**: Not blocking, can be optimized in future refactor if needed

### Dynamic Import Warning

**File**: `RealTimeCharts.tsx`  
**Issue**: Dynamically imported but also statically imported  
**Impact**: Minimal (no performance degradation)  
**Resolution**: Non-critical, can be refactored in future

### Binary Size

**AppImage**: 82 MB (includes full runtime + dependencies)  
**DEB/RPM**: 9.6 MB (relies on system libraries)  
**Raw Binary**: 22 MB (stripped, optimized)

**Reason for AppImage size**: Self-contained with all dependencies (ONNX runtime, WebView, etc.)

---

## BUILD ENVIRONMENT

**OS**: Linux (TITANE-OS)  
**Node**: v22+ (via corepack pnpm)  
**Rust**: 1.83+ (cargo release profile)  
**Tauri**: 2.x  
**Vite**: 7.3.1

---

**Build Complete** — 2026-02-04 11:52 UTC

**Status**: ✅ PRODUCTION ARTIFACTS READY
