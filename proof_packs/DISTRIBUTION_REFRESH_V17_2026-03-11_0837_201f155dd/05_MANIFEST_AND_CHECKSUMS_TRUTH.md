# 05 Manifest and Checksums Truth

## Updated metadata

- `deployment/latest/MANIFEST_v27.2.0.json`
- `deployment/latest/MANIFEST.json`
- `deployment/latest/CHECKSUMS.sha256`
- `deployment/latest/SHA256SUMS.txt`
- `deployment/latest/SHA256SUMS_v27.2.0.txt`
- `deployment/latest/SIZES_v27.2.0.txt`

## Canonical hashes

- AppImage `TITANE-Infinity_27.2.0_amd64.AppImage`
  - SHA256: `640c11346eb7102b6dedd6bc68496c5cc56842510407fe256dacf461c517638f`
- deb `TITANE-Infinity_27.2.0_amd64.deb`
  - SHA256: `105f2cf3e133b97505372c9e1541e578adb530ab53d6abc310826095de85760e`
- binary `titane-infinity`
  - SHA256: `99a342d67de079e8b768428c04aeda5d1fc164ed1366cf68cd8baf5d7611381c`

## Coherence checks

- `MANIFEST_v27.2.0.json` points to existing files in `deployment/latest`
- `tag_commit` updated to `201f155dd5c8699a0e2651c5e21ccea8125d79a1`
- `sha256sum -c deployment/latest/CHECKSUMS.sha256`:
  - AppImage: PASS
  - deb: PASS
  - binary: PASS

## Raw evidence

- `raw/04_latest_refresh_and_manifest.log`
- `raw/05_manifest_checksums_latest_verify.log`
