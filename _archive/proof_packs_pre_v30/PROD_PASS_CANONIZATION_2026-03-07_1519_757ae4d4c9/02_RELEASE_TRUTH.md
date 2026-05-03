# 02_RELEASE_TRUTH

A) EXEC_MODE: LOCAL
B) SCOPE_RING: Release truth freeze
C) RISK: P0
D) PLAN (<=7 steps):
1. Pin commit/version truth.
2. Enumerate produced artifact truth.
3. Enumerate deployed artifact truth.
4. Pin manifest and integrity truth.
5. Record touched deployment surface only.
E) PROOFS:
- Commit reference: `757ae4d4c9`
- Build summary: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/02_appimage_build.summary.txt`
- Build candidate: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/02_appimage_candidates.txt`
- Deploy log: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/03_DEPLOY_EXECUTION.log`
- Post-check integrity: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_post_checks.env`
- Latest manifest: `deployment/latest/MANIFEST.json`
F) ROLLBACK:
- N/A (truth capture only).

Release truth:
- Reference commit: `757ae4d4c9`
- Release version: `27.2.0`
- Produced stable artifact: `src-tauri/target/release/bundle/appimage/Titan-Stable_27.2.0_amd64.AppImage`
- Deployed stable artifact: `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`
- Old stable artifact removed from latest: `deployment/latest/Titan-Stable_27.0.5_amd64.AppImage`
- Deployed manifest includes version `27.2.0` and appimage sha256 `020845e77ee49a19714900618dfa7f8b71eb6532dfc9624bd49ac3d4b12fa0ed`
- Integrity statement: `APP_VERSION_MATCH=YES`

Exact touched deployment surface:
- `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage` (added/active)
- `deployment/latest/Titan-Stable_27.0.5_amd64.AppImage` (removed)
- `deployment/latest/MANIFEST.json` (synchronized metadata)
