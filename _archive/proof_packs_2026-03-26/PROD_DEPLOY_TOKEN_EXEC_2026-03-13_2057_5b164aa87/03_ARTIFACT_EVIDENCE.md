# 03 Artifact Evidence

## Stable Artifacts

1. `runtime/stable/Titan-Stable_27.2.0_amd64.AppImage`
- Size bytes: `88549880`
- SHA256: `4f3e48d38d6a3198e143470e1e6e7ec7bace8de2caa201f7dadf208b3defee93`

2. `src-tauri/target/release/bundle/deb/Titan-Stable_27.2.0_amd64.deb`
- Size bytes: `13261038`
- SHA256: `2c2dbd194119be468ed54cf5c29d3c0fb2dc1a85dc4aa3c2f78184a99abc2718`

## Runtime Probe

- Command: `timeout 30 runtime/stable/Titan-Stable_27.2.0_amd64.AppImage --appimage-version`
- Result: `EXIT_CODE=0`
- Evidence: `proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87/raw/03_appimage_version_probe.txt`

## Raw Artifact Source

- `proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87/raw/02_artifacts.txt`
