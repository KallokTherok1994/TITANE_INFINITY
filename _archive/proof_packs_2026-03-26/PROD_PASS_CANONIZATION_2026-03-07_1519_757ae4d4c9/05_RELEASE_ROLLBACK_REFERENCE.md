# 05_RELEASE_ROLLBACK_REFERENCE

A) EXEC_MODE: LOCAL
B) SCOPE_RING: Rollback reference freeze
C) RISK: P0
D) PLAN (<=7 steps):
1. Record known rollback artifact source.
2. Record restoration target path.
3. Record expected validation after restoration.
4. Record boundaries and limitations.
E) PROOFS:
- Backup artifact evidence: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/backup_Titan-Stable_27.0.5_amd64.AppImage`
- Backup checksum evidence: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/backup_appimage.sha256`
- Deployed replacement evidence: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/03_DEPLOY_EXECUTION.log`
- Existing rollback doc: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/ROLLBACK.md`
F) ROLLBACK:
- This document is itself rollback metadata; no execution performed.

Reference rollback posture (no re-execution in this run):
- Applicable if future anomaly is proven on `Titan-Stable_27.2.0_amd64.AppImage`.
- Previous replaced stable artifact reference: `Titan-Stable_27.0.5_amd64.AppImage` backup is available.
- Restoration point: `deployment/latest/` stable AppImage slot.
- Validation after rollback: run the known smoke path and verify boot markers.
- Known limit: rollback changes artifact baseline and must be executed only under explicit future incident scope.
