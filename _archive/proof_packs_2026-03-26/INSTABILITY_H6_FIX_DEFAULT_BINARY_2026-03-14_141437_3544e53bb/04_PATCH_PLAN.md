# 04 PATCH PLAN

## ISSUE TABLE

| ISSUE_ID | LAYER | SYMPTOM | ROOT_CAUSE_CANDIDATE | PATCHABLE_HERE? | RISK |
|---|---|---|---|---|---|
| H6 | E2E test config | WDIO default binary = AppImage (pre-patch) | wdio.desktop.conf.cjs hardcoded AppImage path | YES | LOW (single file, logic only) |

## Applied Patch

**File**: `wdio.desktop.conf.cjs`

**Before**:
```javascript
const APP_PATH = process.env.TAURI_BINARY_PATH
  ? path.resolve(process.env.TAURI_BINARY_PATH)
  : path.resolve(ROOT, 'deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage');
```

**After**:
```javascript
// H6-FIX: release binary (patched, current timeout) > AppImage (may be stale/pre-patch)
const RELEASE_BINARY_PATH = path.resolve(ROOT, 'src-tauri/target/release/titane-infinity');
const APPIMAGE_FALLBACK_PATH = path.resolve(ROOT, 'deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage');
const APP_PATH = process.env.TAURI_BINARY_PATH
  ? path.resolve(process.env.TAURI_BINARY_PATH)
  : fs.existsSync(RELEASE_BINARY_PATH)
  ? RELEASE_BINARY_PATH
  : APPIMAGE_FALLBACK_PATH;
```

## Why this is safe and minimal
- Single file change (E2E config only)
- No Rust code change, no business logic change
- `TAURI_BINARY_PATH` override still honored (highest priority)
- AppImage is still used as fallback (no binary dependency broken)
- `fs.existsSync()` prevents crash if neither binary is present
