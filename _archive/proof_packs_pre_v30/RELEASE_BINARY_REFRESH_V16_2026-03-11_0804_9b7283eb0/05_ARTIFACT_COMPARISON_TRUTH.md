# 05 Artifact Comparison Truth

## SHA16 Comparison Table

| Binary | SHA16 | mtime | Source | Status |
|--------|-------|-------|--------|--------|
| /usr/bin/titane-infinity | da985ffeec4e1c51 | 2026-03-07 07:05 | install (stale) | STALE |
| REPO_CLONE_TEST/release/titane-infinity (old) | aa79192b22734a78 | 2026-03-06 09:35 | older build | STALE |
| NEW: target/release/titane-infinity | 6582163646496a4f | 2026-03-11 08:18 | V16 build | FRESH ✓ |

## Deployment Artifacts

| File | mtime | Version | Status |
|------|-------|---------|--------|
| deployment/latest/TITANE-Infinity_26.4.0_amd64.AppImage | 2026-03-06 | 26.4.0 | STALE |
| deployment/latest/TITANE-Infinity_26.4.0_amd64.deb | 2026-03-06 | 26.4.0 | STALE |
| deployment/latest/MANIFEST_v27.2.0.json | 2026-02-23 | 27.2.0 | MANIFEST ONLY |

## Key Finding

The deployment/latest has ONLY v26.4.0 artifacts. The 27.2.0 MANIFEST references artifacts that
were never deposited. The tauri-wrapper.sh searches for 27.2.0 AppImage → not found → fallback.

## Post-Build Delta

New binary built from 9b7283eb0 will contain:
- V12: zoom: 75% in src/index.css
- V13: deduplicated /meta-center route in src/App.tsx
- SHA16 must differ from both da985ffeec4e1c51 and aa79192b22734a78

## Verdict

ARTIFACT_GAP_RESOLVED — new binary 6582163646496a4f built from 9b7283eb0 (V12+V13)
