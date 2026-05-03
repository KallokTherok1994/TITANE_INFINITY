# 03_DEPLOYED_ARTIFACTS_REFERENCE

A) EXEC_MODE: LOCAL
B) SCOPE_RING: Artifact index reference
C) RISK: P0
D) PLAN (<=7 steps):
1. Index final stable AppImage.
2. Index coherent deb artifact reference.
3. Pin latest manifest and sha pointers.
4. Record effective version and distribution path.
E) PROOFS:
- `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`
- `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/03_deployed_appimage.sha256`
- `deployment/latest/TITANE-Infinity_27.2.0_amd64.deb`
- `deployment/latest/MANIFEST.json`
- `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_post_checks.env`
F) ROLLBACK:
- N/A (reference only).

Deployed artifact index (canonical baseline):
- Stable AppImage (prod final): `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`
- Stable AppImage sha256: `020845e77ee49a19714900618dfa7f8b71eb6532dfc9624bd49ac3d4b12fa0ed`
- Coherent deb present: `deployment/latest/TITANE-Infinity_27.2.0_amd64.deb`
- Latest manifest: `deployment/latest/MANIFEST.json`
- Effective production version: `27.2.0`
- Distribution pointer: `deployment/latest/`
