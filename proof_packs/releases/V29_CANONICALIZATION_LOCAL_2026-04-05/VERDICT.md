# VERDICT — V29_CANONICALIZATION_LOCAL_2026-04-05

- **Date:** 2026-04-05
- **Verdict:** PASS
- **Scope:** Local canonicalisation of the active `29.0.0` truth across web/PWA metadata, Tauri titles, Linux launcher flow, and active documentation surfaces.

## Canonical result

A single active local truth is now exposed as **V29.0.0** on the primary repository surfaces:

- repo authorities: `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
- stable runtime: `runtime/stable/tauri.conf.json`, `runtime/stable/manifest.json`
- deployment metadata: `deployment/latest/MANIFEST.json`, `CHECKSUMS.sha256`, `CHECKSUMS.txt`, `SHA256SUMS.txt`, `SIZES.txt`
- visible UI/launcher surfaces: `index.html`, `public/manifest.json`, `titane-infinity.desktop`, `launch-titane.sh`

## Proof summary

1. **Drift scan**
   - Command: `rg -n '26\.3\.0|26\.2\.0-dev|vite\.svg|Checksums courants v28\.88\.0' index.html public/manifest.json runtime/dev README.md titane-infinity.desktop`
   - Result: `STALE_MATCHES_NONE`

2. **Tauri config validation**
   - Command: `pnpm run verify:tauri-configs`
   - Result: `Base: 29.0.0`, `Dev: 29.0.0-dev`, `Stable: 29.0.0` → `✅ Configurations Tauri valides`

3. **Repo gates**
   - Commands:
     - `pnpm run lint`
     - `pnpm run format:check`
     - `pnpm run check`
     - `pnpm run verify:tauri-only`
   - Result: all returned successfully; `Tauri-only enforced: 0 erreurs`

4. **Deployment checksum truth**
   - Command: `cd deployment/latest && sha256sum -c CHECKSUMS.sha256`
   - Result:
     - `Titan-Stable_29.0.0_amd64.AppImage: Réussi`
     - `Titan-Stable_29.0.0_amd64.deb: Réussi`

5. **Launcher proof**
   - Commands:
     - `bash scripts/update-desktop-icon.sh`
     - `grep -E '^(Name|Exec|Icon)=' ~/.local/share/applications/titane-infinity.desktop`
   - Result:
     - `Name=TITANE∞ v29.0.0`
     - `Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/launch-titane.sh`
     - `Icon=/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/icons/128x128.png`

6. **Launcher smoke run**
   - Command: `timeout 12s ./launch-titane.sh`
   - Result: wrapper selected `/deployment/latest/Titan-Stable_29.0.0_amd64.AppImage` and reached `UI_BOOT_EVENT {"marker":"BOOT:READY"...}` before timeout cut the smoke window.

7. **Governance**
   - Commands:
     - `bash scripts/autoheal/detect_recurrence.sh`
     - `bash scripts/verify_instructions.sh`
   - Result: `PASS`; `SUMMARY: PASS=23 FAIL=0`

8. **Rust regression proof**
   - Command: `pnpm run test:rust`
   - Result: `test result: ok. 4467 passed; 0 failed; 7 ignored; 0 measured; 0 filtered out; finished in 18.27s`

## User-facing verdict

**PASS_V29_CANONICALIZED**
